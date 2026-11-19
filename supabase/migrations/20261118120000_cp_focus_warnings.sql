-- Kenneth, 18 Nov 2026: fullscreen is required, every time a team leaves the contest page it gets a warning, and
-- at three warnings the team may be disqualified. Grevi: an admin decides after checking with the LO, never
-- automatically, in the preliminary and the final alike.
-- One warning is one stretch away of at least 5 s on another tab or app, or 30 s outside fullscreen (a reload
-- always leaves fullscreen, so going back takes a moment). Shorter ones (a click on the Zoom toolbar) stay
-- recorded but are not warnings. Overlapping events (a tab switch also leaves fullscreen) give one warning.

alter table public.cp_focus_events add column is_warning boolean not null default false;

create or replace function private.cp_focus_events_mark_warning()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.returned_at is null or old.returned_at is not null then
    return new;
  end if;
  -- One team's returns are judged one at a time, so two overlapping events cannot both become a warning.
  perform pg_advisory_xact_lock(hashtextextended(new.registration_id::text, 0));
  new.is_warning :=
    extract(epoch from (new.returned_at - new.left_at)) * 1000
      >= case when new.kind = 'fullscreen_exit' then 30000 else 5000 end
    and not exists (
      select 1 from public.cp_focus_events e
      where e.registration_id = new.registration_id
        and e.id <> new.id
        and e.is_warning
        and e.left_at < new.returned_at
        and e.returned_at > new.left_at
    );
  return new;
end;
$$;

revoke all on function private.cp_focus_events_mark_warning() from public, anon, authenticated;

create trigger cp_focus_events_mark_warning
  before update of returned_at on public.cp_focus_events
  for each row execute function private.cp_focus_events_mark_warning();

-- The summary gains the team's warnings (all of them, whatever the filters) and whether it is disqualified;
-- teams with the most warnings come first.
drop function public.admin_cp_focus_summary(uuid, public.cp_focus_kind, integer);

create function public.admin_cp_focus_summary(p_competition_id uuid, p_kind public.cp_focus_kind, p_min_ms integer)
returns table (
  registration_id uuid,
  team_name text,
  warnings bigint,
  disqualified boolean,
  events bigint,
  total_ms bigint,
  longest_ms integer,
  tab_hidden bigint,
  window_blur bigint,
  fullscreen_exit bigint,
  open_events bigint,
  last_left_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    e.registration_id,
    r.team_name,
    (select count(*) from public.cp_focus_events w where w.registration_id = e.registration_id and w.is_warning),
    r.disqualified_at is not null,
    count(*),
    coalesce(sum(e.duration_ms), 0),
    max(e.duration_ms),
    count(*) filter (where e.kind = 'tab_hidden'),
    count(*) filter (where e.kind = 'window_blur'),
    count(*) filter (where e.kind = 'fullscreen_exit'),
    count(*) filter (where e.returned_at is null),
    max(e.left_at)
  from public.cp_focus_events e
  join public.registrations r on r.id = e.registration_id
  where private.is_admin()
    and e.competition_id = p_competition_id
    and (p_kind is null or e.kind = p_kind)
    and (e.returned_at is null or e.duration_ms >= coalesce(p_min_ms, 0))
  group by e.registration_id, r.team_name, r.disqualified_at
  order by 3 desc, count(*) filter (where e.returned_at is null) desc, coalesce(sum(e.duration_ms), 0) desc, count(*) desc, r.team_name;
$$;

revoke all on function public.admin_cp_focus_summary(uuid, public.cp_focus_kind, integer) from public, anon;
grant execute on function public.admin_cp_focus_summary(uuid, public.cp_focus_kind, integer) to authenticated, service_role;
