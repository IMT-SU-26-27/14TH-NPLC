# Database

The schema is defined in [`supabase/migrations/`](../supabase/migrations/). Starting data is in [`supabase/seed.sql`](../supabase/seed.sql).

| Migration | What it does |
|---|---|
| `20261015000000_init_schema.sql` | Tables, functions, RLS policies, realtime publication |
| `20261015010000_fix_anon_competitions_read.sql` | Splits the competitions read policy so logged-out visitors don't call `private.is_admin()` (which anon may not execute) |

Both migrations and the seed are applied to the self-hosted Supabase on the VPS (`supabase-db` container) and recorded in `supabase_migrations.schema_migrations`. To apply a new migration there:

```bash
docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 --single-transaction < supabase/migrations/<file>.sql
docker exec supabase-db psql -U postgres -d postgres -c "insert into supabase_migrations.schema_migrations (version, name) values ('<version>', '<name>'); notify pgrst, 'reload schema';"
```

To make yourself an admin, sign in once and then run:

```sql
update public.profiles set role = 'admin' where email = 'you@example.com';
```

## Tables

### Accounts and registration

| Table | What it holds |
|---|---|
| `profiles` | One row per account, created automatically on sign-up. `role` is `participant` or `admin`. Users can edit their name and avatar but not their role or email. |
| `competitions` | Each competition: `type` (`competitive_programming` or `logic`), team size (`min_members` to `max_members`, leader included), `fee` in rupiah, `qris_public_id` (Cloudinary), registration window, `is_active`. |
| `registrations` | One team in one competition: `team_name`, `leader_id`, `referral_code` (unique 8-character code members join with), `status`, payment proof (Cloudinary `public_id` + format), `rejection_reason`, reviewer. Team names are unique per competition (case-insensitive) and can't be changed by participants. |
| `registration_members` | Everyone on the team, leader included (`is_leader`). Every member is an account (`user_id`). Name, email (taken from the account), phone (required for the leader), 10-digit NISN. A person (account, NISN or email) can be on only one team per competition. |
| `registration_events` | The timeline on the participant dashboard. Written automatically on every status change; the rejection reason is stored as the event's `note`. |

### Competitive programming

| Table | What it holds |
|---|---|
| `cp_sessions` | One per CP competition. `status` is `scheduled`, `live` or `ended`. The admin's start/end button updates it; `started_at`/`ended_at` are filled automatically. `submission_cooldown_seconds` limits how often a team can submit (default 10). |
| `cp_problems` | The levels: `level` number, title, markdown statement, input/output format, `constraints`, `time_limit_ms`, `memory_limit_kb`, `points`, `is_published`. A problem can only be published once it has a test case. |
| `cp_test_cases` | One or more per problem, in order. `is_sample` cases are shown to participants; the rest stay hidden. |
| `cp_submissions` | Every judged submission: language, code, overall verdict, tests passed out of total, slowest time, highest memory, `efficiency`, `score`, compiler output. |
| `cp_submission_results` | The result of each test case in a submission. Never stores the expected output of hidden tests. |
| `cp_problem_scores` | A team's best score on each problem, and whether it solved it. |
| `cp_scores` | The leaderboard: one row per accepted CP team, with total points, problems solved and `last_improved_at` for tie-breaks. |

### Views and functions

| Name | Used by |
|---|---|
| `registration_overview` (view) | Admin registrations table: one row per team with competition name, referral code, leader details and member count. Search and filter on it. |
| `competition_stats` (view) | Admin dashboard counts per competition: `accepted_teams`, `accepted_people`, `under_review_teams`, `total_teams`. Add the rows together for the overall total. |
| `create_registration(competition_id, team_name, leader_name, leader_phone, leader_nisn)` | Registration form. Creates the team and the leader's member row, and generates the referral code. |
| `preview_team(referral_code)` | Join page. Shows team name, competition, leader, member count and whether it can still be joined, before the user confirms. |
| `join_team(referral_code, full_name, nisn, phone?)` | Join page. Adds the signed-in user to the team. |
| `cp_access()` | `src/proxy.ts`. Returns the caller's accepted CP teams and each contest's status. |
| `admin_save_problem(problem, test_cases)` | Admin problem form. Saves a problem and replaces its test cases in one step. |

## Registration flow

```
leader creates team ─▶ members join with the referral code
       │
pending_payment ──(leader uploads proof + submits)──▶ under_review ──(admin)──▶ accepted
       ▲                                                   │
       └──── team fixes members, resubmits ◀── rejected ◀──┘ (reason required)
```

- The leader creates the team, gets its referral code and shares it. Members sign in and join with the code.
- Team editing is limited to adding members (by code) and removing them. The leader can remove any member, and a member can leave. Nobody, admins included, can remove the leader row; it only goes away when the whole team is deleted.
- Participants can't change the team name, competition or referral code. Admins can fix the name.
- Joining and removing are allowed only while the status is `pending_payment` or `rejected`, and while the competition's registration window is open.
- Submitting checks the team has exactly one leader and the right number of members.
- Only admins can accept or reject. Rejecting requires a reason, and the reviewer and time are recorded.
- The leader can delete the whole team while it's still `pending_payment`.

## Who can see what (Row Level Security)

| Data | Participants | Admins |
|---|---|---|
| Active competitions | Everyone, including logged-out visitors | All |
| Registrations, members, timeline | Only their own team | All, full edit |
| CP session status | Members of accepted CP teams | All, start/end |
| CP problems | Members of accepted CP teams, **only while the contest is live** | All |
| CP test cases | Sample cases only, only while live | All |
| Submissions and results | Their own team's | All |
| Leaderboard | Members of accepted CP teams | All |

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
| `cp_sessions` | Waiting room moves into the contest when the admin presses start, and locks when it ends |
| `cp_scores` | Live leaderboard |
| `registration_events` | Participant dashboard updates when the admin accepts or rejects |

Realtime respects the policies above, so each user only receives changes they're allowed to read.

## Files (Cloudinary)

Only Cloudinary `public_id`s are stored in the database:

- `competitions.qris_public_id`: public image in the `14th-nplc/qris` folder.
- `registrations.payment_proof_public_id`: `authenticated` delivery type in `14th-nplc/payment-proofs`. Viewing one needs a signed link from a server action that checks the viewer is an admin or on that team.
