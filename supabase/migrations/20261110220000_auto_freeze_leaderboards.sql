-- HOD decision (10 Nov 2026): participants stop seeing the live leaderboard in the last hour of the CP contest and of
-- the Rally Games. They see the standings as they were at that moment until an admin opens it again; results are
-- announced at the closing. Admins always see live scores.
--
-- How the freeze happens without a scheduler:
-- * The first score change after the cut-off freezes the leaderboard BEFORE it is applied (trigger on cp_scores /
--   rally_scores), so the snapshot holds the standings exactly as they were at the cut-off.
-- * Pages call *_leaderboard_freeze_check() when they load. If no score changed since the cut-off, the current scores
--   are still the cut-off standings, so freezing then gives the same snapshot.
-- Freezing uses the existing leaderboard_frozen_at + snapshot tables, so RLS, the participant views and the end of
-- participant realtime work exactly as with a manual freeze.

-- FREEZE_MINUTES: the one place that sets how long before the end the participants' leaderboard closes.
create or replace function private.leaderboard_freeze_minutes()
returns integer
language sql
immutable
set search_path = ''
as $$
  select 60;
$$;

create or replace function private.leaderboard_auto_freeze_at(p_end timestamptz)
returns timestamptz
language sql
immutable
set search_path = ''
as $$
  select p_end - make_interval(mins => private.leaderboard_freeze_minutes());
$$;

-- leaderboard_frozen_auto: the current freeze came from the cut-off (participants see "closed for the last hour").
-- leaderboard_released_at: an admin opened the leaderboard again after the cut-off, so it is not frozen again.
alter table public.cp_sessions
  add column leaderboard_frozen_auto boolean not null default false,
  add column leaderboard_released_at timestamptz;

-- The Rally has no timer of its own: the admin sets when it ends, for the cut-off only.
alter table public.rally_sessions
  add column scheduled_end_at timestamptz,
  add column leaderboard_frozen_auto boolean not null default false,
  add column leaderboard_released_at timestamptz;

-- ----- CP -----

create or replace function private.cp_auto_freeze(p_competition_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.cp_sessions
  set leaderboard_frozen_at = private.leaderboard_auto_freeze_at(scheduled_end_at),
      leaderboard_frozen_auto = true
  where competition_id = p_competition_id
    and status in ('live', 'paused')
    and leaderboard_frozen_at is null
    and leaderboard_released_at is null
    and scheduled_end_at is not null
    and now() >= private.leaderboard_auto_freeze_at(scheduled_end_at);
end;
$$;

create or replace function private.cp_scores_auto_freeze()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.cp_auto_freeze(new.competition_id);
  return new;
end;
$$;

create trigger cp_scores_auto_freeze before insert or update on public.cp_scores
  for each row execute function private.cp_scores_auto_freeze();

-- Admin freezes and unfreezes are manual; unfreezing after the cut-off keeps the leaderboard open until the end.
-- A new run of the contest (a start, not a resume) starts with a clean slate.
create or replace function private.cp_sessions_track_freeze()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'live' and old.status not in ('live', 'paused') then
    new.leaderboard_released_at := null;
  end if;
  if new.leaderboard_frozen_at is distinct from old.leaderboard_frozen_at then
    if new.leaderboard_frozen_auto is not distinct from old.leaderboard_frozen_auto then
      new.leaderboard_frozen_auto := false;
    end if;
    if new.leaderboard_frozen_at is null and new.scheduled_end_at is not null
      and now() >= private.leaderboard_auto_freeze_at(new.scheduled_end_at) then
      new.leaderboard_released_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger cp_sessions_track_freeze before update on public.cp_sessions
  for each row execute function private.cp_sessions_track_freeze();

-- Called by the contest pages: applies the cut-off if it has passed and returns when the participants' leaderboard
-- closes (null when it will not close on its own: no end time yet, opened again by an admin, or not running).
create or replace function public.cp_leaderboard_freeze_check(p_competition_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_at timestamptz;
begin
  perform private.cp_auto_freeze(p_competition_id);
  select private.leaderboard_auto_freeze_at(scheduled_end_at) into v_at
  from public.cp_sessions
  where competition_id = p_competition_id
    and status in ('live', 'paused')
    and leaderboard_released_at is null
    and scheduled_end_at is not null;
  return v_at;
end;
$$;

-- ----- Rally -----

create or replace function private.rally_auto_freeze(p_competition_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.rally_sessions
  set leaderboard_frozen_at = private.leaderboard_auto_freeze_at(scheduled_end_at),
      leaderboard_frozen_auto = true
  where competition_id = p_competition_id
    and status = 'open'
    and leaderboard_frozen_at is null
    and leaderboard_released_at is null
    and scheduled_end_at is not null
    and now() >= private.leaderboard_auto_freeze_at(scheduled_end_at);
end;
$$;

create or replace function private.rally_scores_auto_freeze()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.rally_auto_freeze(new.competition_id);
  return new;
end;
$$;

create trigger rally_scores_auto_freeze before insert or update on public.rally_scores
  for each row execute function private.rally_scores_auto_freeze();

create or replace function private.rally_sessions_track_freeze()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'open' and old.status = 'not_open' then
    new.leaderboard_released_at := null;
  end if;
  -- A new end time is a new cut-off.
  if new.scheduled_end_at is distinct from old.scheduled_end_at then
    new.leaderboard_released_at := null;
  end if;
  if new.leaderboard_frozen_at is distinct from old.leaderboard_frozen_at then
    if new.leaderboard_frozen_auto is not distinct from old.leaderboard_frozen_auto then
      new.leaderboard_frozen_auto := false;
    end if;
    if new.leaderboard_frozen_at is null and new.scheduled_end_at is not null
      and now() >= private.leaderboard_auto_freeze_at(new.scheduled_end_at) then
      new.leaderboard_released_at := now();
    end if;
  end if;
  return new;
end;
$$;

create trigger rally_sessions_track_freeze before update on public.rally_sessions
  for each row execute function private.rally_sessions_track_freeze();

create or replace function public.rally_leaderboard_freeze_check(p_competition_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_at timestamptz;
begin
  perform private.rally_auto_freeze(p_competition_id);
  select private.leaderboard_auto_freeze_at(scheduled_end_at) into v_at
  from public.rally_sessions
  where competition_id = p_competition_id
    and status = 'open'
    and leaderboard_released_at is null
    and scheduled_end_at is not null;
  return v_at;
end;
$$;

-- ----- Privileges -----

revoke all on function private.leaderboard_freeze_minutes() from public, anon;
revoke all on function private.leaderboard_auto_freeze_at(timestamptz) from public, anon;
revoke all on function private.cp_auto_freeze(uuid) from public, anon, authenticated;
revoke all on function private.cp_scores_auto_freeze() from public, anon, authenticated;
revoke all on function private.cp_sessions_track_freeze() from public, anon, authenticated;
revoke all on function private.rally_auto_freeze(uuid) from public, anon, authenticated;
revoke all on function private.rally_scores_auto_freeze() from public, anon, authenticated;
revoke all on function private.rally_sessions_track_freeze() from public, anon, authenticated;
revoke all on function public.cp_leaderboard_freeze_check(uuid) from public, anon;
revoke all on function public.rally_leaderboard_freeze_check(uuid) from public, anon;

grant execute on function private.leaderboard_freeze_minutes() to authenticated, service_role;
grant execute on function private.leaderboard_auto_freeze_at(timestamptz) to authenticated, service_role;
grant execute on function public.cp_leaderboard_freeze_check(uuid) to authenticated, service_role;
grant execute on function public.rally_leaderboard_freeze_check(uuid) to authenticated, service_role;
