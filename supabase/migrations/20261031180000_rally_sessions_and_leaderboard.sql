-- Rally Games: the session an admin opens and closes, and the live leaderboard with its freeze.
-- Follows the CP contest: cp_sessions, cp_scores and cp_leaderboard_snapshots.
-- The ranking order lives in the app (src/lib/rally/ranking.ts), so these tables only hold the numbers.

create type public.rally_session_status as enum ('not_open', 'open', 'closed');

create table public.rally_sessions (
  competition_id uuid primary key references public.competitions (id) on delete cascade,
  status public.rally_session_status not null default 'not_open',
  leaderboard_frozen_at timestamptz,
  updated_at timestamptz not null default now()
);

create trigger rally_sessions_set_updated_at before update on public.rally_sessions
  for each row execute function private.set_updated_at();

insert into public.rally_sessions (competition_id)
select id from public.competitions where type = 'logic'
on conflict do nothing;

-- Every Rally competition has a session, including ones created after this migration (the seed runs later).
create or replace function private.competitions_create_rally_session()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.type = 'logic' then
    insert into public.rally_sessions (competition_id) values (new.id) on conflict do nothing;
  end if;
  return null;
end;
$$;

create trigger competitions_create_rally_session after insert or update of type on public.competitions
  for each row execute function private.competitions_create_rally_session();

-- Recording, and undoing, need an open session. Admin corrections do not: results often get fixed after closing.
create or replace function private.rally_assert_session_open(p_post_id uuid)
returns void
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not exists (
    select 1 from public.rally_posts p
    join public.rally_sessions s on s.competition_id = p.competition_id
    where p.id = p_post_id and s.status = 'open'
  ) then
    raise exception 'The Rally session is not open' using errcode = 'P0001';
  end if;
end;
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
  perform private.rally_assert_session_open(p_post_id);
  if not exists (select 1 from public.rally_posts where id = p_post_id and is_active) then
    raise exception 'This post is not active' using errcode = 'P0001';
  end if;
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
  if not found or not private.is_lo_of_post(v_result.post_id) or v_result.recorded_by <> v_uid or v_result.corrected_by is not null then
    raise exception 'Only the LO who recorded a result can undo it' using errcode = '42501';
  end if;
  perform private.rally_assert_session_open(v_result.post_id);
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

-- One row per accepted team, kept up to date by the triggers below.
create table public.rally_scores (
  registration_id uuid primary key references public.registrations (id) on delete cascade,
  competition_id uuid not null references public.competitions (id) on delete cascade,
  team_name text not null,
  school text,
  total_points integer not null default 0,
  posts_finished integer not null default 0,
  last_result_at timestamptz
);

create index rally_scores_competition_id_idx on public.rally_scores (competition_id);

create table public.rally_leaderboard_snapshots (
  registration_id uuid primary key references public.registrations (id) on delete cascade,
  competition_id uuid not null references public.competitions (id) on delete cascade,
  team_name text not null,
  school text,
  total_points integer not null default 0,
  posts_finished integer not null default 0,
  last_result_at timestamptz
);

create index rally_leaderboard_snapshots_competition_id_idx on public.rally_leaderboard_snapshots (competition_id);

-- Counts active results only: undone, corrected and deleted ones are voided.
create or replace function private.rally_refresh_score(p_registration_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.rally_scores s
  set total_points = totals.points, posts_finished = totals.posts, last_result_at = totals.last_at
  from (
    select coalesce(sum(points), 0)::integer as points, count(*)::integer as posts, max(recorded_at) as last_at
    from public.rally_results
    where registration_id = p_registration_id and voided_at is null
  ) totals
  where s.registration_id = p_registration_id;
end;
$$;

create or replace function private.rally_results_refresh_score()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.rally_refresh_score(new.registration_id);
  return null;
end;
$$;

create trigger rally_results_refresh_score after insert or update on public.rally_results
  for each row execute function private.rally_results_refresh_score();

-- A team is on the leaderboard while it is accepted, with its current name and school.
create or replace function private.registrations_sync_rally_score()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.competitions where id = new.competition_id and type = 'logic') then
    return null;
  end if;

  if new.status = 'accepted' then
    insert into public.rally_scores (registration_id, competition_id, team_name, school)
    values (new.id, new.competition_id, new.team_name, new.school)
    on conflict (registration_id) do update set team_name = excluded.team_name, school = excluded.school;
    perform private.rally_refresh_score(new.id);
  else
    delete from public.rally_scores where registration_id = new.id;
  end if;
  return null;
end;
$$;

create trigger registrations_sync_rally_score after insert or update of status, team_name, school on public.registrations
  for each row execute function private.registrations_sync_rally_score();

insert into public.rally_scores (registration_id, competition_id, team_name, school)
select r.id, r.competition_id, r.team_name, r.school
from public.registrations r
join public.competitions c on c.id = r.competition_id
where c.type = 'logic' and r.status = 'accepted';

select private.rally_refresh_score(registration_id) from public.rally_scores;

-- Freezing copies the live scores; unfreezing drops the copy.
create or replace function private.rally_sessions_snapshot_leaderboard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.rally_leaderboard_snapshots where competition_id = new.competition_id;
  if new.leaderboard_frozen_at is not null then
    insert into public.rally_leaderboard_snapshots (registration_id, competition_id, team_name, school, total_points, posts_finished, last_result_at)
    select registration_id, competition_id, team_name, school, total_points, posts_finished, last_result_at
    from public.rally_scores
    where competition_id = new.competition_id;
  end if;
  return null;
end;
$$;

create trigger rally_sessions_snapshot_leaderboard
  after update of leaderboard_frozen_at on public.rally_sessions
  for each row
  when (old.leaderboard_frozen_at is distinct from new.leaderboard_frozen_at)
  execute function private.rally_sessions_snapshot_leaderboard();

create or replace function private.is_rally_participant(p_competition_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.registration_members m
    join public.registrations r on r.id = m.registration_id
    where m.user_id = (select auth.uid()) and r.competition_id = p_competition_id and r.status = 'accepted'
  );
$$;

create or replace function private.rally_is_frozen(p_competition_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select leaderboard_frozen_at is not null from public.rally_sessions where competition_id = p_competition_id), false);
$$;

grant execute on function private.is_rally_participant(uuid) to authenticated;
grant execute on function private.rally_is_frozen(uuid) to authenticated;

revoke all on table public.rally_sessions from anon;
revoke all on table public.rally_scores from anon, authenticated;
revoke all on table public.rally_leaderboard_snapshots from anon, authenticated;
grant select, insert, update on table public.rally_sessions to authenticated;
grant select on table public.rally_scores to authenticated;
grant select on table public.rally_leaderboard_snapshots to authenticated;
grant all on table public.rally_sessions to service_role;
grant all on table public.rally_scores to service_role;
grant all on table public.rally_leaderboard_snapshots to service_role;

alter table public.rally_sessions enable row level security;
alter table public.rally_scores enable row level security;
alter table public.rally_leaderboard_snapshots enable row level security;

create policy "rally_sessions: signed-in read" on public.rally_sessions
  for select to authenticated
  using (true);
create policy "rally_sessions: admin insert" on public.rally_sessions
  for insert to authenticated
  with check ((select private.is_admin()));
create policy "rally_sessions: admin update" on public.rally_sessions
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

create policy "rally_scores: admin, or participants while not frozen" on public.rally_scores
  for select to authenticated
  using (
    (select private.is_admin())
    or (private.is_rally_participant(competition_id) and not private.rally_is_frozen(competition_id))
  );

create policy "rally_snapshots: admin, or participants while frozen" on public.rally_leaderboard_snapshots
  for select to authenticated
  using (
    (select private.is_admin())
    or (private.is_rally_participant(competition_id) and private.rally_is_frozen(competition_id))
  );

alter publication supabase_realtime add table public.rally_sessions, public.rally_scores;
