# CP contest seed for DEV

`scripts/seed-cp-contest.mjs` fills the **DEV** database with a live Competitive Programming contest, so the contest screens can be tested with realistic data without anyone typing it in.

Never run it against production. The script refuses to start unless you type the database URL on the command line.

## What it creates

Everything is separate from real data and is removed by `--reset`:

- **Competition:** `E2E Competitive Programming`, slug `e2e-cp`. It is hidden from the site (`is_active = false`), so it never shows on Home or in registration.
- **Session:** live, started 50 minutes ago, 4 hours long by default. The leaderboard closes for participants in the last hour, as in the real contest.
- **Problems:** 8 problems A–H (easy, medium and hard), 100 points each. Each has 5 test cases: 2 samples and 3 hidden.
- **Teams:** 20 accepted teams with made-up schools. Each team is one account, `e2e-cp-01@nplc.test` … `e2e-cp-20@nplc.test`, all with the password from `E2E_CP_PASSWORD`.
- **Submissions:** about 60, spread over the first 45 minutes and scored by the database the same way as real ones. They include:
  - Accepted, plus a repeat Accepted ("Yes – Solved"): faster for team 2, not faster for team 3;
  - Wrong Answer, Time Limit Exceeded, Runtime Error and Compile Error;
  - a judge error that costs nothing (team 9);
  - negative scores (teams 12–16);
  - two teams on 200 points split by total runtime (teams 5 and 6);
  - three teams with no submissions (teams 17–19);
  - a disqualified team (team 20), hidden from the participants' leaderboard.
- **"Tim kamu" in the design:** sign in as `e2e-cp-04@nplc.test`, which is **Byte Squad**.

Submissions have no per-test results (`cp_submission_results`), so the admin submission detail shows the verdict without the test table. Submissions made from the site after seeding are judged normally by Judge0.

## Run it

1. In `.env.local`, which points at DEV, set `SUPABASE_SERVICE_ROLE_KEY` and a password for the seeded accounts:

   ```
   E2E_CP_PASSWORD=<at least 8 characters>
   ```

   Share the password with the team privately. Do not commit it.

2. Run the migrations on DEV first (`supabase/migrations`), at least up to the CP scoring migration (`20261113100000_cp_guidebook_scoring.sql`).

3. Seed. `--confirm` must be exactly the `NEXT_PUBLIC_SUPABASE_URL` from `.env.local`:

   ```bash
   pnpm seed:cp --confirm https://<dev supabase url>
   pnpm seed:cp --confirm https://<dev supabase url> --hours 6   # longer session
   ```

   Running it again replaces the earlier seed: it removes the earlier seed, then creates a new one.

4. Open `/cp` signed in as one of the seeded accounts. Admins see the contest under **Admin → CP**: choose "E2E Competitive Programming" as the competition.

## Remove it

```bash
pnpm seed:cp --confirm https://<dev supabase url> --reset
```

This deletes:

- the `e2e-cp` competition, with its teams, problems, session, submissions and scores;
- every `e2e-cp-NN@nplc.test` account.

Nothing else is touched. The existing DEV accounts and teams (demo1, R1) stay.
