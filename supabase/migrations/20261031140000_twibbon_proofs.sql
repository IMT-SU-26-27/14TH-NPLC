-- Each participant's proof of posting the twibbon. The link is set per competition and may stay empty:
-- while it is empty nobody knows what to post, so the proof is required only once a link is set.

alter table public.competitions
  add column twibbon_url text check (twibbon_url is null or (twibbon_url ~ '^https://' and char_length(twibbon_url) <= 500));

alter table public.registration_members
  add column twibbon_proof_public_id text, -- Cloudinary public_id (authenticated delivery type)
  add column twibbon_proof_format text check (twibbon_proof_format is null or twibbon_proof_format in ('jpg', 'jpeg', 'png', 'webp'));

create or replace function private.assert_twibbon_proof(p_competition_id uuid, p_public_id text)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if coalesce(btrim(p_public_id), '') = '' and exists (
    select 1 from public.competitions where id = p_competition_id and twibbon_url is not null
  ) then
    raise exception 'Upload the twibbon proof before submitting' using errcode = 'P0001';
  end if;
end;
$$;

drop function public.create_registration(uuid, text, text, text, text, text, text, text, text);

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
  if coalesce(btrim(p_school), '') = '' or coalesce(btrim(p_line_id), '') = '' then
    raise exception 'School and LINE ID are required' using errcode = 'P0001';
  end if;
  perform private.assert_twibbon_proof(p_competition_id, p_twibbon_proof_public_id);

  insert into public.registrations (
    competition_id, leader_id, team_name, school, line_id, status,
    payment_proof_public_id, payment_proof_format, payment_submitted_at
  )
  values (
    p_competition_id, v_uid, btrim(p_team_name), btrim(p_school), lower(btrim(p_line_id)), 'under_review',
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

revoke all on function public.create_registration(uuid, text, text, text, text, text, text, text, text, text, text) from public, anon;
grant execute on function public.create_registration(uuid, text, text, text, text, text, text, text, text, text, text) to authenticated;

drop function public.join_team(text, text, text, text);

create or replace function public.join_team(
  p_referral_code text,
  p_full_name text,
  p_nisn text,
  p_phone text default null,
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
  perform private.assert_twibbon_proof(v_competition_id, p_twibbon_proof_public_id);

  insert into public.registration_members (
    registration_id, competition_id, user_id, is_leader, full_name, email, phone, nisn,
    twibbon_proof_public_id, twibbon_proof_format
  )
  select v_registration_id, v_competition_id, v_uid, false, p_full_name, p.email, nullif(btrim(p_phone), ''), p_nisn,
    p_twibbon_proof_public_id, p_twibbon_proof_format
  from public.profiles p
  where p.id = v_uid;

  return v_registration_id;
end;
$$;

revoke all on function public.join_team(text, text, text, text, text, text) from public, anon;
grant execute on function public.join_team(text, text, text, text, text, text) to authenticated;

drop function public.preview_team(text);

create or replace function public.preview_team(p_referral_code text)
returns table (
  team_name text,
  competition_name text,
  leader_name text,
  member_count integer,
  max_members smallint,
  is_joinable boolean,
  twibbon_url text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    r.team_name,
    c.name,
    l.full_name,
    (select count(*)::integer from public.registration_members m where m.registration_id = r.id),
    c.max_members,
    private.competition_open(c.id),
    c.twibbon_url
  from public.registrations r
  join public.competitions c on c.id = r.competition_id
  join public.registration_members l on l.registration_id = r.id and l.is_leader
  where (select auth.uid()) is not null
    and r.referral_code = upper(btrim(p_referral_code));
$$;

revoke all on function public.preview_team(text) from public, anon;
grant execute on function public.preview_team(text) to authenticated;
