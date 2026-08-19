-- Parrainage : chaque kok porte un code court, dicté de vive voix.
--
-- La colonne et la fonction sont posées en deux temps : un `add column ...
-- default gen_referral_code()` échoue si la fonction lit la colonne qu'on est
-- en train de créer.

alter table public.koks add column if not exists referral_code text;
create unique index if not exists koks_referral_code_idx on public.koks (referral_code);

create or replace function public.gen_referral_code()
returns text
language plpgsql
set search_path = public
as $$
declare
  -- alphabet sans O/0/I/1 : un code doit pouvoir se dicter au téléphone
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

update public.koks set referral_code = public.gen_referral_code()
 where referral_code is null;

alter table public.koks
  alter column referral_code set default public.gen_referral_code();

create table if not exists public.referrals (
  referee_id  uuid primary key references public.koks (id) on delete cascade,
  referrer_id uuid not null references public.koks (id) on delete cascade,
  referrer_rewarded boolean not null default false,
  created_at  timestamptz not null default now(),
  constraint no_self_referral check (referee_id <> referrer_id)
);

create index if not exists referrals_referrer_idx
  on public.referrals (referrer_id, created_at desc);

alter table public.referrals enable row level security;

drop policy if exists referrals_read_own on public.referrals;
create policy referrals_read_own on public.referrals
  for select using ((select auth.uid()) in (referrer_id, referee_id));

/** Le filleul saisit le code de son parrain. Une seule fois, jamais le sien. */
create or replace function public.redeem_referral(p_code text)
returns table (referrer_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := (select auth.uid());
  v_referrer uuid;
begin
  if v_me is null then
    raise exception 'authentification requise';
  end if;
  if exists (select 1 from public.referrals r where r.referee_id = v_me) then
    raise exception 'ou la déjà in parin';
  end if;

  select k.id into v_referrer
    from public.koks k
   where upper(k.referral_code) = upper(trim(p_code));

  if v_referrer is null then
    raise exception 'kod parrainaz inkoni';
  end if;
  if v_referrer = v_me then
    raise exception 'ou pé pa parrainn a ou-mem';
  end if;

  insert into public.referrals (referee_id, referrer_id) values (v_me, v_referrer);
  return query select k.name from public.koks k where k.id = v_referrer;
end;
$$;

/** Le parrain encaisse ses filleuls non encore payés (les piments sont locaux). */
create or replace function public.claim_referral_rewards()
returns table (referee_name text, referee_level int)
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
  with paid as (
    update public.referrals r
       set referrer_rewarded = true
     where r.referrer_id = v_me and not r.referrer_rewarded
    returning r.referee_id
  )
  select k.name, k.level from paid p join public.koks k on k.id = p.referee_id;
end;
$$;

revoke all on function public.redeem_referral(text) from public, anon;
revoke all on function public.claim_referral_rewards() from public, anon;
grant execute on function public.redeem_referral(text) to authenticated;
grant execute on function public.claim_referral_rewards() to authenticated;
