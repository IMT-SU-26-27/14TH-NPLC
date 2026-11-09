-- Koor decision (9 Nov 2026): participants never delete their own team, and a team's members are fixed once an admin
-- accepts it. Changes after that go through the competition's contact person; admins can still do everything.
-- New members can still join an accepted team with its code (join_team is unchanged).

-- 1. Only admins delete a registration (before: the leader too, while pending_payment).
drop policy "registrations: leader deletes unpaid or admin" on public.registrations;
create policy "registrations: admin deletes" on public.registrations
  for delete to authenticated
  using ((select private.is_admin()));

-- 2. Leaving or removing a member is closed once the team is accepted.
create or replace function private.registration_accepted(p_registration_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.registrations r where r.id = p_registration_id and r.status = 'accepted');
$$;

revoke all on function private.registration_accepted(uuid) from public, anon;
grant execute on function private.registration_accepted(uuid) to authenticated, service_role;

drop policy "members: leader removes or member leaves while editable" on public.registration_members;
create policy "members: leader removes or member leaves until accepted" on public.registration_members
  for delete to authenticated
  using (
    (select private.is_admin())
    or (
      not is_leader
      and private.registration_editable(registration_id)
      and not private.registration_accepted(registration_id)
      and (private.is_team_leader(registration_id) or user_id = (select auth.uid()))
    )
  );
