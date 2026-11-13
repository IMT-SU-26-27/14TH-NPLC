-- The CP leaderboard shows each team's school next to its name (design v89, screen 5). Participants can only read
-- their own registration, so the school is copied onto the leaderboard rows the same way team_name is, and reaches
-- them through the same read rules, Realtime updates and freeze snapshots.

alter table public.cp_scores add column school text;
alter table public.cp_leaderboard_snapshots add column school text;

-- Fills the school from the team's registration on every write, so neither cp_apply_score nor the snapshot
-- function has to change.
create or replace function private.cp_leaderboard_fill_school()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  select r.school into new.school from public.registrations r where r.id = new.registration_id;
  return new;
end;
$$;

revoke all on function private.cp_leaderboard_fill_school() from public, anon, authenticated;

create trigger cp_scores_fill_school
  before insert or update on public.cp_scores
  for each row execute function private.cp_leaderboard_fill_school();

create trigger cp_leaderboard_snapshots_fill_school
  before insert on public.cp_leaderboard_snapshots
  for each row execute function private.cp_leaderboard_fill_school();

-- Rows already recorded.
update public.cp_scores s set school = r.school from public.registrations r where r.id = s.registration_id;
update public.cp_leaderboard_snapshots s set school = r.school from public.registrations r where r.id = s.registration_id;
