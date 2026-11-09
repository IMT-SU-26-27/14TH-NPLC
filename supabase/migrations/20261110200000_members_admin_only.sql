-- HOD decision (10 Nov 2026): only admins remove a team's members. Leaders can no longer remove members and members
-- can no longer leave, in any status; participants ask the competition's contact person instead.
-- Joining with the team code is unchanged (join_team), also after the team is accepted.

drop policy "members: leader removes or member leaves until accepted" on public.registration_members;

create policy "members: admin removes" on public.registration_members
  for delete to authenticated
  using ((select private.is_admin()));

-- Only the policy above used it.
drop function private.registration_accepted(uuid);
