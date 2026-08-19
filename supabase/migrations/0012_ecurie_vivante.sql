-- L'écurie devient un lieu partagé.
--
-- Jusqu'ici : cinq écuries figées, des membres inventés, et un « niveau
-- d'écurie » que chaque joueur payait seul dans son coin. Rejoindre une écurie
-- ne faisait rencontrer personne — c'est le plus gros levier de rétention du
-- genre, laissé inerte.
--
-- Les cinq écuries restent (elles évitent le problème des guildes vides), mais
-- elles sont désormais réellement communes : la caisse est partagée, le niveau
-- profite à tout le monde, et le tableau montre de vrais joueurs.

create table if not exists public.guild_stats (
  guild_key      text primary key,
  level          int    not null default 1 check (level between 1 and 30),
  -- grains versés depuis le dernier palier
  pot            bigint not null default 0 check (pot >= 0),
  total_donated  bigint not null default 0 check (total_donated >= 0),
  updated_at     timestamptz not null default now()
);

insert into public.guild_stats (guild_key)
values ('volcan'), ('mafate'), ('chaudron'), ('lagon'), ('kabar')
on conflict (guild_key) do nothing;

create table if not exists public.guild_donations (
  id         uuid primary key default gen_random_uuid(),
  kok_id     uuid not null references public.koks (id) on delete cascade,
  guild_key  text not null references public.guild_stats (guild_key) on delete cascade,
  amount     int  not null check (amount between 1 and 100000),
  created_at timestamptz not null default now()
);

create index if not exists guild_don_recent_idx
  on public.guild_donations (guild_key, created_at desc);
create index if not exists guild_don_kok_idx
  on public.guild_donations (kok_id, created_at desc);

alter table public.guild_stats     enable row level security;
alter table public.guild_donations enable row level security;

-- Le tableau des écuries est public : c'est ce qu'on regarde avant de choisir.
drop policy if exists guild_stats_read on public.guild_stats;
create policy guild_stats_read on public.guild_stats for select using (true);

drop policy if exists guild_don_read on public.guild_donations;
create policy guild_don_read on public.guild_donations for select using (true);

/** Palier à atteindre pour passer au niveau suivant. */
create or replace function public.guild_threshold(p_level int)
returns bigint
language sql immutable
set search_path = public, pg_temp
as $$
  select (5000 * power(1.55, greatest(0, p_level - 1)))::bigint;
$$;

/**
 * Verser des grains à la caisse de son écurie.
 *
 * Les grains vivent sur l'appareil : le serveur ne peut pas vérifier que le
 * joueur les possédait. Le plafond journalier borne donc l'abus — un compte
 * jetable ne peut pas propulser une écurie à lui seul, et le niveau ne donne
 * qu'un bonus modeste de toute façon.
 */
create or replace function public.donate_to_guild(p_amount int)
returns table (guild_key text, level int, pot bigint, threshold bigint, leveled boolean)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me     uuid := (select auth.uid());
  v_guild  text;
  v_today  bigint;
  v_row    public.guild_stats;
  v_up     boolean := false;
begin
  if v_me is null then raise exception 'authentification requise'; end if;
  if p_amount is null or p_amount < 1 then raise exception 'montan invalid'; end if;

  select k.guild_key into v_guild from public.koks k where k.id = v_me;
  if v_guild is null then raise exception 'ou lé dan okin lékiri'; end if;

  select coalesce(sum(d.amount), 0) into v_today
    from public.guild_donations d
   where d.kok_id = v_me and d.created_at > now() - interval '1 day';

  if v_today + p_amount > 50000 then
    raise exception 'plafon zournalié atin — reviens domin';
  end if;

  insert into public.guild_donations (kok_id, guild_key, amount)
  values (v_me, v_guild, p_amount);

  update public.guild_stats g
     set pot = g.pot + p_amount,
         total_donated = g.total_donated + p_amount,
         updated_at = now()
   where g.guild_key = v_guild
  returning * into v_row;

  -- plusieurs paliers peuvent tomber d'un coup sur un gros versement
  while v_row.level < 30 and v_row.pot >= public.guild_threshold(v_row.level) loop
    update public.guild_stats g
       set pot = g.pot - public.guild_threshold(g.level),
           level = g.level + 1,
           updated_at = now()
     where g.guild_key = v_guild
    returning * into v_row;
    v_up := true;
  end loop;

  return query
    select v_row.guild_key, v_row.level, v_row.pot,
           public.guild_threshold(v_row.level), v_up;
end;
$$;

revoke all on function public.donate_to_guild(int) from public, anon;
grant execute on function public.donate_to_guild(int) to authenticated;

/**
 * Tableau des écuries : niveau, caisse, effectif réel.
 *
 * Vue aux droits de son propriétaire — `koks` n'est lisible que par son
 * propriétaire depuis 0010, mais l'effectif d'une écurie doit se voir avant
 * d'y entrer.
 */
create or replace view public.guild_board
with (security_invoker = false) as
  select g.guild_key,
         g.level,
         g.pot,
         public.guild_threshold(g.level) as threshold,
         g.total_donated,
         (select count(*) from public.koks k where k.guild_key = g.guild_key) as members
    from public.guild_stats g;

grant select on public.guild_board to authenticated, anon;

/** Les membres d'une écurie — de vrais joueurs, pas une liste inventée. */
create or replace view public.guild_roster
with (security_invoker = false) as
  select k.guild_key,
         k.id,
         k.name,
         k.class_id,
         k.level,
         k.honor,
         coalesce(
           (select sum(d.amount) from public.guild_donations d where d.kok_id = k.id),
           0
         ) as donated
    from public.koks k
   where k.guild_key is not null;

grant select on public.guild_roster to authenticated;
