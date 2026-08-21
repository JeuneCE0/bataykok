-- Retrait de l'Hôtel des Ventes.
--
-- Les grains vivent sur l'appareil : le serveur n'a jamais pu vérifier qu'un
-- acheteur possédait ce qu'il dépensait, ni qu'un vendeur avait réellement
-- trouvé l'objet qu'il mettait en vente. Le marché transformait donc un client
-- modifié en imprimerie, et contaminait les autres joueurs — c'est la seule
-- fonctionnalité où la triche d'un seul abîme la partie de tous.
--
-- On le retire au lieu de le rafistoler. Il reviendra quand l'économie sera
-- arbitrée côté serveur, et il sera alors écrit contre des soldes que la base
-- connaît.
--
-- Retour en arrière : ce fichier supprime des objets et une table. Pour les
-- retrouver, rejouer 0004_marketplace.sql puis les durcissements de 0010. Une
-- seule annonce de test existait au moment du retrait (18/08/2026), aucune
-- donnée de joueur n'est perdue.

drop view if exists public.stats_market;
drop view if exists public.market_board;
drop view if exists public.market_quotes;

-- `stats_overview` comptait les ventes : elle doit perdre ces trois colonnes
-- avant que la table puisse partir. `create or replace` ne sait pas retirer
-- une colonne — il faut la recréer.
drop view if exists public.stats_overview;
create view public.stats_overview as
select
  (select count(*) from koks)                                                          as members,
  (select count(*) from koks where updated_at > now() - interval '5 minutes')          as online_now,
  (select count(*) from koks where updated_at > now() - interval '24 hours')           as active_24h,
  (select count(*) from koks where updated_at > now() - interval '7 days')             as active_7d,
  (select count(*) from koks where created_at > now() - interval '24 hours')           as new_24h,
  (select count(*) from koks where created_at > now() - interval '7 days')             as new_7d,
  (select count(*) from app_events where created_at > now() - interval '24 hours')     as events_24h,
  (select count(distinct session_id) from app_events
    where created_at > now() - interval '24 hours')                                    as sessions_24h,
  (select count(*) from arena_results)                                                 as battles,
  (select count(*) from arena_results where created_at > now() - interval '24 hours')  as battles_24h,
  (select count(*) from referrals)                                                     as referrals,
  (select coalesce(sum(grains), 0) from koks)                                          as grains_total,
  (select coalesce(sum(piments), 0) from koks)                                         as piments_total,
  (select coalesce(round(avg(level)), 0) from koks)                                    as avg_level,
  (select count(*) from guilds)                                                        as guilds;

-- La table d'abord : sa contrainte `market_item_sane` dépend de la fonction
-- de validation, qui ne peut donc pas partir avant elle. Les politiques et les
-- index tombent avec la table.
drop table if exists public.market_listings;

drop function if exists public.buy_listing(uuid);
drop function if exists public.cancel_listing(uuid);
drop function if exists public.claim_market_sales();
drop function if exists public.market_item_is_sane(jsonb, integer, text);
