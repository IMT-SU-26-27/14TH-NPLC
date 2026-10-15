-- Logged-out visitors could not read competitions: the shared policy called private.is_admin(),
-- which anon may not execute, so every anon select failed with "permission denied for function is_admin".
-- Split the policy so anon only checks is_active and never touches the private schema.

drop policy "competitions: public read active" on public.competitions;

create policy "competitions: anon read active" on public.competitions
  for select to anon
  using (is_active);

create policy "competitions: authenticated read active or admin" on public.competitions
  for select to authenticated
  using (is_active or (select private.is_admin()));
