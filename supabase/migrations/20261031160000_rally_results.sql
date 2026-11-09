-- Rally Games results: team QR token, results, audit log, and the RPCs that are the only way to change them.
-- One active result per team per post is a temporary rule until the Divisi Event decides on replays:
-- allowing them only means changing rally_results_one_active and the check in rally_record_result.

-- The token is separate from the referral code so it can be replaced without changing the code members join with.
alter table public.registrations
  add column rally_qr_token uuid not null default gen_random_uuid() unique;

create type public.rally_outcome as enum ('win', 'lose', 'draw');
create type public.rally_log_action as enum ('recorded', 'undone', 'corrected', 'deleted');

-- Results are never removed, only voided, so teams, posts and LOs with history cannot be deleted.
create table public.rally_results (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations (id) on delete restrict,
  post_id uuid not null references public.rally_posts (id) on delete restrict,
  outcome public.rally_outcome not null,
  points integer not null check (points >= 0), -- copied when recorded: later edits to the post don't change it
  client_request_id uuid not null unique, -- a retry after a dropped connection does not record twice
  recorded_by uuid not null references public.profiles (id) on delete restrict,
  recorded_at timestamptz not null default now(),
  voided_at timestamptz,
  voided_by uuid references public.profiles (id) on delete restrict,
  void_reason text
);

create unique index rally_results_one_active on public.rally_results (registration_id, post_id) where voided_at is null;
create index rally_results_post_id_idx on public.rally_results (post_id, recorded_at desc);
create index rally_results_recorded_by_idx on public.rally_results (recorded_by);
create index rally_results_voided_by_idx on public.rally_results (voided_by);

-- Append-only: written only by the functions below.
create table public.rally_result_log (
  id bigint generated always as identity primary key,
  result_id uuid not null references public.rally_results (id) on delete restrict,
  registration_id uuid not null references public.registrations (id) on delete restrict,
  post_id uuid not null references public.rally_posts (id) on delete restrict,
  action public.rally_log_action not null,
  actor_id uuid not null references public.profiles (id) on delete restrict,
  old_outcome public.rally_outcome,
  new_outcome public.rally_outcome,
  old_points integer,
  new_points integer,
  reason text,
  created_at timestamptz not null default now()
);

create index rally_result_log_result_id_idx on public.rally_result_log (result_id);
create index rally_result_log_registration_id_idx on public.rally_result_log (registration_id, created_at desc);
create index rally_result_log_post_id_idx on public.rally_result_log (post_id, created_at desc);
create index rally_result_log_actor_id_idx on public.rally_result_log (actor_id);

-- How long an LO can undo their own input. After this only an admin can change it.
create or replace function private.rally_undo_window()
returns interval
language sql
immutable
set search_path = ''
as $$
  select interval '5 minutes';
$$;

create or replace function private.is_lo_of_post(p_post_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.rally_post_assignments
    where post_id = p_post_id and lo_id = (select auth.uid())
  );
$$;

create or replace function private.rally_assert_can_record(p_post_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not private.is_lo_of_post(p_post_id) then
    raise exception 'You are not assigned to this post' using errcode = '42501';
  end if;
  if not exists (select 1 from public.rally_posts where id = p_post_id and is_active) then
    raise exception 'This post is not active' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function private.rally_assert_team(p_post_id uuid, p_registration_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_status public.registration_status;
begin
  select r.status into v_status
  from public.registrations r
  join public.rally_posts p on p.competition_id = r.competition_id
  where r.id = p_registration_id and p.id = p_post_id;

  if not found then
    raise exception 'This team is not in this competition' using errcode = 'P0001';
  end if;
  if v_status <> 'accepted' then
    raise exception 'This team has not been accepted' using errcode = 'P0001';
  end if;
end;
$$;

create or replace function private.rally_points(p_post_id uuid, p_outcome public.rally_outcome)
returns integer
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_post public.rally_posts;
begin
  select * into strict v_post from public.rally_posts where id = p_post_id;
  if p_outcome = 'draw' and not v_post.allow_draw then
    raise exception 'This post does not allow a draw' using errcode = 'P0001';
  end if;
  return case p_outcome
    when 'win' then v_post.points_win
    when 'lose' then v_post.points_lose
    else v_post.points_draw
  end;
end;
$$;

-- p_code is what the QR holds (nplc-rally:<token>) or the team code typed by hand.
-- Returns only what the LO needs to confirm the team: no NISN, phone or email.
create or replace function public.rally_lookup_team(p_post_id uuid, p_code text)
returns table (
  registration_id uuid,
  team_name text,
  school text,
  result_id uuid,
  outcome public.rally_outcome,
  points integer,
  recorded_at timestamptz,
  undo_until timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_code text := btrim(coalesce(p_code, ''));
  v_id uuid;
begin
  perform private.rally_assert_can_record(p_post_id);

  if v_code ~* '^nplc-rally:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    select r.id into v_id from public.registrations r where r.rally_qr_token = substr(v_code, 12)::uuid;
  else
    select r.id into v_id from public.registrations r where r.referral_code = upper(v_code);
  end if;

  if v_id is null then
    raise exception 'No team matches this code' using errcode = 'P0002';
  end if;
  perform private.rally_assert_team(p_post_id, v_id);

  return query
  select
    r.id,
    r.team_name,
    r.school,
    x.id,
    x.outcome,
    x.points,
    x.recorded_at,
    -- Only the LO who recorded it can undo it.
    case when x.recorded_by = (select auth.uid()) then x.recorded_at + private.rally_undo_window() end
  from public.registrations r
  left join public.rally_results x on x.registration_id = r.id and x.post_id = p_post_id and x.voided_at is null
  where r.id = v_id;
end;
$$;

create or replace function public.rally_record_result(
  p_post_id uuid,
  p_registration_id uuid,
  p_outcome public.rally_outcome,
  p_client_request_id uuid
)
returns table (
  result_id uuid,
  outcome public.rally_outcome,
  points integer,
  recorded_at timestamptz,
  undo_until timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
#variable_conflict use_column
declare
  v_uid uuid := (select auth.uid());
  v_points integer;
  v_result public.rally_results;
begin
  perform private.rally_assert_can_record(p_post_id);
  perform private.rally_assert_team(p_post_id, p_registration_id);
  v_points := private.rally_points(p_post_id, p_outcome);

  insert into public.rally_results (registration_id, post_id, outcome, points, client_request_id, recorded_by)
  values (p_registration_id, p_post_id, p_outcome, v_points, p_client_request_id, v_uid)
  on conflict do nothing
  returning * into v_result;

  if v_result.id is null then
    -- A retry of the same request returns what was already saved instead of an error.
    select * into v_result from public.rally_results x
    where x.client_request_id = p_client_request_id
      and x.recorded_by = v_uid
      and x.registration_id = p_registration_id
      and x.post_id = p_post_id;
    if v_result.id is null then
      raise exception 'This team already has a result at this post' using errcode = '23505';
    end if;
  else
    insert into public.rally_result_log (result_id, registration_id, post_id, action, actor_id, new_outcome, new_points)
    values (v_result.id, p_registration_id, p_post_id, 'recorded', v_uid, p_outcome, v_points);
  end if;

  return query select v_result.id, v_result.outcome, v_result.points, v_result.recorded_at, v_result.recorded_at + private.rally_undo_window();
end;
$$;

-- The LO's latest inputs at a post. LOs cannot read registrations, so this returns only the team's name.
create or replace function public.rally_recent_results(p_post_id uuid)
returns table (
  result_id uuid,
  team_name text,
  outcome public.rally_outcome,
  points integer,
  recorded_at timestamptz,
  undo_until timestamptz
)
language plpgsql
stable
security definer
set search_path = ''
as $$
#variable_conflict use_column
begin
  if not private.is_lo_of_post(p_post_id) then
    raise exception 'You are not assigned to this post' using errcode = '42501';
  end if;

  return query
  select
    x.id,
    r.team_name,
    x.outcome,
    x.points,
    x.recorded_at,
    case when x.recorded_by = (select auth.uid()) then x.recorded_at + private.rally_undo_window() end
  from public.rally_results x
  join public.registrations r on r.id = x.registration_id
  where x.post_id = p_post_id and x.voided_at is null
  order by x.recorded_at desc
  limit 10;
end;
$$;

create or replace function public.rally_undo_result(p_result_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_result public.rally_results;
begin
  select * into v_result from public.rally_results where id = p_result_id for update;
  if not found or not private.is_lo_of_post(v_result.post_id) or v_result.recorded_by <> v_uid then
    raise exception 'Only the LO who recorded a result can undo it' using errcode = '42501';
  end if;
  if v_result.voided_at is not null then
    raise exception 'This result was already cancelled' using errcode = 'P0001';
  end if;
  if now() > v_result.recorded_at + private.rally_undo_window() then
    raise exception 'The undo window has passed' using errcode = 'P0001';
  end if;

  update public.rally_results set voided_at = now(), voided_by = v_uid, void_reason = 'Undone by LO' where id = p_result_id;

  insert into public.rally_result_log (result_id, registration_id, post_id, action, actor_id, old_outcome, old_points, reason)
  values (p_result_id, v_result.registration_id, v_result.post_id, 'undone', v_uid, v_result.outcome, v_result.points, 'Undone by LO');
end;
$$;

-- Admin only, reason required. The old result is voided and a new one takes its place.
create or replace function public.rally_admin_correct_result(p_result_id uuid, p_outcome public.rally_outcome, p_reason text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_reason text := btrim(coalesce(p_reason, ''));
  v_result public.rally_results;
  v_points integer;
  v_new_id uuid;
begin
  if not private.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  if char_length(v_reason) < 5 then
    raise exception 'A reason is required' using errcode = 'P0001';
  end if;

  select * into v_result from public.rally_results where id = p_result_id for update;
  if not found or v_result.voided_at is not null then
    raise exception 'This result was already cancelled' using errcode = 'P0001';
  end if;
  if v_result.outcome = p_outcome then
    raise exception 'The new result is the same as the old one' using errcode = 'P0001';
  end if;
  v_points := private.rally_points(v_result.post_id, p_outcome);

  update public.rally_results set voided_at = now(), voided_by = v_uid, void_reason = v_reason where id = p_result_id;

  insert into public.rally_results (registration_id, post_id, outcome, points, client_request_id, recorded_by)
  values (v_result.registration_id, v_result.post_id, p_outcome, v_points, gen_random_uuid(), v_uid)
  returning id into v_new_id;

  insert into public.rally_result_log (result_id, registration_id, post_id, action, actor_id, old_outcome, new_outcome, old_points, new_points, reason)
  values (v_new_id, v_result.registration_id, v_result.post_id, 'corrected', v_uid, v_result.outcome, p_outcome, v_result.points, v_points, v_reason);

  return v_new_id;
end;
$$;

create or replace function public.rally_admin_delete_result(p_result_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_reason text := btrim(coalesce(p_reason, ''));
  v_result public.rally_results;
begin
  if not private.is_admin() then
    raise exception 'Admins only' using errcode = '42501';
  end if;
  if char_length(v_reason) < 5 then
    raise exception 'A reason is required' using errcode = 'P0001';
  end if;

  select * into v_result from public.rally_results where id = p_result_id for update;
  if not found or v_result.voided_at is not null then
    raise exception 'This result was already cancelled' using errcode = 'P0001';
  end if;

  update public.rally_results set voided_at = now(), voided_by = v_uid, void_reason = v_reason where id = p_result_id;

  insert into public.rally_result_log (result_id, registration_id, post_id, action, actor_id, old_outcome, old_points, reason)
  values (p_result_id, v_result.registration_id, v_result.post_id, 'deleted', v_uid, v_result.outcome, v_result.points, v_reason);
end;
$$;

-- Participants cannot change the QR token, like the other team fields.
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

-- Reading only: every change goes through the functions above.
revoke all on table public.rally_results from anon, authenticated;
revoke all on table public.rally_result_log from anon, authenticated;
grant select on table public.rally_results to authenticated;
grant select on table public.rally_result_log to authenticated;
grant all on table public.rally_results to service_role;
grant all on table public.rally_result_log to service_role;

alter table public.rally_results enable row level security;
alter table public.rally_result_log enable row level security;

grant execute on function private.is_lo_of_post(uuid) to authenticated;

create policy "rally_results: read own post, own team or admin" on public.rally_results
  for select to authenticated
  using (
    (select private.is_admin())
    or private.is_lo_of_post(post_id)
    or private.is_team_member(registration_id)
  );

create policy "rally_result_log: admin read" on public.rally_result_log
  for select to authenticated
  using ((select private.is_admin()));

revoke all on function public.rally_lookup_team(uuid, text) from public, anon;
revoke all on function public.rally_record_result(uuid, uuid, public.rally_outcome, uuid) from public, anon;
revoke all on function public.rally_recent_results(uuid) from public, anon;
revoke all on function public.rally_undo_result(uuid) from public, anon;
revoke all on function public.rally_admin_correct_result(uuid, public.rally_outcome, text) from public, anon;
revoke all on function public.rally_admin_delete_result(uuid, text) from public, anon;
grant execute on function public.rally_lookup_team(uuid, text) to authenticated;
grant execute on function public.rally_record_result(uuid, uuid, public.rally_outcome, uuid) to authenticated;
grant execute on function public.rally_recent_results(uuid) to authenticated;
grant execute on function public.rally_undo_result(uuid) to authenticated;
grant execute on function public.rally_admin_correct_result(uuid, public.rally_outcome, text) to authenticated;
grant execute on function public.rally_admin_delete_result(uuid, text) to authenticated;
