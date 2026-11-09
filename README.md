# 14th NPLC

Registration website and online competitive programming contest for the 14th National Programming & Logic Competition.

- Teams register for a competition and pay (QRIS or BCA transfer) in one step; teammates join with the team's 8-character code.
- Participants follow their registration on a dashboard timeline. Admins review payments, accept or reject teams, and manage competitions and homepage content.
- Accepted competitive programming teams compete on `/cp`: a waiting room that opens when the admin starts the contest, problems judged by Judge0, and a live leaderboard.
- Bilingual: Bahasa Indonesia (default, `/id/...`) and English (`/en/...`).

**Team member running it on your own laptop?** Follow [Setup cepat anggota tim (Windows)](#setup-cepat-anggota-tim-windows): no Docker, no Supabase account, no team secrets. The numbered steps further down are for setting up a real deployment.

**Stack:** Next.js 16 (App Router, Cache Components) · Supabase (Postgres, Auth, Realtime) · Cloudinary · Judge0 · shadcn/ui · Tailwind CSS v4 · Zod · GSAP.

---

## Setup cepat anggota tim (Windows)

Jalur utama untuk anggota tim yang ingin menjalankan web di laptop sendiri dan **menguji alur pendaftaran**: daftar akun, daftar tim, gabung tim, dan dasbor. Web jalan di laptopmu dan terhubung ke **Supabase DEV tim**.

Yang **tidak** perlu disiapkan:
- Docker;
- akun Supabase;
- kunci rahasia tim.

Yang dibutuhkan hanya **URL + anon key DEV dari Koor Tech** (lewat japri) dan akun Cloudinary gratis milikmu sendiri.

### Prasyarat

| Alat | Versi | Cara pasang (PowerShell) | Cek |
|---|---|---|---|
| Git | terbaru | `winget install Git.Git` | `git --version` |
| Node.js | **22 LTS** (minimal 20.9) | `winget install OpenJS.NodeJS.LTS` | `node -v` |
| pnpm | **10.17.0** | `corepack enable` | `pnpm -v` |
| Cloudinary | akun gratis **milik sendiri** | daftar di [cloudinary.com](https://cloudinary.com) | — |

Catatan pemasangan:
- Setelah memasang Git atau Node, **tutup lalu buka lagi** PowerShell supaya perintah barunya dikenali.
- Kalau `corepack enable` gagal dengan *EPERM*, jalankan PowerShell **sebagai Administrator** satu kali saja. Kalau `pnpm -v` sudah menampilkan `10.x`, error itu boleh diabaikan.
- Jangan pakai `npm`, `npx`, atau `yarn` untuk proyek ini.

### Langkah

1. **Clone dan install** (di folder tempat kamu menyimpan proyek):

   ```powershell
   git clone https://github.com/IMT-SU-26-27/14TH-NPLC.git
   cd 14TH-NPLC
   git checkout staging
   pnpm install
   ```

2. **Buat `.env.local`:**

   ```powershell
   Copy-Item .env.local.example .env.local
   notepad .env.local
   ```

   Isi file itu:
   - `NEXT_PUBLIC_SUPABASE_URL` dan `NEXT_PUBLIC_SUPABASE_ANON_KEY`: **minta ke Koor Tech lewat japri**, lalu tempel menggantikan nilai `isi-dari-koor`.
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: dari **akun Cloudinary milikmu**. Login di cloudinary.com, buka **Console → Settings** (ikon roda gigi) **→ API Keys**, lalu salin *Cloud name*, *API Key*, dan *API Secret*.
   - **Sisanya biarkan apa adanya:** `SUPABASE_SERVICE_ROLE_KEY` dan `JUDGE0_*` sudah berisi dummy yang lolos validasi, dan baris VAPID tetap dikomentari.

   Simpan file-nya.

3. **Jalankan:**

   ```powershell
   pnpm dev
   ```

   Buka **http://localhost:3000/id**. Halaman pertama butuh 10–20 detik untuk dikompilasi; berikutnya cepat. Biarkan terminal ini tetap terbuka selama web dipakai.

4. **Uji alur pendaftaran:**
   1. Klik **Daftar** di header, lalu buat akun dengan data fiktif.
   2. Buka **Pilih lomba**, pilih lomba, isi form, unggah bukti bayar (gambar apa saja), lalu kirim.
   3. Buat akun kedua di jendela *Incognito*. Klik **Gabung tim** dan masukkan **kode tim** dari dasbor ketua.

5. **Berhenti:** tekan `Ctrl+C` di terminal `pnpm dev`.

6. **Memperbarui ke versi terbaru tim:**

   ```powershell
   git pull
   pnpm install
   ```

   Setelah itu jalankan lagi `pnpm dev`.

### Tes di HP Android (lewat kabel USB)

1. Pasang Android platform-tools di laptop: `winget install Google.PlatformTools`, lalu buka lagi PowerShell.
2. Di HP, aktifkan USB debugging:
   1. Buka **Setelan → Tentang ponsel**, lalu ketuk **Nomor build** 7 kali sampai muncul "Anda sekarang developer".
   2. Buka **Setelan → Sistem → Opsi developer**, lalu nyalakan **Debugging USB**.
3. Sambungkan HP ke laptop dengan kabel USB. Di HP akan muncul pertanyaan "Izinkan debugging USB?"; pilih **Izinkan**.
4. Di laptop, dengan `pnpm dev` tetap menyala:

   ```powershell
   adb devices                    # HP harus terdaftar sebagai "device", bukan "unauthorized"
   adb reverse tcp:3000 tcp:3000
   ```

5. Di HP, buka Chrome ke **http://localhost:3000/id**.

Kalau kabel dicabut, ulangi `adb reverse`.

### Yang tidak bisa di jalur ini

| Fitur | Kenapa |
|---|---|
| Panel Admin (menerima tim, melihat bukti bayar, mengatur lomba) | Butuh akun admin di DEV. Tes admin dilakukan Koor di server tim. |
| Melihat bukti bayar dari server tim | Bukti tersimpan di Cloudinary **milikmu**, jadi admin di server tim hanya melihat gambar kosong. Menerima atau menolak tim tetap bisa. |
| Lupa sandi sampai selesai | Email terkirim, tetapi link di dalamnya membuka alamat web DEV (*Site URL*), bukan `localhost`. |
| Kontes CP (menilai kode), akun LO, notifikasi push | Butuh kunci rahasia tim (service role, Judge0, VAPID), yang memang tidak dibagikan. |

### Troubleshooting

| Masalah | Solusi |
|---|---|
| Terminal atau halaman menampilkan *ZodError* / *invalid_type* / *Invalid URL* | Ada isi `.env.local` yang kosong atau salah format; nama variabelnya disebut di pesan error. URL harus diawali `https://`. Jangan kosongkan baris VAPID: biarkan dikomentari (`#`). |
| *Port 3000 is in use* | Masih ada `pnpm dev` lain yang jalan. Tutup terminalnya, atau buka port yang tercetak (mis. 3001). Untuk HP, sesuaikan `adb reverse tcp:3001 tcp:3001`. |
| `.env.local` sudah diubah tapi tidak berpengaruh | Hentikan `pnpm dev` (Ctrl+C) lalu jalankan lagi. Env hanya dibaca saat start. |
| Error aneh setelah `git pull` (modul tidak ditemukan dsb.) | Jalankan `pnpm install`, lalu `pnpm dev` lagi. |
| Upload bukti bayar gagal (mis. *cloud_name is disabled*, *Invalid API key*) | `CLOUDINARY_*` masih nilai contoh atau salah salin. Cek lagi di Console → Settings → API Keys, lalu restart `pnpm dev`. |
| Login gagal: "akun belum aktif" | Laporkan ke Koor: pengaturan "Confirm email" di DEV. |
| HP tidak bisa membuka `localhost:3000` | Cek `adb devices` (harus `device`), ulangi `adb reverse tcp:3000 tcp:3000`, dan pastikan `pnpm dev` masih menyala. |

### Aturan

- **Jangan commit `.env.local` atau `.env*` apa pun.** File-file itu sudah di-`.gitignore`, kecuali `.env.local.example`. Cek `git status` sebelum commit.
- **Jangan bagikan URL atau anon key DEV di grup**, dokumen, atau screenshot. Koor memberikannya lewat japri.
- **Data uji harus fiktif:** nama, email, NISN, nomor WA, dan bukti bayar karangan. Jangan memakai data peserta asli.
- **Setelah selesai tes, hapus akun dan tim ujimu**, atau laporkan email-nya ke Koor supaya dihapus. DEV dipakai bersama.

---

## Setup mandiri penuh (opsional, project Supabase sendiri)

Untuk yang ingin database **sendiri**, misalnya untuk mencoba panel Admin. Kamu butuh akun [supabase.com](https://supabase.com) gratis. Semua perintah di bawah memakai Supabase CLI **2.101.0** lewat `pnpm sb` (tanpa install, tanpa `npx`).

1. Di supabase.com, buat **project baru milikmu sendiri**. Ref project ada di URL dashboard: `supabase.com/dashboard/project/<ref>`.
2. Terapkan skema:

   ```powershell
   pnpm sb login
   pnpm sb link --project-ref <ref>
   pnpm sb db push
   ```

3. Isi data contoh: buka **SQL Editor** di dashboard, tempel seluruh isi [`supabase/seed.sql`](supabase/seed.sql), lalu **Run**. Isinya:
   - 2 lomba (rekening contoh);
   - timeline;
   - sesi CP dan Rally;
   - 10 soal CP.

   Seed ini tidak membuat akun apa pun.
4. **Authentication → Sign In / Providers → Email:** matikan **Confirm email**.
5. Buat admin di **Authentication → Users → Add user** (centang *Auto Confirm User*). Login sekali di web, lalu jalankan di SQL Editor:

   ```sql
   update public.profiles set role = 'admin' where email = 'email-adminmu@example.com';
   ```

6. Isi `.env.local` dari **Project Settings → API** project-mu: Project URL, `anon` key, dan `service_role` key ke `SUPABASE_SERVICE_ROLE_KEY`. Cloudinary tetap dari akunmu sendiri. Lalu jalankan `pnpm dev`.

Catatan:
- `pnpm sb link` menyimpan ref project di `supabase/.temp` (tidak ikut di-commit). Jangan pernah me-*link* ke project tim.
- Punya Docker Desktop? Supabase lokal juga bisa dipakai: `pnpm sb start` menjalankan migration dan seed otomatis, lalu ambil URL dan key dari `pnpm sb status`.

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
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Cloudinary → Settings → API Keys. **Secret, server only.** | uploads |
| `JUDGE0_URL` | Base URL of your Judge0 server, e.g. `http://your-host:2358` | CP contest |
| `JUDGE0_AUTH_TOKEN` | The `AUTHN_TOKEN` configured in Judge0's `judge0.conf` | CP contest |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` | Generate once with `pnpm exec web-push generate-vapid-keys`. **The private key is secret, server only.** Optional: without them the notification switch is hidden. | web push |
| `VAPID_SUBJECT` | A contact for push services: `mailto:you@example.com` or an `https://` URL | web push |

Never commit `.env` / `.env.local`; they are git-ignored. Only `.env.local.example` is tracked.

## 3. Set up the database

The schema lives in [`supabase/migrations/`](supabase/migrations). It creates every table, Row Level Security policy, trigger, function and the Realtime publication.

**Option A: Supabase CLI**

```bash
supabase link --project-ref <your-project-ref>   # supabase.com projects
supabase db push
```

**Option B: SQL editor** (works for self-hosted Supabase too)

Open Supabase Studio → SQL Editor and run each file in `supabase/migrations/` **in filename order**, then run [`supabase/seed.sql`](supabase/seed.sql). The seed is **sample data** (example competitions with a dummy bank account, timeline, sessions and 10 CP problems, no accounts): on a real deployment set the competitions up in Admin instead and keep only its CP problems part.

Then regenerate the TypeScript types if you changed the schema (self-hosted, with Supabase running in Docker on the same machine):

```bash
pnpm db:types
```

(On supabase.com use `supabase gen types typescript --linked > src/types/database.ts`.)

## 4. Configure Supabase Auth

- **Confirm email: off** (self-hosted: `ENABLE_EMAIL_AUTOCONFIRM=true` in Supabase's `.env`). After sign-up the user is signed in straight away and lands on `/dashboard`, or back on the join link they came from. Accounts made while confirmation was still on can't sign in; confirm them in the SQL editor with `update auth.users set email_confirmed_at = now() where email_confirmed_at is null;`.
- **SMTP: required, for password resets only.** The reset link is the only email the site sends. Set it in **Authentication → SMTP Settings** (self-hosted: the `SMTP_*` settings in Supabase's `.env`). Without custom SMTP, hosted Supabase only delivers to the project's team members, at a few emails an hour.
- **Site URL:** the real domain (e.g. `https://nplc.example.com`), not `localhost`. Add `https://<domain>/auth/confirm` to the allowed redirect URLs too (and `http://localhost:3000/auth/confirm` for development).
- **Reset Password template:** point the link at `/auth/confirm` with the token hash, so it works on any device and not only in the browser that asked for it:

  ```html
  <a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password">Reset password</a>
  ```

  Flow: `/forgot-password` sends the email, `/auth/confirm` signs the user in, `/reset-password` saves the new password. Under the form, users who get no email are pointed to their competition's contact person on WhatsApp.
- **Manual reset (fallback, if the email never arrives):** the committee sets a temporary password in the SQL editor, and the user changes it on their Profile page after signing in:

  ```sql
  update auth.users
  set encrypted_password = extensions.crypt('<temporary password>', extensions.gen_salt('bf')), updated_at = now()
  where email = lower('<user email>');
  ```

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

1. Sign up on the site.
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
  app/auth/confirm/    password reset link callback
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
| Sign-up or sign-in says the account isn't active yet | "Confirm email" is still on in Supabase Auth. Turn it off and confirm existing accounts (see [step 4](#4-configure-supabase-auth)). |
| Password reset email doesn't arrive | Check the SMTP settings and the Auth logs. Meanwhile, reset the password by hand (see [step 4](#4-configure-supabase-auth)). |
| Reset link opens the forgot-password page with "invalid or expired" | The link expired (1 hour) or was already used, or the template still uses `{{ .ConfirmationURL }}` and was opened in another browser. Use the `token_hash` template above. |
| "Permission denied for table …" | A migration wasn't applied, or a table is missing grants. Re-run the migrations in order. |
| Register button stays disabled | The competition has no payment method set up. Set QRIS or BCA in Admin → Registrations → Payment. |
| Waiting room doesn't move into the contest | Check that Realtime is running and the migrations (which add `cp_sessions`, `cp_scores` and `registration_events` to the `supabase_realtime` publication) were applied. |
| Every submission returns "judging failed on the server" | See the [Judge0 server note](#judge0-server-note). |
