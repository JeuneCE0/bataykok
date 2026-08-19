-- Vues du tableau de bord. Une par question qu'on se pose réellement.
-- Réservées au back-office : les droits sont retirés aux rôles publics dans
-- la migration 0008 (elles fuitaient les métriques business).

drop view if exists public.stats_overview;

create view public.stats_overview as
  select
    (select count(*) from public.koks)                                as members,
    (select count(*) from public.koks where updated_at > now() - interval '5 minutes')  as online_now,
    (select count(*) from public.koks where updated_at > now() - interval '24 hours')   as active_24h,
    (select count(*) from public.koks where updated_at > now() - interval '7 days')     as active_7d,
    (select count(*) from public.koks where created_at > now() - interval '24 hours')   as new_24h,
    (select count(*) from public.koks where created_at > now() - interval '7 days')     as new_7d,
    (select count(*) from public.app_events where created_at > now() - interval '24 hours')  as events_24h,
    (select count(distinct session_id) from public.app_events where created_at > now() - interval '24 hours') as sessions_24h,
    (select count(*) from public.arena_results)                       as battles,
    (select count(*) from public.arena_results where created_at > now() - interval '24 hours') as battles_24h,
    (select count(*) from public.market_listings where status = 'sold')  as sales,
    (select count(*) from public.market_listings where status = 'open')  as listings_open,
    (select coalesce(sum(price), 0) from public.market_listings where status = 'sold') as sales_volume,
    (select count(*) from public.referrals)                           as referrals,
    (select coalesce(sum(grains), 0) from public.koks)                as grains_total,
    (select coalesce(sum(piments), 0) from public.koks)               as piments_total,
    (select coalesce(round(avg(level)), 0) from public.koks)          as avg_level,
    (select count(*) from public.guilds)                              as guilds;

create or replace view public.stats_daily as
  select date_trunc('day', created_at)::date as day,
         count(*) as events,
         count(distinct session_id) as sessions,
         count(distinct kok_id) filter (where kok_id is not null) as players
    from public.app_events
   where created_at > now() - interval '30 days'
   group by 1 order by 1;

create or replace view public.stats_events as
  select name, count(*) as total, count(distinct session_id) as sessions,
         max(created_at) as last_seen
    from public.app_events
   where created_at > now() - interval '7 days'
   group by name order by total desc;

create or replace view public.stats_signups as
  select date_trunc('day', created_at)::date as day, count(*) as signups
    from public.koks where created_at > now() - interval '30 days'
   group by 1 order by 1;

create or replace view public.stats_levels as
  select level, count(*) as players from public.koks group by level order by level;

create or replace view public.stats_retention as
  with cohorts as (
    select date_trunc('day', created_at)::date as day, id, updated_at, created_at
      from public.koks where created_at > now() - interval '30 days'
  )
  select day, count(*) as signups,
         count(*) filter (where updated_at >= created_at + interval '1 day')  as d1,
         count(*) filter (where updated_at >= created_at + interval '7 days') as d7
    from cohorts group by day order by day desc;

create or replace view public.stats_classes as
  select class_id, count(*) as players, round(avg(level)) as avg_level,
         coalesce(sum(wins), 0) as wins, coalesce(sum(losses), 0) as losses,
         case when coalesce(sum(wins + losses), 0) = 0 then 0
              else round(100.0 * sum(wins) / sum(wins + losses)) end as winrate
    from public.koks group by class_id order by players desc;

create or replace view public.stats_players as
  select id, name, class_id, level, honor, wins, losses, power,
         grains, piments, dungeon_floor, transport, equipped, album_size,
         jsonb_array_length(talents) as talents,
         platform, app_version, created_at, updated_at,
         (updated_at > now() - interval '5 minutes') as online
    from public.koks order by honor desc, level desc;

create or replace view public.stats_economy as
  select width_bucket(level, 1, 40, 8) as level_bucket, count(*) as players,
         round(avg(grains)) as avg_grains, round(avg(piments)) as avg_piments,
         round(avg(equipped), 1) as avg_equipped, round(avg(dungeon_floor), 1) as avg_floor
    from public.koks group by 1 order by 1;

create or replace view public.stats_market as
  select rarity,
         count(*) filter (where status = 'open') as en_vente,
         count(*) filter (where status = 'sold') as vendus,
         coalesce(round(avg(price) filter (where status = 'sold')), 0) as prix_moyen,
         coalesce(min(price) filter (where status = 'sold'), 0) as prix_min,
         coalesce(max(price) filter (where status = 'sold'), 0) as prix_max
    from public.market_listings group by rarity;

create or replace view public.stats_dungeon as
  select dungeon_floor as floor, count(*) as players
    from public.koks group by dungeon_floor order by dungeon_floor;

create or replace view public.stats_talents as
  select t.value #>> '{}' as talent, count(*) as picks
    from public.koks k, jsonb_array_elements(k.talents) t
   group by 1 order by picks desc;

create or replace view public.stats_platforms as
  select coalesce(platform, 'inconnu') as platform, coalesce(app_version, '—') as version,
         count(*) as players
    from public.koks group by 1, 2 order by players desc;

create or replace view public.stats_battles_daily as
  select date_trunc('day', created_at)::date as day, count(*) as battles,
         count(*) filter (where attacker_won) as attacker_wins
    from public.arena_results where created_at > now() - interval '30 days'
   group by 1 order by 1;

create or replace view public.stats_monetisation as
  select
    (select count(*) from public.app_events where name = 'ad_started')   as ads_started,
    (select count(*) from public.app_events where name = 'ad_completed') as ads_completed,
    (select count(*) from public.app_events where name = 'purchase')     as purchases,
    (select count(distinct kok_id) from public.app_events where name = 'ad_completed') as ad_users,
    (select count(*) from public.referrals)                              as referrals,
    (select count(distinct referrer_id) from public.referrals)           as parrains;

create or replace view public.stats_hourly as
  select extract(hour from created_at at time zone 'Indian/Reunion')::int as hour,
         count(*) as events, count(distinct session_id) as sessions
    from public.app_events where created_at > now() - interval '7 days'
   group by 1 order by 1;
