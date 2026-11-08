-- Team quota per competition and the participants' WhatsApp group link (HOD decision, 2026-11-09).
--
-- 1. competitions.max_teams: how many teams a competition takes. Null means no limit. Every team that is not
--    rejected counts. create_registration and a rejected team sending a new payment proof are refused once full.
-- 2. competitions.wa_group_url: invite link to the participants' WhatsApp group. It is never readable through the
--    public API: anon and authenticated keep SELECT on every other column only. Participants get it from
--    my_wa_group() once their team is accepted; admins from admin_competition_wa_group_url().

alter table public.competitions
  add column max_teams integer check (max_teams is null or max_teams > 0),
  add column wa_group_url text check (
    wa_group_url is null or (char_length(wa_group_url) <= 200 and wa_group_url ~ '^https://chat\.whatsapp\.com/\S+$')
  );

-- Column privileges: the invite link stays out of every public read. A new column needs its own grant here.
revoke select on table public.competitions from anon, authenticated;
grant select (
  id, slug, name, type, description, description_en, min_members, max_members, max_teams, fee, qris_public_id,
  twibbon_url, payment_method, bank_account_number, bank_account_holder, registration_opens_at, registration_closes_at,
  is_active, sort_order, created_at, updated_at
) on table public.competitions to anon, authenticated;

-- Refuses a team once the competition is full. Locks the competition row first, so two registrations at the same
-- moment are counted one after the other and cannot both take the last place. p_registration_id is a team that is
-- coming back from "rejected" and is not counted yet.
create or replace function private.assert_team_quota(p_competition_id uuid, p_registration_id uuid default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_max integer;
  v_count integer;
begin
  select c.max_teams into v_max from public.competitions c where c.id = p_competition_id for update;
  if v_max is null then
    return;
  end if;

  select count(*) into v_count
  from public.registrations r
  where r.competition_id = p_competition_id
    and r.status <> 'rejected'
    and (p_registration_id is null or r.id <> p_registration_id);

  if v_count >= v_max then
    raise exception 'The team quota for this competition is full' using errcode = 'P0001', hint = 'team_quota_full';
  end if;
end;
$$;

-- Same as 20261108130000, plus the quota check before the team is created.
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
  perform private.assert_team_quota(p_competition_id);

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

-- Same as 20261031160000, plus: a team leaving "rejected" (the leader sends a new payment proof, or an admin
-- reopens it) takes a place again, so it is checked against the quota.
create or replace function private.registrations_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.status = 'rejected' and new.status <> 'rejected' then
    perform private.assert_team_quota(new.competition_id, new.id);
  end if;

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
     or new.rally_qr_token <> old.rally_qr_token
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

-- Teams that take a place (not rejected), per competition. Public: only the numbers, for the "full" badge.
-- Admins also get inactive competitions.
create or replace function public.competition_team_counts()
returns table (competition_id uuid, team_count integer)
language sql
stable
security definer
set search_path = ''
as $$
  select c.id, (
    select count(*)::integer from public.registrations r where r.competition_id = c.id and r.status <> 'rejected'
  )
  from public.competitions c
  where c.is_active or private.is_admin();
$$;

revoke all on function public.competition_team_counts() from public;
grant execute on function public.competition_team_counts() to anon, authenticated;

-- The WhatsApp group of the caller's competition. THE place that decides who sees the link: a member (leader or
-- not) of an accepted team. To show it from "under review" on, widen the status condition here only.
create or replace function public.my_wa_group()
returns table (competition_name text, wa_group_url text)
language sql
stable
security definer
set search_path = ''
as $$
  select c.name, c.wa_group_url
  from public.registration_members m
  join public.registrations r on r.id = m.registration_id
  join public.competitions c on c.id = r.competition_id
  where m.user_id = (select auth.uid())
    and r.status = 'accepted'
    and c.wa_group_url is not null;
$$;

revoke all on function public.my_wa_group() from public, anon;
grant execute on function public.my_wa_group() to authenticated;

-- Admin form: the current link of one competition.
create or replace function public.admin_competition_wa_group_url(p_competition_id uuid)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  return (select c.wa_group_url from public.competitions c where c.id = p_competition_id);
end;
$$;

revoke all on function public.admin_competition_wa_group_url(uuid) from public, anon;
grant execute on function public.admin_competition_wa_group_url(uuid) to authenticated;
