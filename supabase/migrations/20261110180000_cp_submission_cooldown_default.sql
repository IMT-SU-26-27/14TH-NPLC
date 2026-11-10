-- Raises the default submission cooldown from 10 to 15 seconds.
--
-- Every submission fans out into one Judge0 job per test case, and the judge runs on
-- the same 2-core host as the web app and Supabase. A 10 second cooldown let the whole
-- field submit fast enough to fill Judge0's queue, which answers with an error the
-- participant reads as "the judge is not available right now". 15 seconds keeps the
-- queue short without being noticeable to a team that is actually solving problems.
--
-- Sessions that an admin already tuned by hand keep their own value; only rows still
-- sitting on the old default are moved.

alter table public.cp_sessions
  alter column submission_cooldown_seconds set default 15;

update public.cp_sessions
set submission_cooldown_seconds = 15
where submission_cooldown_seconds = 10;
