-- Durcissement du multijoueur.
--
-- Un compte anonyme coûte une requête HTTP : toutes les défenses qui reposaient
-- sur « un joueur ≠ un autre » sont donc nulles. Cette migration ferme quatre
-- portes restées ouvertes depuis le socle.

-- ─── 1. L'honneur cesse d'appartenir au client ───────────────────────────
--
-- `koks_update_own` n'imposait aucune restriction de colonne : un simple PATCH
-- suffisait à se donner honor = 2147483647, ce qui débordait l'int dans
-- submit_arena_result et verrouillait le rang — plus personne ne pouvait vous
-- attaquer.
--
-- Effet de bord réparé au passage : le client publiait son snapshot (honneur
-- local compris) *avant* de relever ses défenses, écrasant la perte d'honneur
-- que submit_arena_result venait d'inscrire. Aucune défense perdue n'a jamais
-- coûté un point à personne.
--
-- Attention (piège Supabase) : le grant de table par défaut écrase le grant de
-- colonne. Il faut révoquer d'abord, puis rouvrir colonne par colonne.

revoke insert, update on public.koks from authenticated, anon;

grant insert (
  id, name, class_id, level, appearance, attrs,
  weapon_min, weapon_max, armor, power,
  wins, losses, guild_id, guild_key,
  grains, piments, dungeon_floor, talents, transport,
  album_size, equipped, app_version, platform, updated_at
) on public.koks to authenticated;

grant update (
  name, class_id, level, appearance, attrs,
  weapon_min, weapon_max, armor, power,
  wins, losses, guild_id, guild_key,
  grains, piments, dungeon_floor, talents, transport,
  album_size, equipped, app_version, platform, updated_at
) on public.koks to authenticated;

-- ─── 2. La table des koks n'est plus publique ────────────────────────────
--
-- `koks_read using(true)` exposait grains, piments, plateforme, version d'app
-- et surtout `referral_code` — de quoi reconstituer tout le tableau de bord
-- sans session, et de quoi moissonner les codes de parrainage.
-- Le classement passe désormais par une vue qui ne montre que le combat.

drop policy if exists koks_read on public.koks;
create policy koks_read_own on public.koks
  for select using ((select auth.uid()) = id);

-- La vue tourne avec les droits de son propriétaire : c'est elle, et elle
-- seule, qui ouvre les colonnes publiques.
drop view if exists public.ladder;
create view public.ladder
with (security_invoker = false) as
  select id, name, class_id, level, appearance, attrs,
         weapon_min, weapon_max, armor, power, honor, wins, losses,
         rank() over (order by honor desc, level desc, created_at asc) as rank
    from public.koks;

grant select on public.ladder to authenticated, anon;

-- La cote du marché agrège des ventes conclues : en `security_invoker`, la RLS
-- du lecteur masquait les lignes vendues et la vue renvoyait toujours vide.
drop view if exists public.market_quotes;
create view public.market_quotes
with (security_invoker = false) as
  select slot, rarity,
         width_bucket(item_level, 1, 60, 12) as level_bucket,
         count(*) as sales,
         round(avg(price)) as avg_price,
         percentile_cont(0.5) within group (order by price) as median_price,
         min(price) as min_price, max(price) as max_price
    from public.market_listings
   where status = 'sold' and sold_at > now() - interval '30 days'
   group by slot, rarity, width_bucket(item_level, 1, 60, 12);

grant select on public.market_quotes to authenticated;

-- ─── 3. Le marché ne peut plus imprimer de monnaie ───────────────────────
--
-- `item` était un jsonb libre : on forgeait un objet à 999 999 de Force et il
-- entrait dans le sak d'un vrai joueur. Et `price` allait jusqu'à 100 000 000
-- sans rapport avec l'objet — lister à 100 M, acheter avec un compte jetable,
-- encaisser. En boucle.

/**
 * Valeur plausible d'un objet, d'après son seul niveau et sa gamme. Sert de
 * borne : le serveur ne simule pas le jeu, il refuse l'invraisemblable.
 */
create or replace function public.item_value_ceiling(p_level int, p_rarity text)
returns bigint
language sql immutable
as $$
  select (
    -- (1 + niveau × 0,42) × multiplicateur de gamme × 4 bonus, large marge ×3
    (1 + p_level * 0.42)
    * case p_rarity
        when 'commun' then 1.0 when 'korek'  then 1.35 when 'kalite' then 1.8
        when 'rar'    then 2.4 when 'lezand' then 3.2  when 'mitik'  then 4.4
        when 'zanset' then 6.5 else 1.0 end
    * 4 * 3
  )::bigint;
$$;

/** Un objet déposé au marché est-il cohérent avec ce qu'il prétend être ? */
create or replace function public.market_item_is_sane(p_item jsonb, p_level int, p_rarity text)
returns boolean
language plpgsql immutable
as $$
declare
  v_cap    bigint := public.item_value_ceiling(p_level, p_rarity);
  v_bonus  jsonb  := coalesce(p_item -> 'bonuses', '{}'::jsonb);
  v_key    text;
  v_val    numeric;
begin
  if jsonb_typeof(p_item) <> 'object' then return false; end if;
  if coalesce(p_item ->> 'name', '') = '' then return false; end if;
  if (p_item ->> 'slot') not in
     ('arme','tete','torse','pattes','amulette','anneau','ceinture','grigri') then
    return false;
  end if;
  if (p_item ->> 'rarity') is distinct from p_rarity then return false; end if;
  if (p_item ->> 'level')::int is distinct from p_level then return false; end if;

  -- aucun attribut au-dessus du plafond de gamme
  for v_key, v_val in select * from jsonb_each_text(v_bonus) loop
    if v_key not in ('force','adresse','esprit','endurance','chance') then return false; end if;
    if v_val::numeric < 0 or v_val::numeric > v_cap then return false; end if;
  end loop;

  -- dégâts et armure sur la même échelle
  if coalesce((p_item ->> 'dmgMax')::numeric, 0) > v_cap * 2 then return false; end if;
  if coalesce((p_item ->> 'armor')::numeric, 0) > v_cap * 2 then return false; end if;

  return true;
end;
$$;

alter table public.market_listings
  drop constraint if exists market_item_sane;
alter table public.market_listings
  add constraint market_item_sane
  check (public.market_item_is_sane(item, item_level, rarity));

-- Le prix reste borné par ce que l'objet vaut : un objet de niveau 20 ne se
-- liste plus à 100 millions.
alter table public.market_listings
  drop constraint if exists market_listings_price_check;
alter table public.market_listings
  add constraint market_price_plausible
  check (price between 1 and public.item_value_ceiling(item_level, rarity) * 400);

-- ─── 4. Garde-fous de cadence ────────────────────────────────────────────
--
-- Sans plafond, un script peut soumettre des milliers de batailles à la
-- seconde et faire fondre l'honneur de toute l'échelle.

create index if not exists arena_attacker_recent_idx
  on public.arena_results (attacker_id, created_at desc);

create or replace function public.submit_arena_result(
  p_defender uuid,
  p_attacker_won boolean
)
returns table (new_honor int, defender_honor int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attacker uuid := (select auth.uid());
  v_delta    int;
  v_recent   int;
begin
  if v_attacker is null then
    raise exception 'authentification requise';
  end if;
  if v_attacker = p_defender then
    raise exception 'un kok i bat pa a li-mem';
  end if;

  -- Les jetons de batay se rechargent toutes les 2 minutes, soit 30 par heure
  -- au grand maximum. 60 laisse la place aux pubs et aux achats de jetons.
  select count(*) into v_recent
    from public.arena_results
   where attacker_id = v_attacker
     and created_at > now() - interval '1 hour';
  if v_recent >= 60 then
    raise exception 'tro de batay dan l’èr — atann in pé';
  end if;

  v_delta := case when p_attacker_won then 8 else -5 end;

  insert into public.arena_results (attacker_id, defender_id, attacker_won, honor_delta)
  values (v_attacker, p_defender, p_attacker_won, v_delta);

  update public.koks
     set honor = greatest(0, honor + v_delta),
         updated_at = now()
   where id = v_attacker;

  update public.koks
     set honor = greatest(0, honor - v_delta),
         updated_at = now()
   where id = p_defender;

  return query
    select k.honor, d.honor
      from public.koks k, public.koks d
     where k.id = v_attacker and d.id = p_defender;
end;
$$;

revoke all on function public.submit_arena_result(uuid, boolean) from public, anon;
grant execute on function public.submit_arena_result(uuid, boolean) to authenticated;
