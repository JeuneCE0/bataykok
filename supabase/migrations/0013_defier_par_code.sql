-- Défier un ami par son code.
--
-- Le code de parrainage servait uniquement à inviter. Il devient aussi une
-- adresse de duel : on cherche le kok qui le porte et on récupère de quoi le
-- combattre — les mêmes colonnes que le classement, rien de plus.
--
-- SECURITY DEFINER parce que `koks` n'est lisible que par son propriétaire
-- depuis la migration 0010 ; la fonction n'expose que le combat.

create or replace function public.find_kok_by_code(p_code text)
returns table (
  id uuid, name text, class_id text, level int, appearance jsonb, attrs jsonb,
  weapon_min int, weapon_max int, armor int, power int, honor int
)
language plpgsql security definer set search_path = public
as $$
declare v_me uuid := (select auth.uid());
begin
  if v_me is null then raise exception 'authentification requise'; end if;
  if p_code is null or length(trim(p_code)) < 4 then raise exception 'kod invalid'; end if;
  return query
    select k.id, k.name, k.class_id, k.level, k.appearance, k.attrs,
           k.weapon_min, k.weapon_max, k.armor, k.power, k.honor
      from public.koks k
     where upper(k.referral_code) = upper(trim(p_code)) and k.id <> v_me
     limit 1;
end;
$$;

revoke all on function public.find_kok_by_code(text) from public, anon;
grant execute on function public.find_kok_by_code(text) to authenticated;
