-- Real public content (production, DEV and local), docs/deploy.md "Menyiapkan Supabase baru (self-hosted)". Also runs on `supabase db reset`.
-- Run it AFTER every migration, in the SQL Editor (Studio) or with psql:
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f supabase/seed.sql
-- Safe to run again: competitions and timeline rows are matched by slug / Indonesian title and updated in place,
-- a session that has already started is never touched, and the WhatsApp group links are never overwritten.
-- No accounts, participants, keys or group links here: the repo is public.
-- The site caches competitions for minutes and the timeline for hours: restart the app (or save once in Admin) to
-- show the new values straight away.

begin;

-- 1. Competitions. wa_group_url: fill in through Admin -> Lomba, never in the repo. A re-run keeps what Admin set.
insert into public.competitions (
  slug, name, type, description, description_en, is_active, sort_order, fee, min_members, max_members, max_teams,
  payment_method, bank_account_number, bank_account_holder, twibbon_url,
  registration_opens_at, registration_closes_at, wa_group_url
)
values
  ('competitive-programming', 'Competitive Programming', 'competitive_programming',
   'Lomba pemrograman individu atau tim (maks. 3 orang). Selesaikan soal algoritmik yang dinilai otomatis.',
   'A programming contest for individuals or teams of up to 3. Solve algorithmic problems with automatic judging.',
   true, 1, 100000, 1, 3, 20,
   'bank_transfer', '003202798281', 'Angga Dhammika Jaya', 'https://canva.link/twibbonnplcxiv',
   '2026-11-10 00:00:00+07', '2027-01-10 23:59:59+07', null),
  ('logic-rally-games', 'Logic Rally Games', 'logic',
   'Rally beregu dengan beberapa pos logika, fisik dan digital. Kumpulkan poin di setiap pos dan bersaing di leaderboard.',
   'A team rally with several logic posts, physical and digital. Collect points at every post and climb the leaderboard.',
   true, 2, 100000, 3, 3, 35,
   'bank_transfer', '003202798281', 'Angga Dhammika Jaya', 'https://canva.link/twibbonnplcxiv',
   '2026-11-10 00:00:00+07', '2027-01-10 23:59:59+07', null)
on conflict (slug) do update set
  name = excluded.name,
  type = excluded.type,
  description = excluded.description,
  description_en = excluded.description_en,
  is_active = excluded.is_active,
  sort_order = excluded.sort_order,
  fee = excluded.fee,
  min_members = excluded.min_members,
  max_members = excluded.max_members,
  max_teams = excluded.max_teams,
  payment_method = excluded.payment_method,
  bank_account_number = excluded.bank_account_number,
  bank_account_holder = excluded.bank_account_holder,
  twibbon_url = excluded.twibbon_url,
  registration_opens_at = excluded.registration_opens_at,
  registration_closes_at = excluded.registration_closes_at;
  -- wa_group_url is left out on purpose: set it in Admin -> Lomba.

-- 2. Timeline (shown on the homepage and in the dashboard's "What's next"). competition_type null = every competition.
--    Matched by the Indonesian title: an existing row is updated, a missing one is added.
create temporary table production_timeline on commit drop as
select * from (values
  ('2026-11-10'::date, '2027-01-10'::date, 'Pendaftaran', 'Registration',
   'Daftarkan tim dan unggah bukti pembayaran.', 'Register your team and upload the payment proof.',
   null::public.competition_type),
  ('2027-01-18'::date, null::date, 'Penyisihan', 'Preliminary round',
   'Babak penyisihan Competitive Programming.', 'Competitive Programming preliminary round.',
   'competitive_programming'::public.competition_type),
  ('2027-01-25'::date, null::date, 'Technical Meeting', 'Technical Meeting',
   'Technical Meeting online, minimal 1 peserta per tim wajib ikut.', 'Online technical meeting; at least one member per team must attend.',
   'logic'::public.competition_type),
  ('2027-01-29'::date, null::date, 'Final & Rally Games', 'Final & Rally Games',
   'Hari puncak NPLC XIV di Universitas Ciputra.', 'The NPLC XIV main day at Universitas Ciputra.',
   null::public.competition_type)
) as e(starts_on, ends_on, title_id, title_en, description_id, description_en, competition_type);

update public.timeline_events t set
  starts_on = e.starts_on,
  ends_on = e.ends_on,
  title_en = e.title_en,
  description_id = e.description_id,
  description_en = e.description_en,
  competition_type = e.competition_type
from production_timeline e
where t.title_id = e.title_id;

insert into public.timeline_events (starts_on, ends_on, title_id, title_en, description_id, description_en, competition_type)
select e.starts_on, e.ends_on, e.title_id, e.title_en, e.description_id, e.description_en, e.competition_type
from production_timeline e
where not exists (select 1 from public.timeline_events t where t.title_id = e.title_id);

-- 3. CP contest session: scheduled for the preliminary round. The admin still starts it by hand.
--    TODO (Event): confirm the start time and the duration (now 09:00 WIB, 2 hours).
--    A session that is already live, paused or ended is left alone.
insert into public.cp_sessions as s (competition_id, status, scheduled_start_at, duration_seconds)
select id, 'scheduled', '2027-01-18 09:00:00+07', 7200
from public.competitions where slug = 'competitive-programming'
on conflict (competition_id) do update set
  scheduled_start_at = excluded.scheduled_start_at,
  duration_seconds = excluded.duration_seconds
where s.status = 'scheduled';

-- 4. Rally session: a trigger creates it with the Rally competition (status not_open). This only fills a gap.
insert into public.rally_sessions (competition_id)
select id from public.competitions where slug = 'logic-rally-games'
on conflict (competition_id) do nothing;

commit;

-- 5. Check. Expected: 2 competitions (bank_transfer, window 10 Nov 2026 – 10 Jan 2027), 4 timeline rows,
--    CP scheduled 18 Jan 2027 09:00 WIB, Rally not_open.
select slug, is_active, sort_order, fee, min_members, max_members, max_teams, payment_method,
  registration_opens_at at time zone 'Asia/Jakarta' as opens_wib,
  registration_closes_at at time zone 'Asia/Jakarta' as closes_wib,
  wa_group_url is not null as wa_group_set
from public.competitions order by sort_order;

select starts_on, ends_on, title_id, competition_type from public.timeline_events order by starts_on;

select c.slug, s.status, s.scheduled_start_at at time zone 'Asia/Jakarta' as starts_wib, s.duration_seconds
from public.cp_sessions s join public.competitions c on c.id = s.competition_id;

select c.slug, r.status from public.rally_sessions r join public.competitions c on c.id = r.competition_id;
