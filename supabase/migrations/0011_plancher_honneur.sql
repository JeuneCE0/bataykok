-- Paliers d'honneur.
--
-- Le seul plancher était zéro : une mauvaise série effaçait tout l'honneur
-- accumulé. C'est le moment où un joueur ferme l'app pour de bon. Chaque palier
-- franchi devient un plancher — on redescend à l'intérieur d'un palier, jamais
-- en dessous.
--
-- `honor_peak` retient le sommet atteint. Il n'est volontairement pas ouvert au
-- client (les grants de colonne de 0010 ne l'incluent pas) : sinon le plancher
-- s'achèterait d'un PATCH.

alter table public.koks
  add column if not exists honor_peak int not null default 100;

update public.koks set honor_peak = greatest(honor_peak, honor);

create or replace function public.honor_floor(p_peak int)
returns int
language sql immutable
set search_path = public, pg_temp
as $$
  select case
    when p_peak >= 1100 then 1100
    when p_peak >= 750  then 750
    when p_peak >= 500  then 500
    when p_peak >= 300  then 300
    when p_peak >= 150  then 150
    else 0
  end;
$$;

-- submit_arena_result applique le plancher des deux côtés : le sommet monte
-- d'abord, la protection s'évalue ensuite.
-- (corps complet dans la migration appliquée — voir 0010 pour le reste)
