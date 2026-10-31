-- One account, NISN and email can be on only one team across all competitions.

-- Stop with a clear message instead of a bare unique-index error. Nothing is deleted automatically:
-- which registration to keep is the committee's decision.
do $$
declare
  v_users integer;
  v_nisn integer;
  v_email integer;
begin
  select count(*) into v_users from (
    select user_id from public.registration_members group by user_id having count(*) > 1
  ) d;
  select count(*) into v_nisn from (
    select nisn from public.registration_members group by nisn having count(*) > 1
  ) d;
  select count(*) into v_email from (
    select lower(email) from public.registration_members group by lower(email) having count(*) > 1
  ) d;

  if v_users + v_nisn + v_email > 0 then
    raise exception 'One-competition rule cannot be applied: % account(s), % NISN(s) and % email(s) are on more than one team. Remove the extra teams or members, then run this migration again.',
      v_users, v_nisn, v_email
      using errcode = '23505';
  end if;
end;
$$;

drop index public.registration_members_competition_user_key;
drop index public.registration_members_competition_nisn_key;
drop index public.registration_members_competition_email_key;
drop index public.registration_members_user_id_idx; -- covered by the unique index below

create unique index registration_members_user_key on public.registration_members (user_id);
create unique index registration_members_nisn_key on public.registration_members (nisn);
create unique index registration_members_email_key on public.registration_members (lower(email));

create or replace function public.create_registration(
  p_competition_id uuid,
  p_team_name text,
  p_leader_name text,
  p_leader_phone text,
  p_leader_nisn text,
  p_payment_proof_public_id text,
  p_payment_proof_format text
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_id uuid;
begin
  if v_uid is null then
    raise exception 'Sign in to register' using errcode = '42501';
  end if;
  if not private.competition_open(p_competition_id) then
    raise exception 'Registration for this competition is closed' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.registration_members where user_id = v_uid) then
    raise exception 'You are already on a team' using errcode = '23505';
  end if;
  if coalesce(btrim(p_payment_proof_public_id), '') = '' then
    raise exception 'Upload the payment proof before submitting' using errcode = 'P0001';
  end if;

  insert into public.registrations (
    competition_id, leader_id, team_name, status,
    payment_proof_public_id, payment_proof_format, payment_submitted_at
  )
  values (
    p_competition_id, v_uid, btrim(p_team_name), 'under_review',
    p_payment_proof_public_id, p_payment_proof_format, now()
  )
  returning id into v_id;

  insert into public.registration_members (registration_id, competition_id, user_id, is_leader, full_name, email, phone, nisn)
  select v_id, p_competition_id, v_uid, true, p_leader_name, p.email, nullif(btrim(p_leader_phone), ''), p_leader_nisn
  from public.profiles p
  where p.id = v_uid;

  return v_id;
end;
$$;

create or replace function public.join_team(
  p_referral_code text,
  p_full_name text,
  p_nisn text,
  p_phone text default null
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_registration_id uuid;
  v_competition_id uuid;
begin
  if v_uid is null then
    raise exception 'Sign in to join a team' using errcode = '42501';
  end if;

  select r.id, r.competition_id into v_registration_id, v_competition_id
  from public.registrations r
  where r.referral_code = upper(btrim(p_referral_code));

  if not found then
    raise exception 'No team has this code' using errcode = 'P0002';
  end if;
  if not private.competition_open(v_competition_id) then
    raise exception 'Registration for this competition is closed' using errcode = 'P0001';
  end if;
  if exists (select 1 from public.registration_members where user_id = v_uid) then
    raise exception 'You are already on a team' using errcode = '23505';
  end if;

  insert into public.registration_members (registration_id, competition_id, user_id, is_leader, full_name, email, phone, nisn)
  select v_registration_id, v_competition_id, v_uid, false, p_full_name, p.email, nullif(btrim(p_phone), ''), p_nisn
  from public.profiles p
  where p.id = v_uid;

  return v_registration_id;
end;
$$;
