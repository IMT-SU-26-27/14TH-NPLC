-- 14th NPLC: initial schema
-- Registration for multiple competitions + the competitive programming (CP) contest.
-- Not applied automatically. Apply with `supabase db push` or paste into the Studio SQL editor.
-- Images and files (QRIS, payment proofs) live in Cloudinary; only their public_id is stored here.

-- =============================================================================
-- Schemas, enums
-- =============================================================================

-- Helper functions live in `private` so PostgREST does not expose them as RPC endpoints.
create schema if not exists private;
grant usage on schema private to authenticated, service_role;

create type public.user_role as enum ('participant', 'admin');
create type public.competition_type as enum ('competitive_programming', 'logic');
create type public.registration_status as enum ('pending_payment', 'under_review', 'accepted', 'rejected');
create type public.cp_session_status as enum ('scheduled', 'live', 'ended');
create type public.cp_language as enum ('python', 'cpp', 'java');
-- Mirrors Judge0 statuses (see docs/judge0-errors.md).
create type public.cp_verdict as enum (
  'accepted',
  'wrong_answer',
  'time_limit_exceeded',
  'compilation_error',
  'runtime_error_sigsegv',
  'runtime_error_sigxfsz',
  'runtime_error_sigfpe',
  'runtime_error_sigabrt',
  'runtime_error_nzec',
  'runtime_error_other',
  'internal_error',
  'exec_format_error'
);

-- =============================================================================
-- Generic helpers
-- =============================================================================

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

-- True for the service role and direct database sessions (migrations, Studio, seed).
-- False for requests made with a user's or the anon JWT.
create or replace function private.is_trusted()
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select auth.jwt() ->> 'role'), 'postgres') not in ('authenticated', 'anon');
$$;

-- =============================================================================
-- profiles
-- =============================================================================

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  avatar_url text,
  role public.user_role not null default 'participant',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index profiles_email_key on public.profiles (lower(email));

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
$$;

-- Users may edit their own name/avatar but never their role or email.
create or replace function private.profiles_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if not private.is_trusted() and not private.is_admin()
     and (new.role is distinct from old.role or new.email is distinct from old.email) then
    raise exception 'You cannot change your role or email' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger profiles_guard before update on public.profiles
  for each row execute function private.profiles_guard();
create trigger profiles_set_updated_at before update on public.profiles
  for each row execute function private.set_updated_at();

-- =============================================================================
-- competitions
-- =============================================================================

create table public.competitions (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(btrim(name)) between 2 and 100),
  type public.competition_type not null,
  description text not null default '',
  -- Team size including the leader. Set by the admin.
  min_members smallint not null default 1 check (min_members >= 1),
  max_members smallint not null default 1,
  fee integer not null default 0 check (fee >= 0), -- in rupiah
  qris_public_id text, -- Cloudinary public_id of the QRIS image
  registration_opens_at timestamptz,
  registration_closes_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint competitions_member_range check (max_members >= min_members and max_members <= 10),
  constraint competitions_registration_window check (
    registration_opens_at is null or registration_closes_at is null
    or registration_closes_at > registration_opens_at
  )
);

create trigger competitions_set_updated_at before update on public.competitions
  for each row execute function private.set_updated_at();

create or replace function private.competition_open(p_competition_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.competitions c
    where c.id = p_competition_id
      and c.is_active
      and (c.registration_opens_at is null or now() >= c.registration_opens_at)
      and (c.registration_closes_at is null or now() < c.registration_closes_at)
  );
$$;

create or replace function private.assert_cp_competition(p_competition_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.competitions
    where id = p_competition_id and type = 'competitive_programming'
  ) then
    raise exception 'Competition % is not a competitive programming competition', p_competition_id
      using errcode = '23514';
  end if;
end;
$$;

-- =============================================================================
-- registrations (one team in one competition)
-- =============================================================================

-- 8 characters from an alphabet without look-alikes (no 0/O, 1/I/L). 32^8 ≈ 10^12 codes.
create or replace function private.generate_referral_code()
returns text
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  v_alphabet constant text := 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  v_bytes bytea;
  v_code text;
begin
  loop
    v_bytes := uuid_send(gen_random_uuid());
    v_code := '';
    for i in 0..7 loop
      v_code := v_code || substr(v_alphabet, 1 + get_byte(v_bytes, i) % length(v_alphabet), 1);
    end loop;
    exit when not exists (select 1 from public.registrations where referral_code = v_code);
  end loop;
  return v_code;
end;
$$;

create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete restrict,
  leader_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  team_name text not null check (char_length(btrim(team_name)) between 2 and 60),
  -- Shared by the leader; members join the team with it.
  referral_code text not null unique default private.generate_referral_code()
    check (referral_code ~ '^[A-Z0-9]{8}$'),
  status public.registration_status not null default 'pending_payment',
  payment_proof_public_id text, -- Cloudinary public_id (authenticated delivery type)
  payment_proof_format text check (payment_proof_format is null or payment_proof_format in ('jpg', 'jpeg', 'png', 'webp', 'pdf')),
  payment_submitted_at timestamptz,
  rejection_reason text check (rejection_reason is null or char_length(rejection_reason) <= 1000),
  reviewed_by uuid references public.profiles (id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registrations_rejection_reason_required check (status <> 'rejected' or rejection_reason is not null),
  constraint registrations_competition_leader_key unique (competition_id, leader_id),
  -- Target for the composite foreign key on registration_members.
  constraint registrations_id_competition_key unique (id, competition_id)
);

create unique index registrations_competition_team_name_key
  on public.registrations (competition_id, lower(btrim(team_name)));
create index registrations_leader_id_idx on public.registrations (leader_id);
create index registrations_status_idx on public.registrations (status);
create index registrations_reviewed_by_idx on public.registrations (reviewed_by);

create trigger registrations_set_updated_at before update on public.registrations
  for each row execute function private.set_updated_at();

-- =============================================================================
-- registration_members (everyone on the team, leader included)
-- =============================================================================

create table public.registration_members (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null,
  competition_id uuid not null, -- copied from the registration by trigger; enables per-competition uniqueness
  user_id uuid not null references public.profiles (id) on delete cascade, -- every member has an account
  is_leader boolean not null default false,
  full_name text not null check (char_length(btrim(full_name)) between 2 and 100),
  email text not null check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  phone text check (phone is null or phone ~ '^\+?[0-9]{8,15}$'),
  nisn text not null check (nisn ~ '^[0-9]{10}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint registration_members_registration_fkey
    foreign key (registration_id, competition_id)
    references public.registrations (id, competition_id) on delete cascade,
  constraint registration_members_leader_phone_required check (not is_leader or phone is not null)
);

create unique index registration_members_one_leader_key
  on public.registration_members (registration_id) where is_leader;
-- A person (account, NISN or email) can be on only one team per competition.
create unique index registration_members_competition_user_key
  on public.registration_members (competition_id, user_id);
create unique index registration_members_competition_nisn_key
  on public.registration_members (competition_id, nisn);
create unique index registration_members_competition_email_key
  on public.registration_members (competition_id, lower(email));
create index registration_members_registration_id_idx on public.registration_members (registration_id);
create index registration_members_user_id_idx on public.registration_members (user_id);

create trigger registration_members_set_updated_at before update on public.registration_members
  for each row execute function private.set_updated_at();

-- Fills competition_id, ties the leader row to the leader, normalizes email, enforces max team size.
create or replace function private.registration_members_prepare()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_leader_id uuid;
  v_max smallint;
  v_count integer;
begin
  if tg_op = 'UPDATE' then
    if new.registration_id <> old.registration_id then
      raise exception 'A member cannot be moved to another team' using errcode = '42501';
    end if;
    if new.is_leader <> old.is_leader and not private.is_trusted() and not private.is_admin() then
      raise exception 'Only an admin can change the team leader' using errcode = '42501';
    end if;
  end if;

  select r.competition_id, r.leader_id into new.competition_id, v_leader_id
  from public.registrations r
  where r.id = new.registration_id;

  new.email := lower(btrim(new.email));
  new.full_name := btrim(new.full_name);

  if new.is_leader then
    new.user_id := v_leader_id;
  elsif new.user_id = v_leader_id then
    raise exception 'The leader is already on this team' using errcode = '23505';
  end if;

  if tg_op = 'INSERT' then
    select c.max_members into v_max from public.competitions c where c.id = new.competition_id;
    select count(*) into v_count from public.registration_members m where m.registration_id = new.registration_id;
    if v_count >= v_max then
      raise exception 'This team already has the maximum of % members', v_max using errcode = 'P0001';
    end if;
  end if;

  return new;
end;
$$;

create trigger registration_members_prepare before insert or update on public.registration_members
  for each row execute function private.registration_members_prepare();

-- The leader row goes away only when the whole registration is deleted.
create or replace function private.registration_members_protect_leader()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if old.is_leader and exists (select 1 from public.registrations where id = old.registration_id) then
    raise exception 'The team leader cannot be removed' using errcode = '42501';
  end if;
  return old;
end;
$$;

create trigger registration_members_protect_leader before delete on public.registration_members
  for each row execute function private.registration_members_protect_leader();

-- =============================================================================
-- Team helpers (security definer so RLS policies don't recurse)
-- =============================================================================

create or replace function private.is_team_leader(p_registration_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.registrations
    where id = p_registration_id and leader_id = (select auth.uid())
  );
$$;

create or replace function private.is_team_member(p_registration_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_team_leader(p_registration_id) or exists (
    select 1 from public.registration_members
    where registration_id = p_registration_id and user_id = (select auth.uid())
  );
$$;

-- Members can join or be removed only before payment is submitted, or after a rejection.
create or replace function private.registration_editable(p_registration_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.registrations
    where id = p_registration_id and status in ('pending_payment', 'rejected')
  );
$$;

create or replace function private.assert_team_valid(p_registration_id uuid)
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
  if v_count < v_min or v_count > v_max then
    raise exception 'This competition needs % to % members per team, this team has %', v_min, v_max, v_count
      using errcode = 'P0001';
  end if;
end;
$$;

-- =============================================================================
-- Registration status rules
-- =============================================================================

create or replace function private.registrations_guard()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if private.is_trusted() or private.is_admin() then
    if new.status is distinct from old.status then
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

  -- Team leader (RLS already limits updates to the leader's own rows).
  -- The leader can only attach a payment proof and submit it; the team name is fixed after creation.
  if old.status not in ('pending_payment', 'rejected') then
    raise exception 'This registration can no longer be edited' using errcode = '42501';
  end if;

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

  if new.status is distinct from old.status then
    if new.status <> 'under_review' then
      raise exception 'Only an admin can accept or reject a registration' using errcode = '42501';
    end if;
    if new.payment_proof_public_id is null then
      raise exception 'Upload the payment proof before submitting' using errcode = 'P0001';
    end if;
    perform private.assert_team_valid(new.id);
    new.payment_submitted_at := now();
    new.rejection_reason := null;
  elsif new.rejection_reason is distinct from old.rejection_reason then
    raise exception 'You cannot change the rejection reason' using errcode = '42501';
  end if;

  return new;
end;
$$;

create trigger registrations_guard before update on public.registrations
  for each row execute function private.registrations_guard();

-- =============================================================================
-- registration_events (participant timeline)
-- =============================================================================

create table public.registration_events (
  id bigint generated always as identity primary key,
  registration_id uuid not null references public.registrations (id) on delete cascade,
  status public.registration_status not null,
  note text,
  actor_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index registration_events_registration_id_idx on public.registration_events (registration_id, created_at);
create index registration_events_actor_id_idx on public.registration_events (actor_id);

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

create trigger registrations_log_event after insert or update of status on public.registrations
  for each row execute function private.log_registration_event();

-- =============================================================================
-- Account creation
-- =============================================================================

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    lower(new.email),
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created after insert on auth.users
  for each row execute function private.handle_new_user();

-- =============================================================================
-- Registration RPCs (participants create and join teams only through these)
-- =============================================================================

-- Leader creates the team. The leader's email is taken from their account.
-- Returns the new registration id; the team's referral_code is readable from registrations.
create or replace function public.create_registration(
  p_competition_id uuid,
  p_team_name text,
  p_leader_name text,
  p_leader_phone text,
  p_leader_nisn text
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

  insert into public.registrations (competition_id, leader_id, team_name)
  values (p_competition_id, v_uid, btrim(p_team_name))
  returning id into v_id;

  insert into public.registration_members (registration_id, competition_id, user_id, is_leader, full_name, email, phone, nisn)
  select v_id, p_competition_id, v_uid, true, p_leader_name, p.email, nullif(btrim(p_leader_phone), ''), p_leader_nisn
  from public.profiles p
  where p.id = v_uid;

  return v_id;
end;
$$;

-- Shown on the join page before the member confirms.
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
    r.status in ('pending_payment', 'rejected') and private.competition_open(c.id)
  from public.registrations r
  join public.competitions c on c.id = r.competition_id
  join public.registration_members l on l.registration_id = r.id and l.is_leader
  where (select auth.uid()) is not null
    and r.referral_code = upper(btrim(p_referral_code));
$$;

-- A signed-in user joins a team with its referral code. Their email is taken from their account.
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
  v_status public.registration_status;
begin
  if v_uid is null then
    raise exception 'Sign in to join a team' using errcode = '42501';
  end if;

  select r.id, r.competition_id, r.status into v_registration_id, v_competition_id, v_status
  from public.registrations r
  where r.referral_code = upper(btrim(p_referral_code));

  if not found then
    raise exception 'No team has this code' using errcode = 'P0002';
  end if;
  if v_status not in ('pending_payment', 'rejected') then
    raise exception 'This team is no longer accepting members' using errcode = 'P0001';
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

-- =============================================================================
-- Admin views
-- =============================================================================

-- One row per registration with leader details, for the admin table (search + filter).
create view public.registration_overview
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
  r.created_at
from public.registrations r
join public.competitions c on c.id = r.competition_id
left join public.registration_members l on l.registration_id = r.id and l.is_leader;

-- Accepted teams and people per competition. Sum the rows in the app for the overall total.
create view public.competition_stats
with (security_invoker = true)
as
select
  c.id as competition_id,
  c.name,
  c.type,
  count(distinct r.id) filter (where r.status = 'accepted') as accepted_teams,
  count(m.id) filter (where r.status = 'accepted') as accepted_people,
  count(distinct r.id) filter (where r.status = 'under_review') as under_review_teams,
  count(distinct r.id) as total_teams
from public.competitions c
left join public.registrations r on r.competition_id = c.id
left join public.registration_members m on m.registration_id = r.id
group by c.id, c.name, c.type;

-- =============================================================================
-- Competitive programming: sessions (admin start/stop, realtime)
-- =============================================================================

create table public.cp_sessions (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null unique references public.competitions (id) on delete cascade,
  status public.cp_session_status not null default 'scheduled',
  scheduled_start_at timestamptz, -- shown as a countdown; the admin still starts manually
  scheduled_end_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz,
  started_by uuid references public.profiles (id) on delete set null,
  submission_cooldown_seconds smallint not null default 10 check (submission_cooldown_seconds between 0 and 600),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cp_sessions_schedule check (
    scheduled_start_at is null or scheduled_end_at is null or scheduled_end_at > scheduled_start_at
  )
);

create index cp_sessions_started_by_idx on public.cp_sessions (started_by);

create or replace function private.cp_sessions_prepare()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform private.assert_cp_competition(new.competition_id);
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    if new.status = 'live' then
      new.started_at := now();
      new.started_by := (select auth.uid());
      new.ended_at := null;
    elsif new.status = 'ended' then
      new.ended_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger cp_sessions_prepare before insert or update on public.cp_sessions
  for each row execute function private.cp_sessions_prepare();
create trigger cp_sessions_set_updated_at before update on public.cp_sessions
  for each row execute function private.set_updated_at();

create or replace function private.is_cp_participant(p_competition_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.registrations r
    where r.competition_id = p_competition_id
      and r.status = 'accepted'
      and private.is_team_member(r.id)
  );
$$;

create or replace function private.cp_is_live(p_competition_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.cp_sessions
    where competition_id = p_competition_id and status = 'live'
  );
$$;

-- Used by src/proxy.ts: the caller's accepted CP teams and whether each contest is live.
create or replace function public.cp_access()
returns table (competition_id uuid, registration_id uuid, session_status public.cp_session_status)
language sql
stable
security definer
set search_path = ''
as $$
  select r.competition_id, r.id, coalesce(s.status, 'scheduled'::public.cp_session_status)
  from public.registrations r
  join public.competitions c on c.id = r.competition_id and c.type = 'competitive_programming'
  left join public.cp_sessions s on s.competition_id = r.competition_id
  where r.status = 'accepted' and private.is_team_member(r.id);
$$;

-- =============================================================================
-- Competitive programming: problems (levels) and test cases
-- =============================================================================

create table public.cp_problems (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  level smallint not null check (level >= 1),
  title text not null check (char_length(btrim(title)) between 1 and 120),
  statement text not null, -- markdown
  input_format text not null default '',
  output_format text not null default '',
  constraints text not null default '', -- e.g. "1 <= n <= 10^5"
  time_limit_ms integer not null default 1000 check (time_limit_ms between 100 and 15000),
  memory_limit_kb integer not null default 262144 check (memory_limit_kb between 16384 and 512000),
  points integer not null check (points > 0),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint cp_problems_competition_level_key unique (competition_id, level)
);

create trigger cp_problems_set_updated_at before update on public.cp_problems
  for each row execute function private.set_updated_at();

create table public.cp_test_cases (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.cp_problems (id) on delete cascade,
  ordinal smallint not null check (ordinal >= 1),
  input text not null default '' check (octet_length(input) <= 2097152),
  expected_output text not null check (octet_length(expected_output) <= 2097152),
  is_sample boolean not null default false, -- samples are shown to participants; the rest stay hidden
  created_at timestamptz not null default now(),
  constraint cp_test_cases_problem_ordinal_key unique (problem_id, ordinal)
);

create or replace function private.cp_problems_prepare()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  perform private.assert_cp_competition(new.competition_id);
  if new.is_published and not exists (
    select 1 from public.cp_test_cases where problem_id = new.id
  ) then
    raise exception 'Add at least one test case before publishing this problem' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger cp_problems_prepare before insert or update on public.cp_problems
  for each row execute function private.cp_problems_prepare();

create or replace function private.can_view_problem(p_problem_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.cp_problems p
    where p.id = p_problem_id
      and p.is_published
      and private.is_cp_participant(p.competition_id)
      and private.cp_is_live(p.competition_id)
  );
$$;

-- Admin form: saves a problem and replaces its test cases in one transaction.
-- p_problem: { "id"?, "competition_id", "level", "title", "statement", "input_format", "output_format",
--              "constraints", "time_limit_ms", "memory_limit_kb", "points", "is_published" }
-- p_test_cases: [{ "input", "expected_output", "is_sample" }, ...] in display order
-- Replacing test cases also deletes their per-test results on old submissions; scores are kept.
create or replace function public.admin_save_problem(p_problem jsonb, p_test_cases jsonb)
returns uuid
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_id uuid := (p_problem ->> 'id')::uuid;
begin
  if not private.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  if jsonb_typeof(p_test_cases) <> 'array' or jsonb_array_length(p_test_cases) = 0 then
    raise exception 'A problem needs at least one test case' using errcode = 'P0001';
  end if;

  if v_id is null then
    insert into public.cp_problems (
      competition_id, level, title, statement, input_format, output_format,
      constraints, time_limit_ms, memory_limit_kb, points, is_published
    )
    values (
      (p_problem ->> 'competition_id')::uuid,
      (p_problem ->> 'level')::smallint,
      p_problem ->> 'title',
      p_problem ->> 'statement',
      coalesce(p_problem ->> 'input_format', ''),
      coalesce(p_problem ->> 'output_format', ''),
      coalesce(p_problem ->> 'constraints', ''),
      coalesce((p_problem ->> 'time_limit_ms')::integer, 1000),
      coalesce((p_problem ->> 'memory_limit_kb')::integer, 262144),
      (p_problem ->> 'points')::integer,
      false
    )
    returning id into v_id;
  else
    update public.cp_problems set
      level = (p_problem ->> 'level')::smallint,
      title = p_problem ->> 'title',
      statement = p_problem ->> 'statement',
      input_format = coalesce(p_problem ->> 'input_format', ''),
      output_format = coalesce(p_problem ->> 'output_format', ''),
      constraints = coalesce(p_problem ->> 'constraints', ''),
      time_limit_ms = coalesce((p_problem ->> 'time_limit_ms')::integer, 1000),
      memory_limit_kb = coalesce((p_problem ->> 'memory_limit_kb')::integer, 262144),
      points = (p_problem ->> 'points')::integer,
      is_published = false
    where id = v_id;
    if not found then
      raise exception 'Problem % not found', v_id using errcode = 'P0002';
    end if;
    delete from public.cp_test_cases where problem_id = v_id;
  end if;

  insert into public.cp_test_cases (problem_id, ordinal, input, expected_output, is_sample)
  select
    v_id,
    t.ordinality::smallint,
    coalesce(t.value ->> 'input', ''),
    t.value ->> 'expected_output',
    coalesce((t.value ->> 'is_sample')::boolean, false)
  from jsonb_array_elements(p_test_cases) with ordinality as t;

  update public.cp_problems
  set is_published = coalesce((p_problem ->> 'is_published')::boolean, false)
  where id = v_id;

  return v_id;
end;
$$;

-- =============================================================================
-- Competitive programming: submissions
-- =============================================================================

-- Inserted only by the server (service role) after Judge0 has run every test case,
-- so participants can never write their own verdict or score.
create table public.cp_submissions (
  id uuid primary key default gen_random_uuid(),
  problem_id uuid not null references public.cp_problems (id) on delete cascade,
  registration_id uuid not null references public.registrations (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  language public.cp_language not null,
  source_code text not null check (octet_length(source_code) <= 65536),
  verdict public.cp_verdict not null, -- 'accepted' only when every test case passed
  passed smallint not null check (passed >= 0),
  total smallint not null check (total > 0),
  max_time_ms integer check (max_time_ms >= 0),
  max_memory_kb integer check (max_memory_kb >= 0),
  efficiency numeric(4, 3) not null default 0 check (efficiency between 0 and 1),
  score numeric(10, 2) not null default 0 check (score >= 0),
  compile_output text,
  created_at timestamptz not null default now(),
  constraint cp_submissions_passed_le_total check (passed <= total)
);

create index cp_submissions_team_problem_idx on public.cp_submissions (registration_id, problem_id, created_at desc);
create index cp_submissions_problem_id_idx on public.cp_submissions (problem_id);
create index cp_submissions_user_id_idx on public.cp_submissions (user_id);
create index cp_submissions_team_created_idx on public.cp_submissions (registration_id, created_at desc);

create table public.cp_submission_results (
  id bigint generated always as identity primary key,
  submission_id uuid not null references public.cp_submissions (id) on delete cascade,
  test_case_id uuid not null references public.cp_test_cases (id) on delete cascade,
  verdict public.cp_verdict not null,
  time_ms integer check (time_ms >= 0),
  memory_kb integer check (memory_kb >= 0),
  message text, -- trimmed stderr / compiler message; never the expected output of a hidden test
  constraint cp_submission_results_submission_test_key unique (submission_id, test_case_id)
);

create index cp_submission_results_test_case_id_idx on public.cp_submission_results (test_case_id);

-- Backstop for the server action: contest must be live, team accepted, cooldown respected.
create or replace function private.cp_submissions_check()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_competition_id uuid;
  v_cooldown smallint;
begin
  select p.competition_id into v_competition_id from public.cp_problems p where p.id = new.problem_id;

  if not exists (
    select 1 from public.registrations r
    where r.id = new.registration_id and r.competition_id = v_competition_id and r.status = 'accepted'
  ) then
    raise exception 'This team is not accepted in this competition' using errcode = '42501';
  end if;

  select s.submission_cooldown_seconds into v_cooldown
  from public.cp_sessions s
  where s.competition_id = v_competition_id and s.status = 'live';

  if not found then
    raise exception 'The contest is not running' using errcode = 'P0001';
  end if;

  if exists (
    select 1 from public.cp_submissions s
    where s.registration_id = new.registration_id
      and s.created_at > now() - make_interval(secs => v_cooldown)
  ) then
    raise exception 'Please wait % seconds between submissions', v_cooldown using errcode = 'P0001';
  end if;

  return new;
end;
$$;

create trigger cp_submissions_check before insert on public.cp_submissions
  for each row execute function private.cp_submissions_check();

-- =============================================================================
-- Competitive programming: scores and leaderboard
-- =============================================================================

-- Best result per team per problem.
create table public.cp_problem_scores (
  registration_id uuid not null references public.registrations (id) on delete cascade,
  problem_id uuid not null references public.cp_problems (id) on delete cascade,
  best_score numeric(10, 2) not null,
  best_submission_id uuid not null references public.cp_submissions (id) on delete cascade,
  solved boolean not null default false,
  achieved_at timestamptz not null,
  primary key (registration_id, problem_id)
);

create index cp_problem_scores_problem_id_idx on public.cp_problem_scores (problem_id);
create index cp_problem_scores_best_submission_id_idx on public.cp_problem_scores (best_submission_id);

-- Leaderboard row per team. Realtime source for /cp/leaderboard.
create table public.cp_scores (
  registration_id uuid primary key references public.registrations (id) on delete cascade,
  competition_id uuid not null references public.competitions (id) on delete cascade,
  team_name text not null, -- copied so realtime payloads can render without a join
  total_points numeric(12, 2) not null default 0,
  solved smallint not null default 0,
  last_improved_at timestamptz, -- tie-break: earlier wins
  updated_at timestamptz not null default now()
);

create index cp_scores_leaderboard_idx on public.cp_scores (competition_id, total_points desc, last_improved_at);

create or replace function private.cp_apply_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_improved integer;
  v_newly_solved integer;
begin
  insert into public.cp_problem_scores (registration_id, problem_id, best_score, best_submission_id, solved, achieved_at)
  values (new.registration_id, new.problem_id, new.score, new.id, new.verdict = 'accepted', new.created_at)
  on conflict (registration_id, problem_id) do update
    set best_score = excluded.best_score,
        best_submission_id = excluded.best_submission_id,
        solved = public.cp_problem_scores.solved or excluded.solved,
        achieved_at = excluded.achieved_at
    where excluded.best_score > public.cp_problem_scores.best_score;
  get diagnostics v_improved = row_count;

  update public.cp_problem_scores
  set solved = true
  where registration_id = new.registration_id and problem_id = new.problem_id
    and new.verdict = 'accepted' and not solved;
  get diagnostics v_newly_solved = row_count;

  if v_improved > 0 or v_newly_solved > 0 then
    insert into public.cp_scores (registration_id, competition_id, team_name, total_points, solved, last_improved_at)
    select
      r.id,
      r.competition_id,
      r.team_name,
      coalesce(sum(ps.best_score), 0),
      count(ps.problem_id) filter (where ps.solved),
      new.created_at
    from public.registrations r
    left join public.cp_problem_scores ps on ps.registration_id = r.id
    where r.id = new.registration_id
    group by r.id, r.competition_id, r.team_name
    on conflict (registration_id) do update
      set total_points = excluded.total_points,
          solved = excluded.solved,
          team_name = excluded.team_name,
          last_improved_at = case
            when excluded.total_points > public.cp_scores.total_points then excluded.last_improved_at
            else public.cp_scores.last_improved_at
          end,
          updated_at = now();
  end if;

  return null;
end;
$$;

create trigger cp_submissions_apply after insert on public.cp_submissions
  for each row execute function private.cp_apply_submission();

-- Keep the leaderboard in sync with registrations: accepted CP teams appear with 0 points,
-- teams that leave 'accepted' disappear, renames are copied.
create or replace function private.cp_sync_scoreboard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.status = 'accepted' and exists (
    select 1 from public.competitions c
    where c.id = new.competition_id and c.type = 'competitive_programming'
  ) then
    insert into public.cp_scores (registration_id, competition_id, team_name)
    values (new.id, new.competition_id, new.team_name)
    on conflict (registration_id) do update set team_name = excluded.team_name, updated_at = now();
  elsif tg_op = 'UPDATE' and old.status = 'accepted' and new.status <> 'accepted' then
    delete from public.cp_scores where registration_id = new.id;
  end if;
  return null;
end;
$$;

create trigger registrations_sync_scoreboard after insert or update of status, team_name on public.registrations
  for each row execute function private.cp_sync_scoreboard();

-- =============================================================================
-- Row Level Security
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.competitions enable row level security;
alter table public.registrations enable row level security;
alter table public.registration_members enable row level security;
alter table public.registration_events enable row level security;
alter table public.cp_sessions enable row level security;
alter table public.cp_problems enable row level security;
alter table public.cp_test_cases enable row level security;
alter table public.cp_submissions enable row level security;
alter table public.cp_submission_results enable row level security;
alter table public.cp_problem_scores enable row level security;
alter table public.cp_scores enable row level security;

-- profiles
create policy "profiles: read own or admin" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()));
create policy "profiles: update own or admin" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()) or (select private.is_admin()))
  with check (id = (select auth.uid()) or (select private.is_admin()));

-- competitions: active ones are public (landing page), admins manage all
create policy "competitions: public read active" on public.competitions
  for select to anon, authenticated
  using (is_active or (select private.is_admin()));
create policy "competitions: admin insert" on public.competitions
  for insert to authenticated with check ((select private.is_admin()));
create policy "competitions: admin update" on public.competitions
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "competitions: admin delete" on public.competitions
  for delete to authenticated using ((select private.is_admin()));

-- registrations
create policy "registrations: read own team or admin" on public.registrations
  for select to authenticated
  using ((select private.is_admin()) or leader_id = (select auth.uid()) or private.is_team_member(id));
-- Participants create teams through create_registration(); direct inserts are admin-only.
create policy "registrations: admin insert" on public.registrations
  for insert to authenticated
  with check ((select private.is_admin()));
create policy "registrations: leader or admin update" on public.registrations
  for update to authenticated
  using ((select private.is_admin()) or leader_id = (select auth.uid()))
  with check ((select private.is_admin()) or leader_id = (select auth.uid()));
create policy "registrations: leader deletes unpaid or admin" on public.registrations
  for delete to authenticated
  using ((select private.is_admin()) or (leader_id = (select auth.uid()) and status = 'pending_payment'));

-- registration_members
create policy "members: read own team or admin" on public.registration_members
  for select to authenticated
  using ((select private.is_admin()) or private.is_team_member(registration_id));
-- Members join through join_team(); direct inserts and edits are admin-only.
create policy "members: admin insert" on public.registration_members
  for insert to authenticated
  with check ((select private.is_admin()));
create policy "members: admin update" on public.registration_members
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
-- The leader can remove members and a member can leave, while the team is editable.
-- The leader row itself is protected by a trigger.
create policy "members: leader removes or member leaves while editable" on public.registration_members
  for delete to authenticated
  using (
    (select private.is_admin())
    or (
      not is_leader
      and private.registration_editable(registration_id)
      and (private.is_team_leader(registration_id) or user_id = (select auth.uid()))
    )
  );

-- registration_events: written only by trigger
create policy "events: read own team or admin" on public.registration_events
  for select to authenticated
  using ((select private.is_admin()) or private.is_team_member(registration_id));

-- cp_sessions: participants read (realtime), admins control
create policy "cp_sessions: participants and admin read" on public.cp_sessions
  for select to authenticated
  using ((select private.is_admin()) or private.is_cp_participant(competition_id));
create policy "cp_sessions: admin insert" on public.cp_sessions
  for insert to authenticated with check ((select private.is_admin()));
create policy "cp_sessions: admin update" on public.cp_sessions
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "cp_sessions: admin delete" on public.cp_sessions
  for delete to authenticated using ((select private.is_admin()));

-- cp_problems: participants see published problems only while the contest is live
create policy "cp_problems: live participants and admin read" on public.cp_problems
  for select to authenticated
  using ((select private.is_admin()) or private.can_view_problem(id));
create policy "cp_problems: admin insert" on public.cp_problems
  for insert to authenticated with check ((select private.is_admin()));
create policy "cp_problems: admin update" on public.cp_problems
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "cp_problems: admin delete" on public.cp_problems
  for delete to authenticated using ((select private.is_admin()));

-- cp_test_cases: participants see sample cases only; hidden cases are read by the server
create policy "cp_test_cases: samples for live participants, all for admin" on public.cp_test_cases
  for select to authenticated
  using ((select private.is_admin()) or (is_sample and private.can_view_problem(problem_id)));
create policy "cp_test_cases: admin insert" on public.cp_test_cases
  for insert to authenticated with check ((select private.is_admin()));
create policy "cp_test_cases: admin update" on public.cp_test_cases
  for update to authenticated using ((select private.is_admin())) with check ((select private.is_admin()));
create policy "cp_test_cases: admin delete" on public.cp_test_cases
  for delete to authenticated using ((select private.is_admin()));

-- cp_submissions / results / problem scores: team reads its own, inserts come from the service role
create policy "cp_submissions: own team or admin read" on public.cp_submissions
  for select to authenticated
  using ((select private.is_admin()) or private.is_team_member(registration_id));
create policy "cp_submission_results: own team or admin read" on public.cp_submission_results
  for select to authenticated
  using (
    (select private.is_admin()) or exists (
      select 1 from public.cp_submissions s
      where s.id = submission_id and private.is_team_member(s.registration_id)
    )
  );
create policy "cp_problem_scores: own team or admin read" on public.cp_problem_scores
  for select to authenticated
  using ((select private.is_admin()) or private.is_team_member(registration_id));

-- cp_scores: everyone in the contest sees the leaderboard
create policy "cp_scores: participants and admin read" on public.cp_scores
  for select to authenticated
  using ((select private.is_admin()) or private.is_cp_participant(competition_id));

-- =============================================================================
-- Function privileges
-- =============================================================================

revoke all on all functions in schema private from public, anon;
grant execute on all functions in schema private to authenticated, service_role;

revoke all on function public.create_registration(uuid, text, text, text, text) from public, anon;
grant execute on function public.create_registration(uuid, text, text, text, text) to authenticated;
revoke all on function public.preview_team(text) from public, anon;
grant execute on function public.preview_team(text) to authenticated;
revoke all on function public.join_team(text, text, text, text) from public, anon;
grant execute on function public.join_team(text, text, text, text) to authenticated;
revoke all on function public.cp_access() from public, anon;
grant execute on function public.cp_access() to authenticated;
revoke all on function public.admin_save_problem(jsonb, jsonb) from public, anon;
grant execute on function public.admin_save_problem(jsonb, jsonb) to authenticated;

-- =============================================================================
-- Realtime
-- =============================================================================

-- cp_sessions: admin start/stop. cp_scores: leaderboard. registration_events: live dashboard timeline.
alter publication supabase_realtime add table public.cp_sessions, public.cp_scores, public.registration_events;
