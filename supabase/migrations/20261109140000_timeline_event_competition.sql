-- Which competition a timeline event is for, so the dashboard can show each accepted team its own next date (the
-- preliminary round is Competitive Programming only). Null means every competition, e.g. registration or the final
-- day. The homepage timeline still shows every event. Read like the other columns: timeline_events is public.
alter table public.timeline_events
  add column competition_type public.competition_type;
