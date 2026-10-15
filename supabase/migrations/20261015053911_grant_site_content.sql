-- The site content tables were created by a role whose default privileges don't include
-- Supabase's API roles. Grant the same table privileges every other public table has; RLS still decides access.
grant all on table public.site_content to anon, authenticated, service_role;
grant all on table public.timeline_events to anon, authenticated, service_role;
