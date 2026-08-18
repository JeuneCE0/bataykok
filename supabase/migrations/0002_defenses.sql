-- Batailles subies en l'absence du joueur.
--
-- Le snapshot d'un kok se défend tout seul : quand un autre joueur l'attaque,
-- le résultat est déjà écrit dans arena_results. Il manquait de quoi dire au
-- défenseur, à son retour, ce qui s'est passé — et de quoi lui verser sa part
-- une seule fois.

alter table public.arena_results
  add column if not exists claimed_by_defender boolean not null default false;

-- les défenses non lues d'un joueur : la requête faite à chaque reconnexion
create index if not exists arena_unclaimed_idx
  on public.arena_results (defender_id, created_at desc)
  where not claimed_by_defender;

/**
 * Marque comme lues les défenses du joueur courant et les renvoie.
 * Le versement des grains reste côté client (l'or n'est pas en base), d'où
 * l'importance de ne pouvoir les lire qu'une fois.
 */
create or replace function public.claim_defenses()
returns table (
  id uuid,
  attacker_name text,
  attacker_level int,
  attacker_class text,
  attacker_won boolean,
  honor_delta int,
  happened_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := (select auth.uid());
begin
  if v_me is null then
    raise exception 'authentification requise';
  end if;

  return query
  with pending as (
    update public.arena_results a
       set claimed_by_defender = true
     where a.defender_id = v_me
       and not a.claimed_by_defender
    returning a.id, a.attacker_id, a.attacker_won, a.honor_delta, a.created_at
  )
  select p.id,
         k.name,
         k.level,
         k.class_id,
         p.attacker_won,
         p.honor_delta,
         p.created_at
    from pending p
    join public.koks k on k.id = p.attacker_id
   order by p.created_at desc;
end;
$$;

revoke all on function public.claim_defenses() from public;
grant execute on function public.claim_defenses() to authenticated;
