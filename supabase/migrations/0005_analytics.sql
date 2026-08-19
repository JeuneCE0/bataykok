-- Analytique produit : une seule table d'événements, des vues pour le reste.
-- Volume attendu faible (un jeu, pas un site marchand) : pas de partitionnement.

create table if not exists public.app_events (
  id          bigserial primary key,
  kok_id      uuid references public.koks (id) on delete set null,
  session_id  text not null,
  name        text not null check (char_length(name) between 1 and 60),
  props       jsonb not null default '{}'::jsonb,
  platform    text not null default 'unknown',
  app_version text,
  created_at  timestamptz not null default now()
);

create index if not exists events_time_idx on public.app_events (created_at desc);
create index if not exists events_name_time_idx on public.app_events (name, created_at desc);
create index if not exists events_kok_idx on public.app_events (kok_id, created_at desc);

alter table public.app_events enable row level security;

-- on écrit ses propres événements ; la lecture passe par la clé de service
drop policy if exists events_insert_own on public.app_events;
create policy events_insert_own on public.app_events
  for insert with check (kok_id is null or (select auth.uid()) = kok_id);
