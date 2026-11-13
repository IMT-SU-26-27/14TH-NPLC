-- Records when a participant leaves the contest page during a live CP contest (Kenneth, 13 Nov 2026:
-- fullscreen and screen sharing are required; leaving is recorded only, never punished automatically).
-- * tab_hidden: the page was hidden (another tab, minimised window, locked screen).
-- * window_blur: the browser lost focus while the page stayed visible (another app or window).
-- * fullscreen_exit: the page was not in fullscreen (left it, or never entered it after loading).
-- Rows are written by the server (service role) from the participant's own session, so a team can only
-- add rows for itself; admins read them in Admin -> CP -> Activity.

create type public.cp_focus_kind as enum ('tab_hidden', 'window_blur', 'fullscreen_exit');

create table public.cp_focus_events (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete cascade,
  registration_id uuid not null references public.registrations (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  problem_id uuid references public.cp_problems (id) on delete set null, -- the problem open at the time, if any
  kind public.cp_focus_kind not null,
  left_at timestamptz not null default now(),
  returned_at timestamptz, -- null while still away
  -- Set when the page closed while away and the participant came back by loading it again.
  returned_by_reload boolean not null default false,
  duration_ms integer generated always as (
    case when returned_at is null then null else (extract(epoch from (returned_at - left_at)) * 1000)::integer end
  ) stored,
  constraint cp_focus_events_returned_after_left check (returned_at is null or returned_at >= left_at)
);

create index cp_focus_events_competition_idx on public.cp_focus_events (competition_id, left_at desc);
create index cp_focus_events_registration_idx on public.cp_focus_events (registration_id, left_at desc);
create index cp_focus_events_user_open_idx on public.cp_focus_events (user_id) where returned_at is null;
create index cp_focus_events_problem_id_idx on public.cp_focus_events (problem_id);

alter table public.cp_focus_events enable row level security;

create policy "cp_focus_events: admin read" on public.cp_focus_events
  for select to authenticated
  using ((select private.is_admin()));

grant select on table public.cp_focus_events to authenticated;
grant all on table public.cp_focus_events to service_role;

-- Per-team summary for the admin page. p_kind null = every kind; p_min_ms filters out short events
-- (still-open events always count, since their length is not known yet).
create or replace function public.admin_cp_focus_summary(p_competition_id uuid, p_kind public.cp_focus_kind, p_min_ms integer)
returns table (
  registration_id uuid,
  team_name text,
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
  group by e.registration_id, r.team_name
  order by count(*) filter (where e.returned_at is null) desc, coalesce(sum(e.duration_ms), 0) desc, count(*) desc, r.team_name;
$$;

revoke all on function public.admin_cp_focus_summary(uuid, public.cp_focus_kind, integer) from public, anon;
grant execute on function public.admin_cp_focus_summary(uuid, public.cp_focus_kind, integer) to authenticated, service_role;
