-- Partial credit (rapat Event x Tech, 20 Nov 2026): a problem is worth points x passed / total test cases, and the
-- team keeps its best submission per problem. No penalty for wrong answers any more, so the default penalty is 0.
-- The penalty setting stays, so the admin can bring one back without a migration: when it is above 0, every
-- submission that is not Accepted still costs it (judge failures and, if exempted, compile errors never do).
-- Runtime and memory still count only Accepted runs, and "Yes - Solved" still only replaces a slower run.
--
-- submission.score keeps its meaning: the change this submission made to the team total, here the gain over the
-- best partial score so far minus any penalty.

-- 1. No penalty by default, and none in sessions that already exist.
alter table public.cp_sessions alter column wrong_penalty set default 0;
update public.cp_sessions set wrong_penalty = 0;

-- 2. Best partial score per team per problem (cp_problem_scores.points stays the net sum shown on the board).
alter table public.cp_problem_scores add column best_partial numeric(10, 2) not null default 0 check (best_partial >= 0);

-- 3. Scoring functions

-- Points a run earns on its own: points x passed / total. Judge failures earn nothing.
create or replace function private.cp_partial_points(p_problem_id uuid, p_verdict public.cp_verdict, p_passed smallint, p_total smallint)
returns numeric
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when p_verdict in ('internal_error', 'exec_format_error') then 0
    else round(p.points * p_passed::numeric / p_total, 2)
  end
  from public.cp_problems p
  where p.id = p_problem_id;
$$;

drop function private.cp_submission_points(uuid, uuid, public.cp_verdict);

-- What a submission is worth, given the team's state on that problem before it.
create function private.cp_submission_points(
  p_problem_id uuid, p_registration_id uuid, p_verdict public.cp_verdict, p_passed smallint, p_total smallint
)
returns table (already_solved boolean, score numeric)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_penalty smallint;
  v_penalize_ce boolean;
  v_solved boolean;
  v_best numeric;
  v_gain numeric;
begin
  select coalesce(s.wrong_penalty, 0), coalesce(s.penalize_compile_error, true)
  into v_penalty, v_penalize_ce
  from public.cp_problems p
  left join public.cp_sessions s on s.competition_id = p.competition_id
  where p.id = p_problem_id;

  select coalesce(bool_or(ps.solved), false), coalesce(max(ps.best_partial), 0)
  into v_solved, v_best
  from public.cp_problem_scores ps
  where ps.registration_id = p_registration_id and ps.problem_id = p_problem_id;

  v_gain := greatest(private.cp_partial_points(p_problem_id, p_verdict, p_passed, p_total) - v_best, 0);

  already_solved := p_verdict = 'accepted' and v_solved;
  score := v_gain - case
    when p_verdict in ('accepted', 'internal_error', 'exec_format_error') then 0
    when p_verdict = 'compilation_error' and not v_penalize_ce then 0
    else v_penalty
  end;
  return next;
end;
$$;

create or replace function private.cp_submissions_score()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select p.already_solved, p.score into new.already_solved, new.score
  from private.cp_submission_points(new.problem_id, new.registration_id, new.verdict, new.passed, new.total) p;
  return new;
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
  -- A wrong attempt is any judged run that is not Accepted, whether or not it cost points.
  v_wrong boolean := p_submission.verdict not in ('accepted', 'internal_error', 'exec_format_error');
  v_partial numeric := private.cp_partial_points(
    p_submission.problem_id, p_submission.verdict, p_submission.passed, p_submission.total
  );
begin
  insert into public.cp_problem_scores as ps (
    registration_id, problem_id, points, best_partial, wrong_attempts, solved, solved_at,
    best_submission_id, best_time_ms, best_memory_kb, achieved_at
  )
  values (
    p_submission.registration_id,
    p_submission.problem_id,
    p_submission.score,
    v_partial,
    case when v_wrong then 1 else 0 end,
    v_accepted,
    case when v_accepted then p_submission.created_at end,
    case when v_accepted then p_submission.id end,
    case when v_accepted then p_submission.max_time_ms end,
    case when v_accepted then p_submission.max_memory_kb end,
    p_submission.created_at
  )
  on conflict (registration_id, problem_id) do update
    set points = ps.points + excluded.points,
        best_partial = greatest(ps.best_partial, excluded.best_partial),
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

  insert into public.cp_scores (registration_id, competition_id, team_name, total_points, solved, total_runtime_ms, total_memory_kb, problems)
  select
    r.id,
    r.competition_id,
    r.team_name,
    -- Never below 0 (Kenneth, 18 Nov 2026), in case a penalty is set again.
    greatest(coalesce(sum(ps.points), 0), 0),
    count(ps.problem_id) filter (where ps.solved),
    coalesce(sum(ps.best_time_ms) filter (where ps.solved), 0),
    coalesce(sum(ps.best_memory_kb) filter (where ps.solved), 0),
    private.cp_problem_status(r.id)
  from public.registrations r
  left join public.cp_problem_scores ps on ps.registration_id = r.id
  where r.id = p_submission.registration_id
  group by r.id, r.competition_id, r.team_name
  on conflict (registration_id) do update
    set total_points = excluded.total_points,
        solved = excluded.solved,
        total_runtime_ms = excluded.total_runtime_ms,
        total_memory_kb = excluded.total_memory_kb,
        problems = excluded.problems,
        team_name = excluded.team_name,
        updated_at = now();
end;
$$;

revoke all on function private.cp_partial_points(uuid, public.cp_verdict, smallint, smallint) from public, anon, authenticated;
revoke all on function private.cp_submission_points(uuid, uuid, public.cp_verdict, smallint, smallint) from public, anon, authenticated;

-- 4. Rescore what is recorded for each session's current round, oldest first (test data; production has no CP
-- submissions yet). Submissions of an earlier round stay as they are, as the record of that round.
do $$
declare
  v_row public.cp_submissions;
begin
  delete from public.cp_problem_scores;
  update public.cp_scores
  set total_points = 0, solved = 0, total_runtime_ms = 0, total_memory_kb = 0, problems = '{}'::jsonb, updated_at = now();

  for v_row in
    select sub.*
    from public.cp_submissions sub
    join public.cp_problems p on p.id = sub.problem_id
    join public.cp_sessions s on s.competition_id = p.competition_id and s.round = p.round
    order by sub.created_at, sub.id
  loop
    select p.already_solved, p.score into v_row.already_solved, v_row.score
    from private.cp_submission_points(v_row.problem_id, v_row.registration_id, v_row.verdict, v_row.passed, v_row.total) p;
    update public.cp_submissions set already_solved = v_row.already_solved, score = v_row.score where id = v_row.id;
    perform private.cp_apply_score(v_row);
  end loop;

  delete from public.cp_leaderboard_snapshots;
  insert into public.cp_leaderboard_snapshots (
    registration_id, competition_id, team_name, total_points, solved, total_runtime_ms, total_memory_kb, problems
  )
  select sc.registration_id, sc.competition_id, sc.team_name, sc.total_points, sc.solved, sc.total_runtime_ms,
    sc.total_memory_kb, sc.problems
  from public.cp_scores sc
  join public.cp_sessions s on s.competition_id = sc.competition_id
  where s.leaderboard_frozen_at is not null;
end;
$$;
