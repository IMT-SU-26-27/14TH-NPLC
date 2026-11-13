-- The leaderboard shows each team's result per problem (Programming guidebook section 07: the scoreboard shows the
-- ranking and the answers to each problem). cp_scores.problems holds it as
--   {"<problem id>": {"solved": true, "wrong": 2}, ...}
-- for problems the team has submitted to. It sits on the leaderboard row, so it reaches participants through the same
-- read rules, Realtime updates and freeze snapshots as the totals.

alter table public.cp_scores add column problems jsonb not null default '{}'::jsonb;
alter table public.cp_leaderboard_snapshots add column problems jsonb not null default '{}'::jsonb;

create or replace function private.cp_problem_status(p_registration_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    jsonb_object_agg(ps.problem_id, jsonb_build_object('solved', ps.solved, 'wrong', ps.wrong_attempts)),
    '{}'::jsonb
  )
  from public.cp_problem_scores ps
  where ps.registration_id = p_registration_id;
$$;

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

  insert into public.cp_scores (registration_id, competition_id, team_name, total_points, solved, total_runtime_ms, total_memory_kb, problems)
  select
    r.id,
    r.competition_id,
    r.team_name,
    coalesce(sum(ps.points), 0),
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
      registration_id, competition_id, team_name, total_points, solved, total_runtime_ms, total_memory_kb, problems
    )
    select registration_id, competition_id, team_name, total_points, solved, total_runtime_ms, total_memory_kb, problems
    from public.cp_scores
    where competition_id = new.competition_id;
  end if;
  return null;
end;
$$;

revoke all on function private.cp_problem_status(uuid) from public, anon, authenticated;

-- Fill in rows already recorded. A snapshot taken before this migration gets the current per-problem state,
-- since the state at the moment it was frozen is not stored anywhere.
update public.cp_scores set problems = private.cp_problem_status(registration_id);
update public.cp_leaderboard_snapshots set problems = private.cp_problem_status(registration_id);
