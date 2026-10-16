# 14th NPLC

Registration website and online competitive programming contest for the 14th National Programming & Logic Competition.

- Teams register for a competition and pay (QRIS or BCA transfer) in one step; teammates join with the team's 8-character code.
- Participants follow their registration on a dashboard timeline. Admins review payments, accept or reject teams, and manage competitions and homepage content.
- Accepted competitive programming teams compete on `/cp`: a waiting room that opens when the admin starts the contest, problems judged by Judge0, and a live leaderboard.
- Bilingual: Bahasa Indonesia (default, `/id/...`) and English (`/en/...`).

**Stack:** Next.js 16 (App Router, Cache Components) · Supabase (Postgres, Auth, Realtime) · Cloudinary · Judge0 · shadcn/ui · Tailwind CSS v4 · Zod · GSAP.

---

## Requirements

| What | Version / notes |
|---|---|
| [Node.js](https://nodejs.org) | 20.9 or newer |
| [pnpm](https://pnpm.io) | 10 (`corepack enable` picks up the version pinned in `package.json`). Use pnpm only, not npm or yarn. |
| [Supabase](https://supabase.com) | A self-hosted instance or a supabase.com project. You need the API URL, the `anon` key and the `service_role` key. |
| [Cloudinary](https://cloudinary.com) | Free account is enough. Stores QRIS images and payment proofs. |
| [Judge0](https://github.com/judge0/judge0) | Self-hosted Judge0 CE 1.13 with an auth token. Only needed for the CP contest. See [Judge0 server note](#judge0-server-note). |
| Supabase CLI (optional) | Only if you want to apply migrations with `supabase db push`. |

---

## 1. Clone and install

```bash
git clone https://github.com/IMT-SU-26-27/14TH-NPLC.git
cd 14TH-NPLC
corepack enable          # makes the right pnpm version available
pnpm install
```

## 2. Environment variables

Copy the example file and fill in every value:

```bash
cp .env.local.example .env.local
```

| Variable | Where to find it | Used by |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API (self-hosted: your Kong/API URL) | browser + server |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API keys → `anon` | browser + server |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API keys → `service_role`. **Secret, server only.** | judging submissions |
| `SUPABASE_MCP_KEY` | Only for the self-hosted Supabase MCP server (`.mcp.json`). Not needed to run the app. | Claude Code |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary → Settings → API Keys. **Secret, server only.** | uploads |
| `JUDGE0_URL` | Base URL of your Judge0 server, e.g. `http://your-host:2358` | CP contest |
| `JUDGE0_AUTH_TOKEN` | The `AUTHN_TOKEN` configured in Judge0's `judge0.conf` | CP contest |

Never commit `.env` / `.env.local`; they are git-ignored. Only `.env.local.example` is tracked.

## 3. Set up the database

The schema lives in [`supabase/migrations/`](supabase/migrations). It creates every table, Row Level Security policy, trigger, function and the Realtime publication.

**Option A: Supabase CLI**

```bash
supabase link --project-ref <your-project-ref>   # supabase.com projects
supabase db push
```

**Option B: SQL editor** (works for self-hosted Supabase too)

Open Supabase Studio → SQL Editor and run each file in `supabase/migrations/` **in filename order**, then run [`supabase/seed.sql`](supabase/seed.sql). The seed creates the two competitions (Competitive Programming and Category 2) and the contest session.

Then regenerate the TypeScript types if you changed the schema (self-hosted, with Supabase running in Docker on the same machine):

```bash
pnpm db:types
```

(On supabase.com use `supabase gen types typescript --linked > src/types/database.ts`.)

## 4. Configure Supabase Auth

- **Email confirmation** must be on, and SMTP must be configured so confirmation emails are delivered (self-hosted: the `SMTP_*` settings in Supabase's `.env`).
- **Site URL / redirect URLs:** add your app URL (e.g. `http://localhost:3000`) and `http://localhost:3000/auth/confirm` to the allowed redirect URLs.
- **Password reset:** `/forgot-password` sends Supabase's *Reset Password* email, whose link goes through `/auth/confirm` to `/reset-password`. With the default template the link only works in the browser that asked for it (PKCE). To make it work on any device, set the template's link to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`.
- **Google sign-in (optional, later):** enable the Google provider (self-hosted: `GOTRUE_EXTERNAL_GOOGLE_*`). Accounts with the same verified email are linked automatically.

## 5. Run it

```bash
pnpm dev          # http://localhost:3000 (redirects to /id)
```

Production build:

```bash
pnpm build
pnpm start
```

Checks (run before every commit):

```bash
pnpm exec tsc --noEmit
pnpm lint
```

## 6. Create the first admin

1. Sign up on the site and confirm your email.
2. In the Supabase SQL editor run:

   ```sql
   update public.profiles set role = 'admin' where email = 'you@example.com';
   ```

3. Sign in again and open `/id/admin`.

## 7. Before opening registration

As an admin:

1. **Admin → Competitions:** set each competition's team size, fee and registration window.
2. **Admin → Registrations → Payment:** for each competition choose **QRIS** (upload the QRIS image) or **BCA transfer** (account number and holder name). Teams can't register until this is set.
3. **Admin → Content:** write the About NPLC text and add the timeline dates (both languages).
4. **Admin → CP contest:** the seed already adds 10 easy problems (levels 1-10). Add more with test cases and a difficulty (easy / medium / hard), set the schedule and submission cooldown, and press **Start** when the contest begins. **Pause** hides the problems and sends teams back to the waiting room; **Resume** brings them back and moves the scheduled end back by the length of the pause.

---

## Judge0 server note

Judge0 1.13 runs code inside `isolate`, which needs **cgroup v1**. On hosts using cgroup v2 (default on recent Ubuntu/Debian) every submission returns *Internal Error* (`No such file or directory @ rb_sysopen - /box/script.py`). Fix on the Judge0 server:

```bash
sudo sed -i 's/^GRUB_CMDLINE_LINUX="/GRUB_CMDLINE_LINUX="systemd.unified_cgroup_hierarchy=0 /' /etc/default/grub
sudo update-grub && sudo reboot
# after the reboot, in the Judge0 folder:
docker compose up -d
```

Verdicts, languages and scoring are documented in [`docs/judge0-errors.md`](docs/judge0-errors.md).

---

## Project structure

```
src/
  app/[lang]/          routes (id / en); pages are thin Server Components
  app/auth/confirm/    email confirmation callback
  features/<feature>/  feature components (auth, registration, dashboard, admin, cp, content, landing, competitions)
  components/ui/       shadcn/ui components (generated, don't edit)
  components/shared/   header, footer, menus, markdown, i18n provider
  hooks/               every React hook, one per file
  lib/                 data reads (lib/data), Server Actions (lib/actions), Zod schemas (lib/validations),
                       Supabase/Cloudinary/Judge0 clients, i18n dictionaries
  types/               every TypeScript type and interface
  proxy.ts             language prefix + route guards (/admin, /cp)
supabase/              migrations and seed
docs/                  database.md, judge0-errors.md
```

More detail: [`docs/database.md`](docs/database.md) (tables, flows, security), [`DESIGN.md`](DESIGN.md) (design system), [`CLAUDE.md`](CLAUDE.md) (coding rules).

## Troubleshooting

| Problem | Fix |
|---|---|
| Sign-up says to check email but nothing arrives | Configure SMTP in Supabase Auth. |
| "Permission denied for table …" | A migration wasn't applied, or a table is missing grants. Re-run the migrations in order. |
| Register button stays disabled | The competition has no payment method set up. Set QRIS or BCA in Admin → Registrations → Payment. |
| Waiting room doesn't move into the contest | Check that Realtime is running and the migrations (which add `cp_sessions`, `cp_scores` and `registration_events` to the `supabase_realtime` publication) were applied. |
| Every submission returns "judging failed on the server" | See the [Judge0 server note](#judge0-server-note). |
