-- Payment goes to the BCA account of Yayasan Ciputra Pendidikan (finance, 19 Nov 2026). Finance matches each
-- transfer in the bank statement by the sender's name, which only the participant knows, so the leader enters it
-- with the proof. Shown to admins next to the proof; a leader can change it only while sending a proof.

alter table public.registrations
  add column payer_name text check (payer_name is null or char_length(btrim(payer_name)) between 2 and 100);

drop function public.create_registration(uuid, text, text, text, text, text, text, text, text, text, text, text);

create function public.create_registration(
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
  p_twibbon_proof_format text default null,
  p_twibbon_post_url text default null,
  p_payer_name text default null
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
  perform private.assert_twibbon_post(p_competition_id, p_twibbon_post_url, p_twibbon_proof_public_id);
  perform private.assert_team_quota(p_competition_id);

  insert into public.registrations (
    competition_id, leader_id, team_name, school, line_id, status,
    payment_proof_public_id, payment_proof_format, payment_submitted_at, payer_name
  )
  values (
    p_competition_id, v_uid, btrim(p_team_name), btrim(p_school), nullif(lower(btrim(p_line_id)), ''), 'under_review',
    p_payment_proof_public_id, p_payment_proof_format, now(), nullif(btrim(p_payer_name), '')
  )
  returning id into v_id;

  insert into public.registration_members (
    registration_id, competition_id, user_id, is_leader, full_name, email, phone, nisn,
    twibbon_proof_public_id, twibbon_proof_format, twibbon_post_url
  )
  select v_id, p_competition_id, v_uid, true, p_leader_name, p.email, nullif(btrim(p_leader_phone), ''), p_leader_nisn,
    p_twibbon_proof_public_id, p_twibbon_proof_format, nullif(btrim(p_twibbon_post_url), '')
  from public.profiles p
  where p.id = v_uid;

  return v_id;
end;
$$;

revoke all on function public.create_registration(uuid, text, text, text, text, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.create_registration(uuid, text, text, text, text, text, text, text, text, text, text, text, text) to authenticated;

-- A leader changes the sender's name only together with a new proof (pending payment or after a rejection).
create or replace function private.registrations_guard_payer_name()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.payer_name is distinct from old.payer_name
     and not (private.is_trusted() or private.is_admin())
     and old.status not in ('pending_payment', 'rejected') then
    raise exception 'This registration can no longer be edited' using errcode = '42501';
  end if;
  return new;
end;
$$;

revoke all on function private.registrations_guard_payer_name() from public, anon, authenticated;

create trigger registrations_guard_payer_name before update of payer_name on public.registrations
  for each row execute function private.registrations_guard_payer_name();
