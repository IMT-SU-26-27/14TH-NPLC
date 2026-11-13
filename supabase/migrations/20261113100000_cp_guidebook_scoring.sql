-- CP scoring follows the published Programming guidebook (decided 13 Nov 2026):
-- * A problem is Accepted only when every test case passes and then earns its points (+100 by default).
--   There is no partial credit and no efficiency multiplier any more.
-- * Every other submission costs the session's wrong_penalty (10 by default). Judge failures
--   (internal_error, exec_format_error) never cost anything; compile errors can be exempted per session.
-- * Accepted again on a solved problem is "Yes - Solved": no points, but a faster run replaces the
--   problem's runtime and memory.
-- * Ties: higher total, then lower total runtime, then lower total memory (sums over solved problems of the
--   best accepted run's slowest test and highest memory).
-- submission.score now holds the change that submission made to the team total (+points, 0 or -penalty).

-- 1. Session settings
alter table public.cp_sessions
  add column wrong_penalty smallint not null default 10 check (wrong_penalty between 0 and 1000),
  add column penalize_compile_error boolean not null default true;

-- 2. Submissions
alter table public.cp_submissions drop constraint cp_submissions_score_check;
alter table public.cp_submissions drop column efficiency;
alter table public.cp_submissions add column already_solved boolean not null default false;

-- 3. Per team per problem: net points, wrong attempts and the best accepted run
alter table public.cp_problem_scores rename column best_score to points;
alter table public.cp_problem_scores
  alter column best_submission_id drop not null,
  add column wrong_attempts integer not null default 0 check (wrong_attempts >= 0),
  add column solved_at timestamptz,
  add column best_time_ms integer check (best_time_ms >= 0),
  add column best_memory_kb integer check (best_memory_kb >= 0);
comment on column public.cp_problem_scores.achieved_at is 'Time of the latest submission that changed this row.';

-- 4. Leaderboard rows: runtime and memory replace "first to reach" as the tie-break
drop index public.cp_scores_leaderboard_idx;
alter table public.cp_scores
  drop column last_improved_at,
  add column total_runtime_ms bigint not null default 0,
  add column total_memory_kb bigint not null default 0;
create index cp_scores_leaderboard_idx on public.cp_scores (competition_id, total_points desc, total_runtime_ms, total_memory_kb);

drop index public.cp_leaderboard_snapshots_leaderboard_idx;
alter table public.cp_leaderboard_snapshots
  drop column last_improved_at,
  add column total_runtime_ms bigint not null default 0,
  add column total_memory_kb bigint not null default 0;
create index cp_leaderboard_snapshots_leaderboard_idx
  on public.cp_leaderboard_snapshots (competition_id, total_points desc, total_runtime_ms, total_memory_kb);

-- 5. Scoring functions

-- What a submission is worth, given the team's state on that problem before it.
create or replace function private.cp_submission_points(p_problem_id uuid, p_registration_id uuid, p_verdict public.cp_verdict)
returns table (already_solved boolean, score numeric)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_points integer;
  v_penalty smallint;
  v_penalize_ce boolean;
  v_solved boolean;
begin
  select p.points, coalesce(s.wrong_penalty, 10), coalesce(s.penalize_compile_error, true)
  into v_points, v_penalty, v_penalize_ce
  from public.cp_problems p
  left join public.cp_sessions s on s.competition_id = p.competition_id
  where p.id = p_problem_id;

  v_solved := exists (
    select 1 from public.cp_problem_scores ps
    where ps.registration_id = p_registration_id and ps.problem_id = p_problem_id and ps.solved
  );

  already_solved := p_verdict = 'accepted' and v_solved;
  score := case
    when p_verdict = 'accepted' then case when v_solved then 0 else v_points end
    when p_verdict in ('internal_error', 'exec_format_error') then 0
    when p_verdict = 'compilation_error' and not v_penalize_ce then 0
    else -v_penalty
  end;
  return next;
end;
$$;

-- Adds one scored submission to the problem row and recomputes the team's leaderboard row.
create or replace function private.cp_apply_score(p_submission public.cp_submissions)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_accepted boolean := p_submission.verdict = 'accepted';
begin
  insert into public.cp_problem_scores as ps (
    registration_id, problem_id, points, wrong_attempts, solved, solved_at,
    best_submission_id, best_time_ms, best_memory_kb, achieved_at
  )
  values (
    p_submission.registration_id,
    p_submission.problem_id,
    p_submission.score,
    case when p_submission.score < 0 then 1 else 0 end,
    v_accepted,
    case when v_accepted then p_submission.created_at end,
    case when v_accepted then p_submission.id end,
    case when v_accepted then p_submission.max_time_ms end,
    case when v_accepted then p_submission.max_memory_kb end,
    p_submission.created_at
  )
  on conflict (registration_id, problem_id) do update
    set points = ps.points + excluded.points,
        wrong_attempts = ps.wrong_attempts + excluded.wrong_attempts,
        solved = ps.solved or excluded.solved,
        solved_at = coalesce(ps.solved_at, excluded.solved_at),
        -- The first accepted run sets the stats; a later one replaces them only when it is faster
        -- (or as fast and lighter on memory).
        best_submission_id = case
          when excluded.solved and (
            not ps.solved
            or coalesce(excluded.best_time_ms, 2147483647) < coalesce(ps.best_time_ms, 2147483647)
            or (coalesce(excluded.best_time_ms, 2147483647) = coalesce(ps.best_time_ms, 2147483647)
                and coalesce(excluded.best_memory_kb, 2147483647) < coalesce(ps.best_memory_kb, 2147483647))
          ) then excluded.best_submission_id else ps.best_submission_id end,
        best_time_ms = case
          when excluded.solved and (
            not ps.solved
            or coalesce(excluded.best_time_ms, 2147483647) < coalesce(ps.best_time_ms, 2147483647)
            or (coalesce(excluded.best_time_ms, 2147483647) = coalesce(ps.best_time_ms, 2147483647)
                and coalesce(excluded.best_memory_kb, 2147483647) < coalesce(ps.best_memory_kb, 2147483647))
          ) then excluded.best_time_ms else ps.best_time_ms end,
        best_memory_kb = case
          when excluded.solved and (
            not ps.solved
            or coalesce(excluded.best_time_ms, 2147483647) < coalesce(ps.best_time_ms, 2147483647)
            or (coalesce(excluded.best_time_ms, 2147483647) = coalesce(ps.best_time_ms, 2147483647)
                and coalesce(excluded.best_memory_kb, 2147483647) < coalesce(ps.best_memory_kb, 2147483647))
          ) then excluded.best_memory_kb else ps.best_memory_kb end,
        achieved_at = excluded.achieved_at;

  insert into public.cp_scores (registration_id, competition_id, team_name, total_points, solved, total_runtime_ms, total_memory_kb)
  select
    r.id,
    r.competition_id,
    r.team_name,
    coalesce(sum(ps.points), 0),
    count(ps.problem_id) filter (where ps.solved),
    coalesce(sum(ps.best_time_ms) filter (where ps.solved), 0),
    coalesce(sum(ps.best_memory_kb) filter (where ps.solved), 0)
  from public.registrations r
  left join public.cp_problem_scores ps on ps.registration_id = r.id
  where r.id = p_submission.registration_id
  group by r.id, r.competition_id, r.team_name
  on conflict (registration_id) do update
    set total_points = excluded.total_points,
        solved = excluded.solved,
        total_runtime_ms = excluded.total_runtime_ms,
        total_memory_kb = excluded.total_memory_kb,
        team_name = excluded.team_name,
        updated_at = now();
end;
$$;

-- Runs after cp_submissions_check (triggers fire in name order), so the contest is known to be live.
create or replace function private.cp_submissions_score()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select p.already_solved, p.score into new.already_solved, new.score
  from private.cp_submission_points(new.problem_id, new.registration_id, new.verdict) p;
  return new;
end;
$$;

create trigger cp_submissions_score before insert on public.cp_submissions
  for each row execute function private.cp_submissions_score();

create or replace function private.cp_apply_submission()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.cp_apply_score(new);
  return null;
end;
$$;

-- Freezing copies the live scores; unfreezing drops the copy.
create or replace function private.cp_sessions_snapshot_leaderboard()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.cp_leaderboard_snapshots where competition_id = new.competition_id;
  if new.leaderboard_frozen_at is not null then
    insert into public.cp_leaderboard_snapshots (
      registration_id, competition_id, team_name, total_points, solved, total_runtime_ms, total_memory_kb
    )
    select registration_id, competition_id, team_name, total_points, solved, total_runtime_ms, total_memory_kb
    from public.cp_scores
    where competition_id = new.competition_id;
  end if;
  return null;
end;
$$;

revoke all on function private.cp_submission_points(uuid, uuid, public.cp_verdict) from public, anon, authenticated;
revoke all on function private.cp_apply_score(public.cp_submissions) from public, anon, authenticated;
revoke all on function private.cp_submissions_score() from public, anon, authenticated;

-- 6. Rescore what is already recorded, oldest first (test data; production had no submissions on 13 Nov).
do $$
declare
  v_row public.cp_submissions;
begin
  delete from public.cp_problem_scores;
  update public.cp_scores set total_points = 0, solved = 0, total_runtime_ms = 0, total_memory_kb = 0, updated_at = now();

  for v_row in select * from public.cp_submissions order by created_at, id loop
    select p.already_solved, p.score into v_row.already_solved, v_row.score
    from private.cp_submission_points(v_row.problem_id, v_row.registration_id, v_row.verdict) p;
    update public.cp_submissions set already_solved = v_row.already_solved, score = v_row.score where id = v_row.id;
    perform private.cp_apply_score(v_row);
  end loop;

  delete from public.cp_leaderboard_snapshots;
  insert into public.cp_leaderboard_snapshots (
    registration_id, competition_id, team_name, total_points, solved, total_runtime_ms, total_memory_kb
  )
  select sc.registration_id, sc.competition_id, sc.team_name, sc.total_points, sc.solved, sc.total_runtime_ms, sc.total_memory_kb
  from public.cp_scores sc
  join public.cp_sessions s on s.competition_id = sc.competition_id
  where s.leaderboard_frozen_at is not null;
end;
$$;
