-- Hôtel des ventes.
--
-- L'objet et les grains vivent sur l'appareil : la base ne sert que de dépôt.
-- Mettre en vente retire l'objet du sak local ; acheter le crédite à
-- l'acheteur ; le vendeur touche ses grains à son prochain passage (comme les
-- défenses). D'où le statut explicite plutôt qu'une simple suppression.

create table if not exists public.market_listings (
  id          uuid primary key default gen_random_uuid(),
  seller_id   uuid not null references public.koks (id) on delete cascade,
  item        jsonb not null,
  slot        text not null,
  rarity      text not null,
  item_level  int  not null check (item_level between 1 and 500),
  price       int  not null check (price between 1 and 100000000),
  status      text not null default 'open' check (status in ('open','sold','cancelled')),
  buyer_id    uuid references public.koks (id) on delete set null,
  sold_at     timestamptz,
  paid_out    boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists market_open_idx
  on public.market_listings (status, slot, rarity, item_level) where status = 'open';
create index if not exists market_seller_idx on public.market_listings (seller_id, status);
create index if not exists market_sold_idx
  on public.market_listings (rarity, slot, sold_at desc) where status = 'sold';
create index if not exists market_buyer_idx
  on public.market_listings (buyer_id) where buyer_id is not null;

alter table public.market_listings enable row level security;

drop policy if exists market_read on public.market_listings;
create policy market_read on public.market_listings
  for select using (status = 'open' or (select auth.uid()) in (seller_id, buyer_id));

drop policy if exists market_insert_own on public.market_listings;
create policy market_insert_own on public.market_listings
  for insert with check ((select auth.uid()) = seller_id and status = 'open');

/** Achat : verrou de ligne, sinon deux acheteurs emportent la même annonce. */
create or replace function public.buy_listing(p_listing uuid)
returns table (item jsonb, price int, seller_name text)
language plpgsql security definer set search_path = public
as $$
declare
  v_me uuid := (select auth.uid());
  v_row public.market_listings;
begin
  if v_me is null then raise exception 'authentification requise'; end if;

  select * into v_row from public.market_listings where id = p_listing for update;

  if v_row.id is null then raise exception 'annons introuvab'; end if;
  if v_row.status <> 'open' then raise exception 'annons déjà partí'; end if;
  if v_row.seller_id = v_me then raise exception 'ou pé pa ashte out prop zafèr'; end if;

  update public.market_listings
     set status = 'sold', buyer_id = v_me, sold_at = now()
   where id = p_listing;

  return query
    select v_row.item, v_row.price, k.name from public.koks k where k.id = v_row.seller_id;
end;
$$;

/** Retrait d'une annonce non vendue : l'objet revient au vendeur. */
create or replace function public.cancel_listing(p_listing uuid)
returns table (item jsonb)
language plpgsql security definer set search_path = public
as $$
declare
  v_me uuid := (select auth.uid());
  v_row public.market_listings;
begin
  select * into v_row from public.market_listings
   where id = p_listing and seller_id = v_me for update;
  if v_row.id is null then raise exception 'annons introuvab'; end if;
  if v_row.status <> 'open' then raise exception 'annons déjà partí'; end if;

  update public.market_listings set status = 'cancelled' where id = p_listing;
  return query select v_row.item;
end;
$$;

/** Le vendeur encaisse ses ventes conclues depuis sa dernière visite. */
create or replace function public.claim_market_sales()
returns table (item_name text, price int, sold_at timestamptz)
language plpgsql security definer set search_path = public
as $$
declare v_me uuid := (select auth.uid());
begin
  if v_me is null then raise exception 'authentification requise'; end if;
  return query
  with paid as (
    update public.market_listings m
       set paid_out = true
     where m.seller_id = v_me and m.status = 'sold' and not m.paid_out
    returning m.item, m.price, m.sold_at
  )
  select (p.item->>'name')::text, p.price, p.sold_at from paid p;
end;
$$;

/**
 * Cote du marché : ce que les objets comparables se sont réellement vendus.
 * Sans historique, un joueur n'a aucune idée d'un prix juste.
 */
create or replace view public.market_quotes
with (security_invoker = true) as
  select slot, rarity,
         width_bucket(item_level, 1, 60, 12) as level_bucket,
         count(*) as sales,
         round(avg(price)) as avg_price,
         percentile_cont(0.5) within group (order by price) as median_price,
         min(price) as min_price, max(price) as max_price
    from public.market_listings
   where status = 'sold' and sold_at > now() - interval '30 days'
   group by slot, rarity, width_bucket(item_level, 1, 60, 12);

revoke all on function public.buy_listing(uuid) from public, anon;
revoke all on function public.cancel_listing(uuid) from public, anon;
revoke all on function public.claim_market_sales() from public, anon;
grant execute on function public.buy_listing(uuid) to authenticated;
grant execute on function public.cancel_listing(uuid) to authenticated;
grant execute on function public.claim_market_sales() to authenticated;
