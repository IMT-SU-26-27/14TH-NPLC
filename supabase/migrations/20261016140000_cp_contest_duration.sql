-- Contest duration and automatic end.
-- * The admin sets duration_seconds before starting. On start the end time becomes
--   started_at + duration (+ pauses, which cp_sessions_prepare already adds on resume).
-- * Changing the duration while the contest is running moves the end time accordingly.
-- * Once the time is up, submissions are refused (2-minute grace for code that was already being
--   judged when time ran out; the server action itself checks the deadline strictly on arrival),
--   and cp_finish_if_time_up() ends the contest. Any signed-in page with the timer calls it at zero.

alter table public.cp_sessions
  add column duration_seconds integer check (duration_seconds is null or duration_seconds between 1 and 172800);

-- Runs after cp_sessions_prepare (triggers of the same timing fire in name order), so started_at
-- and paused_seconds are already set for this update.
create or replace function private.cp_sessions_set_end()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'scheduled' then
    new.scheduled_end_at := null;
  elsif new.duration_seconds is not null
    and new.started_at is not null
    and new.status in ('live', 'paused')
    and (
      tg_op = 'INSERT'
      or new.started_at is distinct from old.started_at
      or new.duration_seconds is distinct from old.duration_seconds
    ) then
    new.scheduled_end_at := new.started_at + make_interval(secs => new.duration_seconds + new.paused_seconds);
  end if;
  return new;
end;
$$;

create trigger cp_sessions_set_end before insert or update on public.cp_sessions
  for each row execute function private.cp_sessions_set_end();

-- Same checks as before, plus: no submissions once the contest time is over.
create or replace function private.cp_submissions_check()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_competition_id uuid;
  v_cooldown smallint;
  v_end timestamptz;
begin
  select p.competition_id into v_competition_id from public.cp_problems p where p.id = new.problem_id;

  if not exists (
    select 1 from public.registrations r
    where r.id = new.registration_id and r.competition_id = v_competition_id and r.status = 'accepted'
  ) then
    raise exception 'This team is not accepted in this competition' using errcode = '42501';
  end if;

  select s.submission_cooldown_seconds, s.scheduled_end_at into v_cooldown, v_end
  from public.cp_sessions s
  where s.competition_id = v_competition_id and s.status = 'live';

  if not found then
    raise exception 'The contest is not running' using errcode = 'P0001';
  end if;

  if v_end is not null and now() > v_end + interval '2 minutes' then
    raise exception 'The contest time is over' using errcode = 'P0001';
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

-- Ends a running contest whose time is up. Safe for any signed-in user to call: it does nothing
-- before the end time. Returns true when it ended the contest.
create or replace function public.cp_finish_if_time_up(p_competition_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.cp_sessions
  set status = 'ended'
  where competition_id = p_competition_id
    and status = 'live'
    and scheduled_end_at is not null
    and scheduled_end_at <= now();
  return found;
end;
$$;

revoke all on function private.cp_sessions_set_end() from public, anon;
revoke all on function public.cp_finish_if_time_up(uuid) from public, anon;
grant execute on function public.cp_finish_if_time_up(uuid) to authenticated, service_role;
