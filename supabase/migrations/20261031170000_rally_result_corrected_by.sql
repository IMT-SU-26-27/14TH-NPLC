-- A corrected result keeps who recorded it and when, and says separately who corrected it.
-- Keeping recorded_at also means a correction cannot change a team's place in a time-based tie-break.

alter table public.rally_results
  add column corrected_by uuid references public.profiles (id) on delete restrict,
  add column corrected_at timestamptz;

create index rally_results_corrected_by_idx on public.rally_results (corrected_by);

-- Results corrected before this migration were saved under the admin's name. A correction ran in one
-- transaction, so the log entry, the voided result and the new result all carry the same timestamp.
do $$
declare
  v_log record;
  v_old public.rally_results;
begin
  for v_log in select * from public.rally_result_log where action = 'corrected' order by id loop
    select * into v_old from public.rally_results
    where registration_id = v_log.registration_id and post_id = v_log.post_id and voided_at = v_log.created_at
    limit 1;
    if found then
      update public.rally_results
      set recorded_by = v_old.recorded_by, recorded_at = v_old.recorded_at, corrected_by = v_log.actor_id, corrected_at = v_log.created_at
      where id = v_log.result_id;
    end if;
  end loop;
end;
$$;

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

  insert into public.rally_results (registration_id, post_id, outcome, points, client_request_id, recorded_by, recorded_at, corrected_by, corrected_at)
  values (v_result.registration_id, v_result.post_id, p_outcome, v_points, gen_random_uuid(), v_result.recorded_by, v_result.recorded_at, v_uid, now())
  returning id into v_new_id;

  insert into public.rally_result_log (result_id, registration_id, post_id, action, actor_id, old_outcome, new_outcome, old_points, new_points, reason)
  values (v_new_id, v_result.registration_id, v_result.post_id, 'corrected', v_uid, v_result.outcome, p_outcome, v_result.points, v_points, v_reason);

  return v_new_id;
end;
$$;

-- recorded_by now stays the LO after a correction, so these check corrected_by too:
-- once an admin has corrected a result, only an admin can change it.
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
    case when x.recorded_by = (select auth.uid()) and x.corrected_by is null then x.recorded_at + private.rally_undo_window() end
  from public.registrations r
  left join public.rally_results x on x.registration_id = r.id and x.post_id = p_post_id and x.voided_at is null
  where r.id = v_id;
end;
$$;

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
    case when x.recorded_by = (select auth.uid()) and x.corrected_by is null then x.recorded_at + private.rally_undo_window() end
  from public.rally_results x
  join public.registrations r on r.id = x.registration_id
  where x.post_id = p_post_id and x.voided_at is null
  order by x.recorded_at desc
  limit 10;
end;
$$;
