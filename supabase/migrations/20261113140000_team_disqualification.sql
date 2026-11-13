-- Team disqualification (both guidebooks: a team that breaks the rules is disqualified; the committee decides).
-- Kept apart from `status`: a disqualified team stays an accepted, paid registration, its submissions and
-- results are kept, and an admin can lift the disqualification.
-- * Only admins (and trusted server code) set or clear it, always with a reason.
-- * A disqualified team cannot submit CP solutions and cannot be given new Rally results.
-- * Participants no longer see it on the CP or Rally leaderboards; admins still do.

alter table public.registrations
  add column disqualified_at timestamptz,
  add column disqualification_reason text check (
    disqualification_reason is null or char_length(btrim(disqualification_reason)) between 3 and 500
  ),
  add column disqualified_by uuid references public.profiles (id) on delete set null,
  add constraint registrations_disqualification_complete check ((disqualified_at is null) = (disqualification_reason is null));

create index registrations_disqualified_by_idx on public.registrations (disqualified_by);

-- Runs after registrations_guard (name order). Leaders can never touch these columns.
create or replace function private.registrations_guard_disqualification()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.disqualified_at is not distinct from old.disqualified_at
     and new.disqualification_reason is not distinct from old.disqualification_reason
     and new.disqualified_by is not distinct from old.disqualified_by then
    return new;
  end if;

  if not (private.is_trusted() or private.is_admin()) then
    raise exception 'Only an admin can disqualify a team' using errcode = '42501';
  end if;

  if new.disqualification_reason is not null then
    new.disqualification_reason := btrim(new.disqualification_reason);
    new.disqualified_at := coalesce(new.disqualified_at, now());
    new.disqualified_by := (select auth.uid());
  else
    new.disqualified_at := null;
    new.disqualified_by := null;
  end if;
  return new;
end;
$$;

create trigger registrations_guard_disqualification before update on public.registrations
  for each row execute function private.registrations_guard_disqualification();

create or replace function private.is_disqualified(p_registration_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.registrations where id = p_registration_id and disqualified_at is not null);
$$;

-- CP: no new submissions.
create or replace function private.cp_submissions_block_disqualified()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_disqualified(new.registration_id) then
    raise exception 'This team has been disqualified' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger cp_submissions_block_disqualified before insert on public.cp_submissions
  for each row execute function private.cp_submissions_block_disqualified();

-- Rally: no new results. Corrections and voids of earlier results stay possible.
create or replace function private.rally_results_block_disqualified()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if private.is_disqualified(new.registration_id) then
    raise exception 'This team has been disqualified' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger rally_results_block_disqualified before insert on public.rally_results
  for each row execute function private.rally_results_block_disqualified();

-- Leaderboards: participants do not see disqualified teams.
drop policy "cp_scores: admin, or participants while live and not frozen" on public.cp_scores;
create policy "cp_scores: admin, or participants while live and not frozen" on public.cp_scores
  for select to authenticated
  using (
    (select private.is_admin())
    or (
      private.is_cp_participant(competition_id)
      and private.cp_participant_leaderboard(competition_id) = 'live'
      and not private.is_disqualified(registration_id)
    )
  );

drop policy "cp_leaderboard_snapshots: admin, or participants while frozen" on public.cp_leaderboard_snapshots;
create policy "cp_leaderboard_snapshots: admin, or participants while frozen" on public.cp_leaderboard_snapshots
  for select to authenticated
  using (
    (select private.is_admin())
    or (
      private.is_cp_participant(competition_id)
      and private.cp_participant_leaderboard(competition_id) = 'frozen'
      and not private.is_disqualified(registration_id)
    )
  );

drop policy "rally_scores: admin, or participants while not frozen" on public.rally_scores;
create policy "rally_scores: admin, or participants while not frozen" on public.rally_scores
  for select to authenticated
  using (
    (select private.is_admin())
    or (
      private.is_rally_participant(competition_id)
      and not private.rally_is_frozen(competition_id)
      and not private.is_disqualified(registration_id)
    )
  );

drop policy "rally_snapshots: admin, or participants while frozen" on public.rally_leaderboard_snapshots;
create policy "rally_snapshots: admin, or participants while frozen" on public.rally_leaderboard_snapshots
  for select to authenticated
  using (
    (select private.is_admin())
    or (
      private.is_rally_participant(competition_id)
      and private.rally_is_frozen(competition_id)
      and not private.is_disqualified(registration_id)
    )
  );

revoke all on function private.registrations_guard_disqualification() from public, anon, authenticated;
revoke all on function private.cp_submissions_block_disqualified() from public, anon, authenticated;
revoke all on function private.rally_results_block_disqualified() from public, anon, authenticated;
revoke all on function private.is_disqualified(uuid) from public, anon;
grant execute on function private.is_disqualified(uuid) to authenticated, service_role;
