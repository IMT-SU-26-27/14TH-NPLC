-- The twibbon proof becomes a link to the Instagram post instead of an uploaded screenshot (HOD decision,
-- 2026-11-08; design v86 09/11 "Link postingan twibbon"). New column only: the screenshot columns and their data
-- stay for members who already uploaded one. The proof (link or older screenshot) is still required only once the
-- competition has a twibbon_url.

alter table public.registration_members
  add column twibbon_post_url text check (
    twibbon_post_url is null
    or (char_length(twibbon_post_url) <= 500 and twibbon_post_url ~ '^https://(www\.)?instagram\.com/(p|reel|reels)/[A-Za-z0-9_-]+')
  );

create or replace function private.assert_twibbon_post(p_competition_id uuid, p_post_url text, p_public_id text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if coalesce(btrim(p_post_url), '') = '' and coalesce(btrim(p_public_id), '') = '' and exists (
    select 1 from public.competitions where id = p_competition_id and twibbon_url is not null
  ) then
    raise exception 'Add the twibbon post link before submitting' using errcode = 'P0001';
  end if;
end;
$$;

drop function public.create_registration(uuid, text, text, text, text, text, text, text, text, text, text);

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
  p_twibbon_proof_format text default null,
  p_twibbon_post_url text default null
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
    twibbon_proof_public_id, twibbon_proof_format, twibbon_post_url
  )
  select v_id, p_competition_id, v_uid, true, p_leader_name, p.email, nullif(btrim(p_leader_phone), ''), p_leader_nisn,
    p_twibbon_proof_public_id, p_twibbon_proof_format, nullif(btrim(p_twibbon_post_url), '')
  from public.profiles p
  where p.id = v_uid;

  return v_id;
end;
$$;

revoke all on function public.create_registration(uuid, text, text, text, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.create_registration(uuid, text, text, text, text, text, text, text, text, text, text, text) to authenticated;

drop function public.join_team(text, text, text, text, text, text);

create or replace function public.join_team(
  p_referral_code text,
  p_full_name text,
  p_nisn text,
  p_phone text default null,
  p_twibbon_proof_public_id text default null,
  p_twibbon_proof_format text default null,
  p_twibbon_post_url text default null
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
  perform private.assert_twibbon_post(v_competition_id, p_twibbon_post_url, p_twibbon_proof_public_id);

  insert into public.registration_members (
    registration_id, competition_id, user_id, is_leader, full_name, email, phone, nisn,
    twibbon_proof_public_id, twibbon_proof_format, twibbon_post_url
  )
  select v_registration_id, v_competition_id, v_uid, false, p_full_name, p.email, nullif(btrim(p_phone), ''), p_nisn,
    p_twibbon_proof_public_id, p_twibbon_proof_format, nullif(btrim(p_twibbon_post_url), '')
  from public.profiles p
  where p.id = v_uid;

  return v_registration_id;
end;
$$;

revoke all on function public.join_team(text, text, text, text, text, text, text) from public, anon;
grant execute on function public.join_team(text, text, text, text, text, text, text) to authenticated;
