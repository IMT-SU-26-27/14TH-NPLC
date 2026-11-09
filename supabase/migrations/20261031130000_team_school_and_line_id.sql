-- Team details from the registration form: school and the contact person's LINE ID.
-- Nullable because teams registered before this migration do not have them.
-- create_registration requires both, so every new team has them.

alter table public.registrations
  add column school text check (school is null or char_length(btrim(school)) between 2 and 120),
  add column line_id text check (line_id is null or line_id ~ '^[a-z0-9._-]{4,20}$');

drop function public.create_registration(uuid, text, text, text, text, text, text);

create or replace function public.create_registration(
  p_competition_id uuid,
  p_team_name text,
  p_school text,
  p_line_id text,
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
  if coalesce(btrim(p_school), '') = '' or coalesce(btrim(p_line_id), '') = '' then
    raise exception 'School and LINE ID are required' using errcode = 'P0001';
  end if;

  insert into public.registrations (
    competition_id, leader_id, team_name, school, line_id, status,
    payment_proof_public_id, payment_proof_format, payment_submitted_at
  )
  values (
    p_competition_id, v_uid, btrim(p_team_name), btrim(p_school), lower(btrim(p_line_id)), 'under_review',
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

revoke all on function public.create_registration(uuid, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.create_registration(uuid, text, text, text, text, text, text, text, text) to authenticated;

-- Participants cannot change these after registering, like the team name.
create or replace function private.registrations_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_trusted() or private.is_admin() then
    if new.status is distinct from old.status then
      if new.status = 'accepted' then
        perform private.assert_team_valid(new.id, true);
      end if;
      if new.status in ('accepted', 'rejected') then
        new.reviewed_by := (select auth.uid());
        new.reviewed_at := now();
      end if;
      if new.status <> 'rejected' then
        new.rejection_reason := null;
      end if;
    end if;
    return new;
  end if;

  -- Team leader: can only send a new payment proof after a rejection. The team name is fixed.
  if new.team_name <> old.team_name then
    raise exception 'The team name cannot be changed' using errcode = '42501';
  end if;

  if new.competition_id <> old.competition_id
     or new.leader_id <> old.leader_id
     or new.referral_code <> old.referral_code
     or new.school is distinct from old.school
     or new.line_id is distinct from old.line_id
     or new.reviewed_by is distinct from old.reviewed_by
     or new.reviewed_at is distinct from old.reviewed_at
     or new.payment_submitted_at is distinct from old.payment_submitted_at then
    raise exception 'You cannot change these fields' using errcode = '42501';
  end if;

  if new.status is distinct from old.status
     or new.payment_proof_public_id is distinct from old.payment_proof_public_id
     or new.payment_proof_format is distinct from old.payment_proof_format then
    if old.status not in ('pending_payment', 'rejected') then
      raise exception 'This registration can no longer be edited' using errcode = '42501';
    end if;
    if new.status <> 'under_review' then
      raise exception 'Only an admin can accept or reject a registration' using errcode = '42501';
    end if;
    if new.payment_proof_public_id is null then
      raise exception 'Upload the payment proof before submitting' using errcode = 'P0001';
    end if;
    perform private.assert_team_valid(new.id, false);
    new.payment_submitted_at := now();
    new.rejection_reason := null;
  elsif new.rejection_reason is distinct from old.rejection_reason then
    raise exception 'You cannot change the rejection reason' using errcode = '42501';
  end if;

  return new;
end;
$$;

-- New columns go last: create or replace view cannot reorder existing ones.
create or replace view public.registration_overview
with (security_invoker = true)
as
select
  r.id,
  r.competition_id,
  c.name as competition_name,
  c.type as competition_type,
  r.team_name,
  r.referral_code,
  r.status,
  l.full_name as leader_name,
  l.phone as leader_phone,
  l.email as leader_email,
  l.nisn as leader_nisn,
  (select count(*) from public.registration_members m where m.registration_id = r.id) as member_count,
  r.payment_proof_public_id,
  r.payment_submitted_at,
  r.rejection_reason,
  r.reviewed_at,
  r.created_at,
  r.school,
  r.line_id
from public.registrations r
join public.competitions c on c.id = r.competition_id
left join public.registration_members l on l.registration_id = r.id and l.is_leader;
