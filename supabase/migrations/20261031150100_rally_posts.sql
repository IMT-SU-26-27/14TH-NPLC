-- Rally Games: the LO role, posts with their point rules, and which LO runs which post.
-- Routes and replays wait for the Divisi Event's answers. Routes will be a new table, and replays
-- only change the results table of the next phase, so nothing here needs to change for either.

create type public.rally_post_kind as enum ('physical', 'digital');

create table public.rally_posts (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 2 and 80),
  kind public.rally_post_kind not null default 'physical',
  location text check (location is null or char_length(location) <= 120),
  -- Placeholders until the Divisi Event sets the final values.
  points_win integer not null default 100 check (points_win between 0 and 100000),
  points_lose integer not null default 25 check (points_lose between 0 and 100000),
  points_draw integer not null default 50 check (points_draw between 0 and 100000),
  allow_draw boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index rally_posts_competition_id_idx on public.rally_posts (competition_id);
create unique index rally_posts_competition_name_key on public.rally_posts (competition_id, lower(btrim(name)));

create trigger rally_posts_set_updated_at before update on public.rally_posts
  for each row execute function private.set_updated_at();

create table public.rally_post_assignments (
  post_id uuid not null references public.rally_posts (id) on delete cascade,
  lo_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, lo_id)
);

create index rally_post_assignments_lo_id_idx on public.rally_post_assignments (lo_id);

create or replace function private.rally_assignment_requires_lo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not exists (select 1 from public.profiles where id = new.lo_id and role = 'lo') then
    raise exception 'Only LO accounts can be assigned to a post' using errcode = '23514';
  end if;
  return new;
end;
$$;

create trigger rally_assignment_requires_lo before insert or update on public.rally_post_assignments
  for each row execute function private.rally_assignment_requires_lo();

-- The committee cannot also compete, on any path into a team.
create or replace function private.registration_members_reject_lo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (select 1 from public.profiles where id = new.user_id and role = 'lo') then
    raise exception 'LO accounts cannot join a team' using errcode = '42501';
  end if;
  return new;
end;
$$;

create trigger registration_members_reject_lo before insert on public.registration_members
  for each row execute function private.registration_members_reject_lo();

-- Signed-in users only. The anon role has no reason to reach these tables, whatever the default privileges are.
revoke all on table public.rally_posts from anon;
revoke all on table public.rally_post_assignments from anon;
grant all on table public.rally_posts to authenticated, service_role;
grant all on table public.rally_post_assignments to authenticated, service_role;

alter table public.rally_posts enable row level security;
alter table public.rally_post_assignments enable row level security;

create policy "rally_posts: read active or admin" on public.rally_posts
  for select to authenticated
  using (is_active or (select private.is_admin()));
create policy "rally_posts: admin insert" on public.rally_posts
  for insert to authenticated
  with check ((select private.is_admin()));
create policy "rally_posts: admin update" on public.rally_posts
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));
create policy "rally_posts: admin delete" on public.rally_posts
  for delete to authenticated
  using ((select private.is_admin()));

create policy "rally_post_assignments: read own or admin" on public.rally_post_assignments
  for select to authenticated
  using (lo_id = (select auth.uid()) or (select private.is_admin()));
create policy "rally_post_assignments: admin insert" on public.rally_post_assignments
  for insert to authenticated
  with check ((select private.is_admin()));
create policy "rally_post_assignments: admin delete" on public.rally_post_assignments
  for delete to authenticated
  using ((select private.is_admin()));
