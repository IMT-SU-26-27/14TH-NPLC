# Database

The schema is defined in [`supabase/migrations/`](../supabase/migrations/). Starting data is in [`supabase/seed.sql`](../supabase/seed.sql): the two competitions, the CP session, and 10 easy CP problems (levels 1-10, 100 points, 2 sample + 4 hidden tests each, published). Re-running the seed skips levels that already exist.

| Migration | What it does |
|---|---|
| `20261015000000_init_schema.sql` | Tables, functions, RLS policies, realtime publication |
| `20261015010000_fix_anon_competitions_read.sql` | Splits the competitions read policy so logged-out visitors don't call `private.is_admin()` (which anon may not execute) |
| `20261016000000_cp_pause_and_difficulty_enums.sql` | Adds `paused` to `cp_session_status` and the `cp_difficulty` enum (own migration: new enum values must be committed before use) |
| `20261016000100_cp_pause_and_difficulty.sql` | Contest pause/resume (`paused_at`, `paused_seconds`, trigger), `cp_problems.difficulty`, `admin_save_problem` takes `difficulty` |
| `20261016120000_push_subscriptions.sql` | `push_subscriptions` for web push notifications |
| `20261016130000_cp_leaderboard_freeze.sql` | Leaderboard freeze (`cp_sessions.leaderboard_frozen_at`, `cp_leaderboard_snapshots`) and hiding the leaderboard from participants after the contest ends |
| `20261016140000_cp_contest_duration.sql` | `cp_sessions.duration_seconds`; the end time is set from it on start, submissions are refused after it, and `cp_finish_if_time_up()` ends the contest |

Both migrations and the seed are applied to the self-hosted Supabase on the VPS (`supabase-db` container) and recorded in `supabase_migrations.schema_migrations`. To apply a new migration there:

```bash
docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 --single-transaction < supabase/migrations/<file>.sql
docker exec supabase-db psql -U postgres -d postgres -c "insert into supabase_migrations.schema_migrations (version, name) values ('<version>', '<name>'); notify pgrst, 'reload schema';"
```

After a schema change, regenerate the TypeScript types in `src/types/database.ts` (both Supabase clients use them):

```bash
pnpm db:types
```

To make yourself an admin, sign in once and then run:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## Tables

### Accounts and registration

| Table | What it holds |
|---|---|
| `profiles` | One row per account, created automatically on sign-up. `role` is `participant`, `admin` or `lo`. Users can edit their name and avatar but not their role or email. |
| `competitions` | Each competition: `type` (`competitive_programming` or `logic`), team size (`min_members` to `max_members`, leader included), `fee` in rupiah, `twibbon_url` (optional), `qris_public_id` (Cloudinary), registration window, `is_active`. |
| `registrations` | One team in one competition: `team_name`, `school`, `line_id` (the contact person's LINE ID; both required for new teams, empty on older ones, and fixed for participants), `leader_id`, `referral_code` (unique 8-character code members join with), `status`, payment proof (Cloudinary `public_id` + format), `rejection_reason`, reviewer. Team names are unique per competition (case-insensitive) and can't be changed by participants. |
| `registration_members` | Everyone on the team, leader included (`is_leader`). Every member is an account (`user_id`). Name, email (taken from the account), phone (required for the leader), 10-digit NISN, twibbon post proof (Cloudinary `public_id` + format; required on join and register once the competition has a `twibbon_url`). A person (account, NISN or email) can be on only one team across all competitions, enforced by unique indexes. |
| `registration_events` | The timeline on the participant dashboard. Written automatically on every status change; the rejection reason is stored as the event's `note`. |

### Rally Games

| Table | What it holds |
|---|---|
| `rally_posts` | One post of the competition of type `logic` (Category 2): `name`, `kind` (`physical` or `digital`, recorded the same way), `location`, `points_win`, `points_lose`, `points_draw` (placeholders 100, 25 and 50 until the Divisi Event sets them), `allow_draw`, `is_active`. Names are unique per competition. |
| `rally_post_assignments` | Which LO runs which post. A trigger accepts only accounts with the role `lo`. |

`profiles.role` also has the value `lo`. Admins create these accounts with the service role. A trigger stops LO accounts joining a team, and `src/proxy.ts` keeps them out of the participant and admin pages. Routes and replays are not built yet: see `docs/rally-games-plan.md`.

### Homepage content

| Table | What it holds |
|---|---|
| `site_content` | One row: the About NPLC title and body in Indonesian and English. Empty fields fall back to the built-in copy. Anyone can read it; admins edit it on `/admin/content`. |
| `timeline_events` | The homepage timeline: `starts_on`, optional `ends_on`, title and description in both languages, sorted by start date. Anyone can read; admins add, edit and delete. |

### Notifications

| Table | What it holds |
|---|---|
| `push_subscriptions` | One row per browser/device that turned on web push: `user_id`, the push service `endpoint` (unique), its `p256dh`/`auth` keys and the `locale` notifications are written in. The server writes and reads it with the service role (`src/lib/push/`); users can only see and delete their own rows. Rows the push service reports as gone (404/410) are deleted on the next send. |

### Competitive programming

| Table | What it holds |
|---|---|
| `cp_sessions` | One per CP competition. `status` is `scheduled`, `live`, `paused` or `ended`. The admin's start/pause/resume/end buttons update it; `started_at`/`ended_at`/`paused_at` are filled automatically. Only a live contest can be paused. While paused, problems are hidden and submissions are refused (both require `live`) and participants wait in the waiting room. On resume the pause length is added to `paused_seconds` and `scheduled_end_at` moves back by it. `submission_cooldown_seconds` limits how often a team can submit (default 10). `duration_seconds` (required before starting) sets the length: on start `scheduled_end_at` becomes `started_at + duration_seconds + paused_seconds` (the `cp_sessions_set_end` trigger, which also follows duration changes while running). After `scheduled_end_at` no submission is accepted (2-minute grace in the database for code already being judged; the server action checks strictly on arrival), and the contest timer calls `cp_finish_if_time_up()` at zero to set `status = 'ended'`. |
| `cp_problems` | The levels: `level` number, `difficulty` (`easy`, `medium`, `hard`; default `easy`), title, markdown statement, input/output format, `constraints`, `time_limit_ms`, `memory_limit_kb`, `points`, `is_published`. A problem can only be published once it has a test case. |
| `cp_test_cases` | One or more per problem, in order. `is_sample` cases are shown to participants; the rest stay hidden. |
| `cp_submissions` | Every judged submission: language, code, overall verdict, tests passed out of total, slowest time, highest memory, `efficiency`, `score`, compiler output. |
| `cp_submission_results` | The result of each test case in a submission. Never stores the expected output of hidden tests. |
| `cp_problem_scores` | A team's best score on each problem, and whether it solved it. |
| `cp_scores` | The leaderboard: one row per accepted CP team, with total points, problems solved and `last_improved_at` for tie-breaks. |
| `cp_leaderboard_snapshots` | Copy of `cp_scores` taken when an admin freezes the leaderboard (`cp_sessions.leaderboard_frozen_at` set), deleted on unfreeze. Participants read this instead of `cp_scores` while frozen. |

### Views and functions

| Name | Used by |
|---|---|
| `registration_overview` (view) | Admin registrations table: one row per team with competition name, referral code, leader details and member count. Search and filter on it. |
| `competition_stats` (view) | Admin dashboard counts per competition: `accepted_teams`, `accepted_people`, `under_review_teams`, `total_teams`. Add the rows together for the overall total. |
| `create_registration(competition_id, team_name, leader_name, leader_phone, leader_nisn, payment_proof_public_id, payment_proof_format)` | Registration form. Creates the team already paid (status `under_review`) with the leader's member row and the referral code. The server action first checks the proof exists in Cloudinary. |
| `preview_team(referral_code)` | Join page. Shows team name, competition, leader, member count and whether it can still be joined, before the user confirms. |
| `join_team(referral_code, full_name, nisn, phone?)` | Join page. Adds the signed-in user to the team. |
| `cp_access()` | `src/proxy.ts`. Returns the caller's accepted CP teams and each contest's status. |
| `cp_finish_if_time_up(competition_id)` | Contest timer at zero. Ends a live contest whose end time has passed; does nothing otherwise, so any signed-in user may call it. |
| `admin_save_problem(problem, test_cases)` | Admin problem form. Saves a problem and replaces its test cases in one step. |

## Registration flow

```
leader fills team details + uploads QRIS payment proof
       │  (registering = paying: the team only exists once the proof is sent)
       ▼
under_review ──(admin)──▶ accepted
       ▲           │
       │           └──▶ rejected (reason required) ──(leader uploads a new proof)──┘
       │
members join with the referral code at any point while the competition's registration window is open
```

- Each person uploads a proof of posting the twibbon when registering or joining (`14th-nplc/twibbon-proofs/<user id>/`). It is required only once the competition has a `twibbon_url`. Members who joined before the link was set keep an empty proof, and admins see that in the registration detail.
- Paying is part of registering: the register form takes the team details and the payment proof together. The proof is uploaded to Cloudinary first (`14th-nplc/payment-proofs/new/<user id>/`), then `create_registration()` creates the team as `under_review` with the referral code.
- Members join with the code, and the leader can remove members (or a member can leave), while the competition's registration window is open, whatever the status. Nobody, admins included, can remove the leader row.
- Participants can't change the team name, competition or referral code. Admins can fix the name.
- The minimum team size is checked when an admin accepts: accepting a team with too few members is refused. The maximum is enforced on every join.
- After a rejection the leader uploads a new proof, which sends the team back to `under_review`.
- Only admins can accept or reject. Rejecting requires a reason, and the reviewer and time are recorded.
- `pending_payment` is no longer used by the app; it remains for teams an admin creates by hand.

## Who can see what (Row Level Security)

| Data | Participants | Admins |
|---|---|---|
| Active competitions | Everyone, including logged-out visitors | All |
| Registrations, members, timeline | Only their own team | All, full edit |
| CP session status | Members of accepted CP teams | All, start/end |
| CP problems | Members of accepted CP teams, **only while the contest is live** | All |
| CP test cases | Sample cases only, only while live | All |
| Submissions and results | Their own team's | All |
| Leaderboard (`cp_scores`) | Members of accepted CP teams, **only while the contest hasn't ended and the leaderboard isn't frozen** | All, always live |
| Frozen leaderboard (`cp_leaderboard_snapshots`) | Members of accepted CP teams, only while frozen and the contest hasn't ended | All |

Submissions can't be written from the browser at all. The server judges the code with Judge0 and records the result using the service role. The database also rejects submissions when the contest isn't live, the team isn't accepted, or the cooldown hasn't passed.

## Accounts

Every team member signs in before creating or joining a team, so each member row belongs to a real account and the email comes from that account. Participants can only create teams through `create_registration()` and join through `join_team()`; direct inserts are blocked.

Supabase links a Google sign-in to an existing email/password account with the same verified email automatically. This needs email confirmation turned on in your self-hosted Auth settings.

## Scoring

The server works out each submission's score after Judge0 runs every test case:

```
score = points × (passed / total) × efficiency
```

- `efficiency` ranges from 0.7 to 1.0. It drops as the slowest test case's time and highest memory get closer to the problem's limits.
- Judge0 can't measure time or space complexity directly. Big test cases are what catch the wrong complexity: a slow solution hits Time Limit Exceeded and loses that test case.
- Only a team's best submission per problem counts, so a worse later submission never lowers the score.
- Leaderboard order: `total_points` descending, then `last_improved_at` ascending (whoever got there first).

## Realtime

These tables are in the `supabase_realtime` publication:

| Table | Purpose |
|---|---|
| `cp_sessions` | Waiting room moves into the contest when the admin presses start or resume; the contest page goes back to the waiting room when it is paused, and locks when it ends |
| `cp_scores` | Live leaderboard |
| `registration_events` | Participant dashboard updates when the admin accepts or rejects |

Realtime respects the policies above, so each user only receives changes they're allowed to read.

## Web push notifications

Sent from Server Actions with `after()`, so the user never waits for them (`src/lib/push/notify.ts`):

| Event | Who gets it |
|---|---|
| Admin accepts or rejects a team | Every member of that team |
| New team registered, or a proof re-sent after a rejection | Every admin |
| Someone joins with the team code | The team leader |
| Contest started, paused, resumed or ended | Every member of every accepted team in that competition |

Each device gets the text in the language it subscribed with. Needs `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` and `VAPID_SUBJECT`; without them nothing is sent and the switch on `/profile` is hidden.

## Files (Cloudinary)

Only Cloudinary `public_id`s are stored in the database:

- `competitions.qris_public_id`: public image in the `14th-nplc/qris` folder.
- `registration_members.twibbon_proof_public_id`: `authenticated` delivery type in `14th-nplc/twibbon-proofs`. Only admins can view these, through signed links on the registration detail page.
- `registrations.payment_proof_public_id`: `authenticated` delivery type in `14th-nplc/payment-proofs`. Viewing one needs a signed link from a server action that checks the viewer is an admin or on that team.
