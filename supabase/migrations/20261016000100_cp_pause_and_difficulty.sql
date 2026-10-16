-- Contest pause/resume, and a difficulty level on every CP problem.

-- =============================================================================
-- Pause / resume
-- =============================================================================

alter table public.cp_sessions
  add column paused_at timestamptz, -- set while status = 'paused'
  add column paused_seconds integer not null default 0 check (paused_seconds >= 0); -- total time spent paused

-- Transitions:
--   scheduled/ended -> live : fresh start (started_at = now, pause total reset)
--   live -> paused          : paused_at = now
--   paused -> live          : resume; the pause length is added to paused_seconds and the scheduled end moves back by it
--   any -> ended            : ended_at = now
--   any -> scheduled        : reset
create or replace function private.cp_sessions_prepare()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  v_paused integer;
begin
  perform private.assert_cp_competition(new.competition_id);
  if tg_op = 'INSERT' or new.status is distinct from old.status then
    if new.status = 'live' then
      if tg_op = 'UPDATE' and old.status = 'paused' then
        v_paused := greatest(0, floor(extract(epoch from now() - coalesce(old.paused_at, now()))))::integer;
        new.paused_seconds := old.paused_seconds + v_paused;
        if new.scheduled_end_at is not null then
          new.scheduled_end_at := new.scheduled_end_at + make_interval(secs => v_paused);
        end if;
        new.paused_at := null;
      else
        new.started_at := now();
        new.started_by := (select auth.uid());
        new.ended_at := null;
        new.paused_at := null;
        new.paused_seconds := 0;
      end if;
    elsif new.status = 'paused' then
      if tg_op = 'INSERT' or old.status <> 'live' then
        raise exception 'Only a running contest can be paused' using errcode = 'P0001';
      end if;
      new.paused_at := now();
    elsif new.status = 'ended' then
      new.ended_at := now();
      new.paused_at := null;
    elsif new.status = 'scheduled' then
      new.paused_at := null;
      new.paused_seconds := 0;
    end if;
  end if;
  return new;
end;
$$;

-- cp_is_live (problem visibility) and cp_submissions_check (submissions) already require status = 'live',
-- so a paused contest hides its problems and refuses submissions without further changes.

-- =============================================================================
-- Problem difficulty
-- =============================================================================

alter table public.cp_problems
  add column difficulty public.cp_difficulty not null default 'easy';

-- Same as before, plus "difficulty" in p_problem.
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
      competition_id, level, difficulty, title, statement, input_format, output_format,
      constraints, time_limit_ms, memory_limit_kb, points, is_published
    )
    values (
      (p_problem ->> 'competition_id')::uuid,
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
$$;
