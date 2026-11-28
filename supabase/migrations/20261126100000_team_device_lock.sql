-- One device per team (Kenneth, 26 Nov 2026: "cuma satu device dari satu tim yang bisa akses website"; Rally Games
-- uses the same rule, 20 Nov meeting notes B1a). A device is one browser, identified by a random id in a cookie, so
-- tabs of the same browser count as one device whoever is signed in there.
-- * The first device of a team to open a contest page holds the team.
-- * Another device asks; the active device approves or rejects. On approval the old device is locked out.
-- * A request not answered within 60 s expires. A holder silent for 90 s (laptop off, browser closed) is offline,
--   and the next device takes over without asking.
-- * An admin can reset a team, and can turn the rule off per competition if it gets in the way on the day.
-- Every change is logged for Admin -> CP -> Activity.

alter table public.competitions add column single_device boolean not null default true;
-- competitions has column-level select grants (20261109120000): a new column needs its own.
grant select (single_device) on table public.competitions to authenticated;

create type public.team_device_action as enum (
  'claimed', 'took_over_offline', 'requested', 'approved', 'rejected', 'expired', 'admin_reset'
);

-- The device that holds each team, and the request waiting for it, if any.
create table public.team_devices (
  registration_id uuid primary key references public.registrations (id) on delete cascade,
  device_id uuid not null,
  user_id uuid references public.profiles (id) on delete set null,
  label text not null default '',
  claimed_at timestamptz not null default now(),
  seen_at timestamptz not null default now(),
  pending_device_id uuid,
  pending_user_id uuid references public.profiles (id) on delete set null,
  pending_label text,
  pending_at timestamptz,
  -- The last request turned down or left unanswered, so that device can show why it is still locked out.
  answered_device_id uuid,
  answer public.team_device_action check (answer in ('rejected', 'expired')),
  answered_at timestamptz
);

create index team_devices_user_id_idx on public.team_devices (user_id);
create index team_devices_pending_user_id_idx on public.team_devices (pending_user_id);

create table public.team_device_events (
  id bigint generated always as identity primary key,
  registration_id uuid not null references public.registrations (id) on delete cascade,
  action public.team_device_action not null,
  user_id uuid references public.profiles (id) on delete set null, -- who acted: the new holder, the asker, the approver, the admin
  label text, -- the device the event is about ("Chrome · Windows")
  created_at timestamptz not null default now()
);

create index team_device_events_registration_idx on public.team_device_events (registration_id, created_at desc);
create index team_device_events_user_id_idx on public.team_device_events (user_id);

alter table public.team_devices enable row level security;
alter table public.team_device_events enable row level security;

create policy "team_devices: admin read" on public.team_devices
  for select to authenticated using ((select private.is_admin()));
create policy "team_device_events: admin read" on public.team_device_events
  for select to authenticated using ((select private.is_admin()));

grant select on table public.team_devices, public.team_device_events to authenticated;
grant all on table public.team_devices, public.team_device_events to service_role;

-- The caller's accepted team in a competition that has the rule on; null otherwise.
create function private.team_device_registration(p_competition_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select r.id
  from public.registrations r
  join public.competitions c on c.id = r.competition_id
  where r.competition_id = p_competition_id
    and r.status = 'accepted'
    and c.single_device
    and private.is_team_member(r.id)
  limit 1;
$$;

create function private.team_device_member_name(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(nullif(btrim(p.full_name), ''), p.email) from public.profiles p where p.id = p_user_id;
$$;

revoke all on function private.team_device_registration(uuid) from public, anon, authenticated;
revoke all on function private.team_device_member_name(uuid) from public, anon, authenticated;

-- Called by every contest page on load and every few seconds. p_request = true asks the active device to hand over.
-- status: off (no team or rule off), active (this device holds the team; request_* is a waiting request),
-- waiting (this device's request is waiting), blocked (another device holds the team; request_* is another
-- device's waiting request), rejected / expired (this device's last request was turned down / not answered).
create function public.team_device_sync(p_competition_id uuid, p_device_id uuid, p_label text, p_request boolean default false)
returns table (
  status text,
  holder_name text,
  holder_label text,
  holder_since timestamptz,
  request_name text,
  request_label text,
  request_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_reg uuid;
  v_label text := left(coalesce(btrim(p_label), ''), 80);
  d public.team_devices;
begin
  if v_uid is null then
    raise exception 'Sign in again' using errcode = '42501';
  end if;
  v_reg := private.team_device_registration(p_competition_id);
  if v_reg is null or p_device_id is null then
    return query select 'off', null::text, null::text, null::timestamptz, null::text, null::text, null::timestamptz;
    return;
  end if;

  insert into public.team_devices (registration_id, device_id, user_id, label)
  values (v_reg, p_device_id, v_uid, v_label)
  on conflict (registration_id) do nothing;
  if found then
    insert into public.team_device_events (registration_id, action, user_id, label) values (v_reg, 'claimed', v_uid, v_label);
  end if;

  select * into d from public.team_devices where registration_id = v_reg for update;

  -- A request nobody answered within 60 s expires.
  if d.pending_at is not null and d.pending_at < now() - interval '60 seconds' then
    insert into public.team_device_events (registration_id, action, user_id, label)
    values (v_reg, 'expired', d.pending_user_id, d.pending_label);
    update public.team_devices
    set answered_device_id = pending_device_id, answer = 'expired', answered_at = now(),
        pending_device_id = null, pending_user_id = null, pending_label = null, pending_at = null
    where registration_id = v_reg
    returning * into d;
  end if;

  if d.device_id = p_device_id then
    update public.team_devices set seen_at = now(), user_id = v_uid where registration_id = v_reg returning * into d;
    return query select 'active', null::text, null::text, d.claimed_at,
      private.team_device_member_name(d.pending_user_id), d.pending_label, d.pending_at;
    return;
  end if;

  -- The holder has been silent for 90 s: it is off or closed, so this device takes over without asking.
  if d.seen_at < now() - interval '90 seconds' then
    update public.team_devices
    set device_id = p_device_id, user_id = v_uid, label = v_label, claimed_at = now(), seen_at = now(),
        pending_device_id = null, pending_user_id = null, pending_label = null, pending_at = null,
        answered_device_id = null, answer = null, answered_at = null
    where registration_id = v_reg
    returning * into d;
    insert into public.team_device_events (registration_id, action, user_id, label) values (v_reg, 'took_over_offline', v_uid, v_label);
    return query select 'active', null::text, null::text, d.claimed_at, null::text, null::text, null::timestamptz;
    return;
  end if;

  -- One request at a time: a second asker waits until the first is answered or expires.
  if p_request and d.pending_device_id is null then
    update public.team_devices
    set pending_device_id = p_device_id, pending_user_id = v_uid, pending_label = v_label, pending_at = now(),
        answered_device_id = null, answer = null, answered_at = null
    where registration_id = v_reg
    returning * into d;
    insert into public.team_device_events (registration_id, action, user_id, label) values (v_reg, 'requested', v_uid, v_label);
  end if;

  return query select
    case
      when d.pending_device_id = p_device_id then 'waiting'
      when d.pending_device_id is null and d.answered_device_id = p_device_id then d.answer::text
      else 'blocked'
    end,
    private.team_device_member_name(d.user_id), d.label, d.claimed_at,
    case when d.pending_device_id = p_device_id then null else private.team_device_member_name(d.pending_user_id) end,
    case when d.pending_device_id = p_device_id then null else d.pending_label end,
    d.pending_at;
end;
$$;

-- The active device answers the waiting request. Returns approved, rejected, expired, or none (nothing to answer,
-- or this device no longer holds the team).
create function public.team_device_answer(p_competition_id uuid, p_device_id uuid, p_approve boolean)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := (select auth.uid());
  v_reg uuid := private.team_device_registration(p_competition_id);
  d public.team_devices;
begin
  if v_uid is null then
    raise exception 'Sign in again' using errcode = '42501';
  end if;
  select * into d from public.team_devices where registration_id = v_reg for update;
  if d.registration_id is null or d.device_id is distinct from p_device_id or d.pending_device_id is null then
    return 'none';
  end if;

  if d.pending_at < now() - interval '60 seconds' then
    update public.team_devices
    set answered_device_id = pending_device_id, answer = 'expired', answered_at = now(),
        pending_device_id = null, pending_user_id = null, pending_label = null, pending_at = null
    where registration_id = v_reg;
    insert into public.team_device_events (registration_id, action, user_id, label)
    values (v_reg, 'expired', d.pending_user_id, d.pending_label);
    return 'expired';
  end if;

  if p_approve then
    update public.team_devices
    set device_id = pending_device_id, user_id = pending_user_id, label = pending_label, claimed_at = now(), seen_at = now(),
        pending_device_id = null, pending_user_id = null, pending_label = null, pending_at = null,
        answered_device_id = null, answer = null, answered_at = null
    where registration_id = v_reg;
    insert into public.team_device_events (registration_id, action, user_id, label) values (v_reg, 'approved', v_uid, d.pending_label);
    return 'approved';
  end if;

  update public.team_devices
  set answered_device_id = pending_device_id, answer = 'rejected', answered_at = now(),
      pending_device_id = null, pending_user_id = null, pending_label = null, pending_at = null
  where registration_id = v_reg;
  insert into public.team_device_events (registration_id, action, user_id, label) values (v_reg, 'rejected', v_uid, d.pending_label);
  return 'rejected';
end;
$$;

-- Server actions check this before judging a submission: true unless another device holds the caller's team.
create function public.team_device_allows(p_competition_id uuid, p_device_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select not exists (
    select 1 from public.team_devices d
    where d.registration_id = private.team_device_registration(p_competition_id)
      and d.device_id is distinct from p_device_id
  );
$$;

-- Admin: free a team, e.g. when its device broke and the next one should not wait. The next device to open a
-- contest page holds the team.
create function public.admin_team_device_reset(p_registration_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_label text;
begin
  if not private.is_admin() then
    raise exception 'Only admins can do this' using errcode = '42501';
  end if;
  delete from public.team_devices where registration_id = p_registration_id returning label into v_label;
  if found then
    insert into public.team_device_events (registration_id, action, user_id, label)
    values (p_registration_id, 'admin_reset', (select auth.uid()), v_label);
  end if;
end;
$$;

revoke all on function public.team_device_sync(uuid, uuid, text, boolean) from public, anon;
revoke all on function public.team_device_answer(uuid, uuid, boolean) from public, anon;
revoke all on function public.team_device_allows(uuid, uuid) from public, anon;
revoke all on function public.admin_team_device_reset(uuid) from public, anon;
grant execute on function public.team_device_sync(uuid, uuid, text, boolean) to authenticated;
grant execute on function public.team_device_answer(uuid, uuid, boolean) to authenticated;
grant execute on function public.team_device_allows(uuid, uuid) to authenticated;
grant execute on function public.admin_team_device_reset(uuid) to authenticated;
