-- Clés étrangères sans index : à la suppression d'un kok, la cascade doit
-- balayer toute la table pour trouver les lignes liées. Invisible à 7 lignes,
-- douloureux à 100 000.

create index if not exists arena_attacker_idx
  on public.arena_results (attacker_id, created_at desc);

create index if not exists guilds_owner_idx on public.guilds (owner_id);

create index if not exists market_buyer_idx
  on public.market_listings (buyer_id) where buyer_id is not null;
