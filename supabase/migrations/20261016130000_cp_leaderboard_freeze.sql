-- Leaderboard freeze and end-of-contest visibility.
-- * Admins can freeze the leaderboard: scoring continues in cp_scores, but participants see the
--   snapshot taken at the moment of freezing (cp_leaderboard_snapshots) until it is unfrozen.
-- * Once the contest has ended, participants can no longer read the leaderboard at all.
-- * Admins always read the live cp_scores.

alter table public.cp_sessions add column leaderboard_frozen_at timestamptz;

create table public.cp_leaderboard_snapshots (
  registration_id uuid primary key references public.registrations (id) on delete cascade,
  competition_id uuid not null references public.competitions (id) on delete cascade,
  team_name text not null,
  total_points numeric(12, 2) not null default 0,
  solved smallint not null default 0,
  last_improved_at timestamptz
);

create index cp_leaderboard_snapshots_leaderboard_idx
  on public.cp_leaderboard_snapshots (competition_id, total_points desc, last_improved_at);

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
    insert into public.cp_leaderboard_snapshots (registration_id, competition_id, team_name, total_points, solved, last_improved_at)
    select registration_id, competition_id, team_name, total_points, solved, last_improved_at
    from public.cp_scores
    where competition_id = new.competition_id;
  end if;
  return null;
end;
$$;

create trigger cp_sessions_snapshot_leaderboard
  after update of leaderboard_frozen_at on public.cp_sessions
  for each row
  when (old.leaderboard_frozen_at is distinct from new.leaderboard_frozen_at)
  execute function private.cp_sessions_snapshot_leaderboard();

-- Which leaderboard a participant may read right now: 'live', 'frozen' or null (none: no session or contest ended).
create or replace function private.cp_participant_leaderboard(p_competition_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when s.status = 'ended' then null
    when s.leaderboard_frozen_at is not null then 'frozen'
    else 'live'
  end
  from public.cp_sessions s
  where s.competition_id = p_competition_id;
$$;

drop policy "cp_scores: participants and admin read" on public.cp_scores;
create policy "cp_scores: admin, or participants while live and not frozen" on public.cp_scores
  for select to authenticated
  using (
    (select private.is_admin())
    or (private.is_cp_participant(competition_id) and private.cp_participant_leaderboard(competition_id) = 'live')
  );

alter table public.cp_leaderboard_snapshots enable row level security;
create policy "cp_leaderboard_snapshots: admin, or participants while frozen" on public.cp_leaderboard_snapshots
  for select to authenticated
  using (
    (select private.is_admin())
    or (private.is_cp_participant(competition_id) and private.cp_participant_leaderboard(competition_id) = 'frozen')
  );

revoke all on function private.cp_sessions_snapshot_leaderboard() from public, anon;
revoke all on function private.cp_participant_leaderboard(uuid) from public, anon;
grant execute on function private.cp_participant_leaderboard(uuid) to authenticated, service_role;

grant select on table public.cp_leaderboard_snapshots to authenticated;
grant all on table public.cp_leaderboard_snapshots to service_role;
