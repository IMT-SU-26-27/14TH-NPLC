-- LINE ID is no longer asked for (HOD decision, 2026-11-08). The column stays, with its data: older teams keep
-- the LINE ID they gave. New teams are created without one; only the school is still required.
-- Same signature as before, so the app keeps calling it with p_line_id (now null).

create or replace function public.create_registration(
  p_competition_id uuid,
  p_team_name text,
  p_school text,
  p_line_id text,
  p_leader_name text,
  p_leader_phone text,
  p_leader_nisn text,
  p_payment_proof_public_id text,
  p_payment_proof_format text,
  p_twibbon_proof_public_id text default null,
  p_twibbon_proof_format text default null
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
  if coalesce(btrim(p_school), '') = '' then
    raise exception 'School is required' using errcode = 'P0001';
  end if;
  perform private.assert_twibbon_proof(p_competition_id, p_twibbon_proof_public_id);

  insert into public.registrations (
    competition_id, leader_id, team_name, school, line_id, status,
    payment_proof_public_id, payment_proof_format, payment_submitted_at
  )
  values (
    p_competition_id, v_uid, btrim(p_team_name), btrim(p_school), nullif(lower(btrim(p_line_id)), ''), 'under_review',
    p_payment_proof_public_id, p_payment_proof_format, now()
  )
  returning id into v_id;

  insert into public.registration_members (
    registration_id, competition_id, user_id, is_leader, full_name, email, phone, nisn,
    twibbon_proof_public_id, twibbon_proof_format
  )
  select v_id, p_competition_id, v_uid, true, p_leader_name, p.email, nullif(btrim(p_leader_phone), ''), p_leader_nisn,
    p_twibbon_proof_public_id, p_twibbon_proof_format
  from public.profiles p
  where p.id = v_uid;

  return v_id;
end;
$$;
