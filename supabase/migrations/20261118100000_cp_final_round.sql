-- The final round (decided 18 Nov 2026): the same contest as the preliminary, with its own problems and only the
-- finalists (15 teams). One competition, two rounds, because an account can only be on one team.
--
--   * cp_problems.round: each problem belongs to the preliminary or the final, so the final problems can be
--     prepared in advance. Participants only see and submit to problems of the session's current round.
--   * cp_finalists: the teams an admin marked as finalists. Participants learn whether their team made it once the
--     admin announces it (cp_sessions.finalists_announced_at).
--   * cp_start_final(): archives the preliminary standings (cp_round_results), clears every score and moves the
--     session to the final round. From then on only finalists can open problems, submit and appear on the board.
--   * cp_scores.last_solved_at: the last tie-break after runtime and memory, the team that reached its score first
--     (time of its last Accepted) ranks higher. Replaces the alphabetical order.

create type public.cp_round as enum ('preliminary', 'final');

alter table public.cp_problems add column round public.cp_round not null default 'preliminary';
-- Level numbers restart in each round.
alter table public.cp_problems drop constraint cp_problems_competition_level_key;
alter table public.cp_problems add constraint cp_problems_competition_round_level_key unique (competition_id, round, level);

alter table public.cp_sessions
  add column round public.cp_round not null default 'preliminary',
  add column finalists_announced_at timestamptz;

-- The admin form saves the round with the rest of the problem.
create or replace function public.admin_save_problem(p_problem jsonb, p_test_cases jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
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
      competition_id, round, level, difficulty, title, statement, input_format, output_format,
      constraints, time_limit_ms, memory_limit_kb, points, is_published
    )
    values (
      (p_problem ->> 'competition_id')::uuid,
      coalesce((p_problem ->> 'round')::public.cp_round, 'preliminary'),
      (p_problem ->> 'level')::smallint,
      coalesce((p_problem ->> 'difficulty')::public.cp_difficulty, 'easy'),
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
      round = coalesce((p_problem ->> 'round')::public.cp_round, 'preliminary'),
      level = (p_problem ->> 'level')::smallint,
      difficulty = coalesce((p_problem ->> 'difficulty')::public.cp_difficulty, 'easy'),
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
$function$;

-- ----- Finalists -----

create table public.cp_finalists (
  registration_id uuid primary key,
  competition_id uuid not null references public.competitions (id) on delete cascade,
  created_at timestamptz not null default now(),
  foreign key (registration_id, competition_id) references public.registrations (id, competition_id) on delete cascade
);
create index cp_finalists_competition_idx on public.cp_finalists (competition_id);
alter table public.cp_finalists enable row level security;

create or replace function private.is_cp_finalist(p_registration_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.cp_finalists f where f.registration_id = p_registration_id);
$$;

-- Teams see only their own row, and only once the finalists are announced.
create policy "cp_finalists: admin, or own team once announced" on public.cp_finalists
  for select to authenticated
  using (
    (select private.is_admin())
    or (
      private.is_team_member(registration_id)
      and exists (
        select 1 from public.cp_sessions s
        where s.competition_id = cp_finalists.competition_id and s.finalists_announced_at is not null
      )
    )
  );
create policy "cp_finalists: admin insert" on public.cp_finalists
  for insert to authenticated with check ((select private.is_admin()));
create policy "cp_finalists: admin delete" on public.cp_finalists
  for delete to authenticated using ((select private.is_admin()));

-- ----- Archived standings of a finished round -----

create table public.cp_round_results (
  competition_id uuid not null references public.competitions (id) on delete cascade,
  registration_id uuid not null references public.registrations (id) on delete cascade,
  round public.cp_round not null,
  rank integer not null check (rank >= 1),
  team_name text not null,
  total_points numeric not null,
  solved integer not null,
  total_runtime_ms bigint not null,
  total_memory_kb bigint not null,
  archived_at timestamptz not null default now(),
  primary key (registration_id, round)
);
create index cp_round_results_competition_idx on public.cp_round_results (competition_id, round, rank);
alter table public.cp_round_results enable row level security;

create policy "cp_round_results: admin, or own team" on public.cp_round_results
  for select to authenticated
  using ((select private.is_admin()) or private.is_team_member(registration_id));

-- ----- Last tie-break: who reached the score first -----

alter table public.cp_scores add column last_solved_at timestamptz;
alter table public.cp_leaderboard_snapshots add column last_solved_at timestamptz;

create or replace function private.cp_leaderboard_fill_last_solved()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select max(ps.solved_at) into new.last_solved_at
  from public.cp_problem_scores ps
  where ps.registration_id = new.registration_id and ps.solved;
  return new;
end;
$$;

create trigger cp_scores_fill_last_solved
  before insert or update on public.cp_scores
  for each row execute function private.cp_leaderboard_fill_last_solved();
create trigger cp_leaderboard_snapshots_fill_last_solved
  before insert on public.cp_leaderboard_snapshots
  for each row execute function private.cp_leaderboard_fill_last_solved();

-- ----- Access by round -----

-- A participant sees a published problem only while live, only in the session's round, and in the final only
-- when their team is a finalist.
create or replace function private.can_view_problem(p_problem_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.cp_problems p
    join public.cp_sessions s on s.competition_id = p.competition_id and s.round = p.round
    where p.id = p_problem_id
      and p.is_published
      and private.is_cp_participant(p.competition_id)
      and private.cp_is_live(p.competition_id)
      and (
        p.round = 'preliminary'
        or exists (
          select 1 from public.cp_finalists f
          where f.competition_id = p.competition_id and private.is_team_member(f.registration_id)
        )
      )
  );
$$;

-- Runs after cp_submissions_check and before cp_submissions_score (triggers fire in name order).
create or replace function private.cp_submissions_check_round()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_problem_round public.cp_round;
  v_session_round public.cp_round;
begin
  select p.round, s.round into v_problem_round, v_session_round
  from public.cp_problems p
  join public.cp_sessions s on s.competition_id = p.competition_id
  where p.id = new.problem_id;

  if v_problem_round is distinct from v_session_round then
    raise exception 'This problem is not part of the current round' using errcode = 'P0001';
  end if;
  if v_session_round = 'final' and not private.is_cp_finalist(new.registration_id) then
    raise exception 'This team is not in the final' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger cp_submissions_check_round
  before insert on public.cp_submissions
  for each row execute function private.cp_submissions_check_round();

-- The proxy and contest pages also need the round and whether the team is a finalist.
drop function public.cp_access();
create function public.cp_access()
returns table (
  competition_id uuid,
  registration_id uuid,
  session_status public.cp_session_status,
  round public.cp_round,
  is_finalist boolean
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    r.competition_id,
    r.id,
    coalesce(s.status, 'scheduled'::public.cp_session_status),
    coalesce(s.round, 'preliminary'::public.cp_round),
    -- Only known to the team once announced (or once the final has started).
    exists (select 1 from public.cp_finalists f where f.registration_id = r.id)
      and (s.finalists_announced_at is not null or s.round = 'final')
  from public.registrations r
  join public.competitions c on c.id = r.competition_id and c.type = 'competitive_programming'
  left join public.cp_sessions s on s.competition_id = r.competition_id
  where r.status = 'accepted' and private.is_team_member(r.id);
$$;
revoke all on function public.cp_access() from public, anon;
grant execute on function public.cp_access() to authenticated;

-- Accepted teams join the leaderboard on acceptance, except non-finalists once the final has started.
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
  ) and not exists (
    select 1 from public.cp_sessions s
    where s.competition_id = new.competition_id and s.round = 'final' and not private.is_cp_finalist(new.id)
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

-- ----- Starting the final -----

create or replace function public.cp_start_final(p_competition_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_session public.cp_sessions;
begin
  if not (select private.is_admin()) then
    raise exception 'Only an admin can start the final' using errcode = '42501';
  end if;

  select * into v_session from public.cp_sessions where competition_id = p_competition_id for update;
  if not found or v_session.round <> 'preliminary' or v_session.status <> 'ended' then
    raise exception 'End the preliminary round before starting the final' using errcode = 'P0001';
  end if;
  if not exists (select 1 from public.cp_finalists where competition_id = p_competition_id) then
    raise exception 'Choose the finalists before starting the final' using errcode = 'P0001';
  end if;

  -- Keep the preliminary standings, in leaderboard order.
  insert into public.cp_round_results (
    competition_id, registration_id, round, rank, team_name, total_points, solved, total_runtime_ms, total_memory_kb
  )
  select
    competition_id, registration_id, 'preliminary',
    row_number() over (
      order by total_points desc, total_runtime_ms, total_memory_kb, last_solved_at nulls last, team_name
    ),
    team_name, total_points, solved, total_runtime_ms, total_memory_kb
  from public.cp_scores
  where competition_id = p_competition_id
  on conflict (registration_id, round) do nothing;

  -- Every score starts again; submissions stay as the record of the preliminary.
  delete from public.cp_problem_scores ps
  using public.registrations r
  where r.id = ps.registration_id and r.competition_id = p_competition_id;
  delete from public.cp_scores s
  where s.competition_id = p_competition_id and not private.is_cp_finalist(s.registration_id);
  update public.cp_scores
  set total_points = 0, solved = 0, total_runtime_ms = 0, total_memory_kb = 0, updated_at = now()
  where competition_id = p_competition_id;

  -- Back to "scheduled" for the final; the admin sets its start and duration.
  update public.cp_sessions
  set round = 'final', status = 'scheduled', scheduled_start_at = null,
      leaderboard_frozen_at = null, leaderboard_frozen_auto = false
  where competition_id = p_competition_id;
end;
$$;
revoke all on function public.cp_start_final(uuid) from public, anon;
grant execute on function public.cp_start_final(uuid) to authenticated;

revoke all on function private.is_cp_finalist(uuid) from public, anon, authenticated;
revoke all on function private.cp_leaderboard_fill_last_solved() from public, anon, authenticated;
revoke all on function private.cp_submissions_check_round() from public, anon, authenticated;

-- Rows already recorded.
update public.cp_scores set updated_at = updated_at;
update public.cp_leaderboard_snapshots s
set last_solved_at = (
  select max(ps.solved_at) from public.cp_problem_scores ps where ps.registration_id = s.registration_id and ps.solved
);
