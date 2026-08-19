-- Les vues stats_* étaient lisibles avec la clé publiable — celle qui est
-- embarquée dans l'app. N'importe qui pouvait donc lire le nombre de membres,
-- le volume d'affaires et la fortune de chaque joueur.
--
-- Elles ne servent qu'au tableau de bord, qui interroge la base avec la clé de
-- service (laquelle ignore RLS et droits) : on peut tout retirer aux rôles
-- publics. `ladder` et `market_quotes` restent ouvertes, le jeu en a besoin.

do $$
declare v text;
begin
  for v in
    select table_name from information_schema.views
     where table_schema = 'public' and table_name like 'stats\_%'
  loop
    execute format('revoke all on public.%I from anon, authenticated', v);
    execute format('alter view public.%I set (security_invoker = true)', v);
  end loop;
end $$;

-- Les RPC restaient exécutables sans session. Leur logique refuse déjà un
-- auth.uid() nul, mais autant fermer la porte plutôt que compter dessus.
revoke execute on function public.submit_arena_result(uuid, boolean) from anon;
revoke execute on function public.claim_defenses() from anon;
revoke execute on function public.buy_listing(uuid) from anon;
revoke execute on function public.cancel_listing(uuid) from anon;
revoke execute on function public.claim_market_sales() from anon;
revoke execute on function public.redeem_referral(text) from anon;
revoke execute on function public.claim_referral_rewards() from anon;

-- search_path figé : sans ça, un schéma placé en tête de chemin peut détourner
-- les appels de la fonction.
create or replace function public.gen_referral_code()
returns text
language plpgsql
set search_path = public
as $$
declare
  alphabet text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  code text;
  i int;
begin
  loop
    code := '';
    for i in 1..6 loop
      code := code || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
    end loop;
    exit when not exists (select 1 from public.koks k where k.referral_code = code);
  end loop;
  return code;
end;
$$;
