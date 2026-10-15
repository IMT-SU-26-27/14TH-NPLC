-- 1. Pay first: a team is created together with its payment proof (status under_review).
--    Members can join or be removed while the competition's registration window is open, whatever the status.
--    The minimum team size is checked when an admin accepts, not when the leader pays.
-- 2. Site content for the homepage (about text + timeline), bilingual, managed by admins.

-- ---------------------------------------------------------------------------
-- Team size: participants are only held to "one leader, at most max members";
-- the minimum is enforced on acceptance.
-- ---------------------------------------------------------------------------

drop function private.assert_team_valid(uuid);

create function private.assert_team_valid(p_registration_id uuid, p_require_min boolean default true)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_min smallint;
  v_max smallint;
  v_count integer;
  v_leaders integer;
begin
  select c.min_members, c.max_members into v_min, v_max
  from public.registrations r
  join public.competitions c on c.id = r.competition_id
  where r.id = p_registration_id;

  select count(*), count(*) filter (where is_leader) into v_count, v_leaders
  from public.registration_members
  where registration_id = p_registration_id;

  if v_leaders <> 1 then
    raise exception 'A team needs exactly one leader' using errcode = 'P0001';
  end if;
  if v_count > v_max or (p_require_min and v_count < v_min) then
    raise exception 'This competition needs % to % members per team, this team has %', v_min, v_max, v_count
      using errcode = 'P0001';
  end if;
end;
$$;

-- Members can join / be removed while the competition is open, in any status.
create or replace function private.registration_editable(p_registration_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.registrations r
    where r.id = p_registration_id and private.competition_open(r.competition_id)
  );
$$;

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

-- ---------------------------------------------------------------------------
-- Registration RPCs
-- ---------------------------------------------------------------------------

drop function public.create_registration(uuid, text, text, text, text);

-- The leader creates the team and submits the payment proof in one step.
-- The proof must already be uploaded to Cloudinary; the server action verifies it exists.
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
  if exists (
    select 1 from public.registration_members
    where competition_id = p_competition_id and user_id = v_uid
  ) then
    raise exception 'You are already on a team in this competition' using errcode = '23505';
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

revoke all on function public.create_registration(uuid, text, text, text, text, text, text) from public, anon;
grant execute on function public.create_registration(uuid, text, text, text, text, text, text) to authenticated;

create or replace function public.preview_team(p_referral_code text)
returns table (
  team_name text,
  competition_name text,
  leader_name text,
  member_count integer,
  max_members smallint,
  is_joinable boolean
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
    private.competition_open(c.id)
  from public.registrations r
  join public.competitions c on c.id = r.competition_id
  join public.registration_members l on l.registration_id = r.id and l.is_leader
  where (select auth.uid()) is not null
    and r.referral_code = upper(btrim(p_referral_code));
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
  if exists (
    select 1 from public.registration_members
    where competition_id = v_competition_id and user_id = v_uid
  ) then
    raise exception 'You are already on a team in this competition' using errcode = '23505';
  end if;

  insert into public.registration_members (registration_id, competition_id, user_id, is_leader, full_name, email, phone, nisn)
  select v_registration_id, v_competition_id, v_uid, false, p_full_name, p.email, nullif(btrim(p_phone), ''), p_nisn
  from public.profiles p
  where p.id = v_uid;

  return v_registration_id;
end;
$$;

-- The registration event for a new team says the payment came with it.
create or replace function private.log_registration_event()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    insert into public.registration_events (registration_id, status, note, actor_id)
    values (
      new.id,
      new.status,
      case
        when tg_op = 'INSERT' and new.status = 'under_review' then 'Registration created with payment proof'
        when tg_op = 'INSERT' then 'Registration created'
        when new.status = 'under_review' then 'Payment proof submitted'
        when new.status = 'accepted' then 'Registration accepted'
        when new.status = 'rejected' then new.rejection_reason
        else null
      end,
      (select auth.uid())
    );
  end if;
  return null;
end;
$$;

-- ---------------------------------------------------------------------------
-- Site content (homepage)
-- ---------------------------------------------------------------------------

create table public.site_content (
  id boolean primary key default true check (id), -- single row
  about_title_id text not null default '',
  about_title_en text not null default '',
  about_body_id text not null default '',
  about_body_en text not null default '',
  updated_at timestamptz not null default now()
);

insert into public.site_content (id) values (true) on conflict do nothing;

create trigger site_content_set_updated_at before update on public.site_content
  for each row execute function private.set_updated_at();

create table public.timeline_events (
  id uuid primary key default gen_random_uuid(),
  starts_on date not null,
  ends_on date check (ends_on is null or ends_on >= starts_on),
  title_id text not null check (char_length(btrim(title_id)) between 1 and 120),
  title_en text not null check (char_length(btrim(title_en)) between 1 and 120),
  description_id text not null default '' check (char_length(description_id) <= 1000),
  description_en text not null default '' check (char_length(description_en) <= 1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index timeline_events_starts_on_idx on public.timeline_events (starts_on);

create trigger timeline_events_set_updated_at before update on public.timeline_events
  for each row execute function private.set_updated_at();

alter table public.site_content enable row level security;
alter table public.timeline_events enable row level security;

create policy "site_content: anyone reads" on public.site_content
  for select to anon, authenticated using (true);
create policy "site_content: admin update" on public.site_content
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "timeline_events: anyone reads" on public.timeline_events
  for select to anon, authenticated using (true);
create policy "timeline_events: admin insert" on public.timeline_events
  for insert to authenticated with check ((select private.is_admin()));
create policy "timeline_events: admin update" on public.timeline_events
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "timeline_events: admin delete" on public.timeline_events
  for delete to authenticated using ((select private.is_admin()));

revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated, service_role;
