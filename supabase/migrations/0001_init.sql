-- Batay Kok — socle multijoueur asynchrone.
--
-- Principe repris de Shakes & Fidget : on n'affronte jamais un joueur en
-- direct, mais un *snapshot* de ses statistiques. Aucun temps réel requis,
-- donc aucun serveur de jeu — Postgres suffit.

create extension if not exists "pgcrypto";

-- ─── Koks ────────────────────────────────────────────────────────────────

create table if not exists public.koks (
  id            uuid primary key references auth.users (id) on delete cascade,
  name          text not null check (char_length(name) between 1 and 20),
  class_id      text not null check (class_id in ('gep','malin','tizane','sovaz','piman','sega')),
  level         int  not null default 1 check (level between 1 and 500),
  appearance    jsonb not null,
  -- snapshot de combat : ce que les autres joueurs affrontent
  attrs         jsonb not null,
  weapon_min    int  not null default 1,
  weapon_max    int  not null default 2,
  armor         int  not null default 0,
  power         int  not null default 0,
  honor         int  not null default 100,
  wins          int  not null default 0,
  losses        int  not null default 0,
  guild_id      uuid,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- le classement se lit par honneur : un index dédié, la table sera lue bien
-- plus souvent qu'écrite
create index if not exists koks_honor_idx on public.koks (honor desc, level desc);
create index if not exists koks_guild_idx on public.koks (guild_id) where guild_id is not null;

-- ─── Écuries ─────────────────────────────────────────────────────────────

create table if not exists public.guilds (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique check (char_length(name) between 2 and 24),
  motto      text not null default '',
  emblem     text not null default '🐓',
  level      int  not null default 1,
  owner_id   uuid not null references public.koks (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.koks
  add constraint koks_guild_fk
  foreign key (guild_id) references public.guilds (id) on delete set null;

-- ─── Résultats de batay ──────────────────────────────────────────────────

create table if not exists public.arena_results (
  id          uuid primary key default gen_random_uuid(),
  attacker_id uuid not null references public.koks (id) on delete cascade,
  defender_id uuid not null references public.koks (id) on delete cascade,
  attacker_won boolean not null,
  honor_delta int not null default 0,
  created_at  timestamptz not null default now(),
  constraint no_self_fight check (attacker_id <> defender_id)
);

create index if not exists arena_defender_idx
  on public.arena_results (defender_id, created_at desc);

-- ─── RLS ─────────────────────────────────────────────────────────────────
-- Les snapshots sont publics par nature (c'est le classement), mais chacun
-- n'écrit que le sien.

alter table public.koks          enable row level security;
alter table public.guilds        enable row level security;
alter table public.arena_results enable row level security;

drop policy if exists koks_read on public.koks;
create policy koks_read on public.koks
  for select using (true);

drop policy if exists koks_write_own on public.koks;
create policy koks_write_own on public.koks
  for insert with check ((select auth.uid()) = id);

drop policy if exists koks_update_own on public.koks;
create policy koks_update_own on public.koks
  for update using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists guilds_read on public.guilds;
create policy guilds_read on public.guilds
  for select using (true);

drop policy if exists guilds_insert on public.guilds;
create policy guilds_insert on public.guilds
  for insert with check ((select auth.uid()) = owner_id);

drop policy if exists guilds_update_owner on public.guilds;
create policy guilds_update_owner on public.guilds
  for update using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists arena_read on public.arena_results;
create policy arena_read on public.arena_results
  for select using (true);

-- l'écriture d'un résultat passe uniquement par la fonction ci-dessous
drop policy if exists arena_no_direct_insert on public.arena_results;

-- ─── Résolution d'une batay ──────────────────────────────────────────────
-- La V1 fait confiance au client sur l'issue du combat (le moteur est
-- déterministe et tourne en local). Le durcissement V2 consiste à porter
-- game/combat.ts en plpgsql et à recalculer l'issue ici : la signature de
-- cette fonction est déjà celle qu'il faudra, seul le corps changera.

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
begin
  if v_attacker is null then
    raise exception 'authentification requise';
  end if;
  if v_attacker = p_defender then
    raise exception 'un kok i bat pa a li-mem';
  end if;

  v_delta := case when p_attacker_won then 8 else -5 end;

  insert into public.arena_results (attacker_id, defender_id, attacker_won, honor_delta)
  values (v_attacker, p_defender, p_attacker_won, v_delta);

  update public.koks
     set honor = greatest(0, honor + v_delta),
         wins  = wins  + case when p_attacker_won then 1 else 0 end,
         losses = losses + case when p_attacker_won then 0 else 1 end,
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

revoke all on function public.submit_arena_result(uuid, boolean) from public;
grant execute on function public.submit_arena_result(uuid, boolean) to authenticated;

-- ─── Classement ──────────────────────────────────────────────────────────
-- Vue lue par l'app : les adversaires potentiels, ordonnés par honneur.

create or replace view public.ladder
with (security_invoker = true) as
  select id, name, class_id, level, appearance, attrs,
         weapon_min, weapon_max, armor, power, honor, wins, losses,
         rank() over (order by honor desc, level desc, created_at asc) as rank
    from public.koks;
