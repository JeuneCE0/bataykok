-- Purge des données au-delà des durées annoncées dans la politique de
-- confidentialité publique. Sans ce ménage, ces durées ne seraient qu'une
-- phrase sur une page web — et une obligation non tenue.

create extension if not exists pg_cron;

/**
 * Trois ménages, dans cet ordre.
 *
 * 1. Les comptes anonymes qui n'ont jamais créé de coq. L'app ouvre une
 *    session dès le premier lancement, avant même l'écran de création : au
 *    20/08/2026 la base comptait 299 comptes vides pour 8 coqs. Trente jours
 *    de grâce, parce qu'un joueur peut très bien revenir finir sa création.
 *
 * 2. Les comptes dont le coq n'a plus bougé depuis douze mois. `updated_at`
 *    est le bon repère : il suit la publication du snapshot, donc le jeu réel,
 *    là où `last_sign_in_at` bouge à chaque rafraîchissement de jeton.
 *
 * 3. Les événements de jeu de plus de vingt-quatre mois.
 *
 * Les suppressions de comptes se propagent en cascade (koks, combats,
 * parrainages, annonces, dons) ; `app_events.kok_id` passe à NULL, ce qui est
 * exactement ce qu'on veut : l'événement survit, mais plus rien ne le relie à
 * une personne.
 */
create or replace function public.purge_donnees_anciennes()
returns table (comptes_sans_kok bigint, comptes_inactifs bigint, evenements bigint)
language plpgsql
security definer
set search_path = public, auth, pg_temp
as $$
declare
  v_sans_kok bigint;
  v_inactifs bigint;
  v_events   bigint;
begin
  with morts as (
    delete from auth.users u
     where u.is_anonymous
       and u.created_at < now() - interval '30 days'
       and not exists (select 1 from public.koks k where k.id = u.id)
    returning 1
  )
  select count(*) into v_sans_kok from morts;

  with morts as (
    delete from auth.users u
     using public.koks k
     where k.id = u.id
       and k.updated_at < now() - interval '12 months'
    returning 1
  )
  select count(*) into v_inactifs from morts;

  with morts as (
    delete from public.app_events e
     where e.created_at < now() - interval '24 months'
    returning 1
  )
  select count(*) into v_events from morts;

  return query select v_sans_kok, v_inactifs, v_events;
end;
$$;

-- Personne ne l'appelle depuis l'app : elle supprime des comptes.
revoke execute on function public.purge_donnees_anciennes() from public;
revoke execute on function public.purge_donnees_anciennes() from anon, authenticated;

-- 3 h 17 UTC, soit 7 h 17 à La Réunion : hors de l'heure de pointe de jeu.
select cron.unschedule('purge-donnees')
 where exists (select 1 from cron.job where jobname = 'purge-donnees');

select cron.schedule(
  'purge-donnees',
  '17 3 * * *',
  $cron$select public.purge_donnees_anciennes()$cron$
);
