-- The server has 2 cores (Supabase, Judge0 and the site on one VPS), so realtime is kept for the CP and Rally contests
-- only. The dashboard no longer listens to registration_events: it refreshes when the tab is opened again, or by hand.
-- cp_sessions, cp_scores, rally_sessions and rally_scores stay in the publication.
-- Guarded, so it also runs on a database where the table was never added.
do $$
begin
  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'registration_events'
  ) then
    alter publication supabase_realtime drop table public.registration_events;
  end if;
end
$$;
