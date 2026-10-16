-- New enum values must be committed before they can be used, so they get their own migration.

-- 'paused': the admin froze a running contest. Problems are hidden and submissions are refused until it resumes.
alter type public.cp_session_status add value if not exists 'paused' after 'live';

create type public.cp_difficulty as enum ('easy', 'medium', 'hard');
