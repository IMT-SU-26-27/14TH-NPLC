# Deploy

## Menyiapkan Supabase baru (self-hosted)

Untuk database production yang masih kosong: Supabase self-hosted (Docker) di VPS yang sama dengan aplikasi. Self-hosted tidak punya halaman Auth settings atau Rate Limits di Studio, jadi semua pengaturan Auth lewat env container (langkah 5).

Jangan tulis nilai env, password, key, email, atau link grup WhatsApp di repo ini. Repo ini publik.

### 1. Jalankan semua migration, berurutan

Jalankan semua file di `supabase/migrations/`, urut nama file (tanggal paling lama dulu), lewat psql di container `db`, masing-masing dalam satu transaksi:

```bash
for f in supabase/migrations/*.sql; do
  echo "== $f"
  docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 --single-transaction < "$f" || break
done
docker exec supabase-db psql -U postgres -d postgres -c "notify pgrst, 'reload schema';"
```

Production **tidak punya riwayat migration** (`supabase_migrations.schema_migrations`); semua migration dijalankan manual dengan psql seperti di atas. Karena itu:

- Untuk migration baru berikutnya: backup dulu (`pg_dump`, bagian 6), lalu jalankan **hanya file yang baru**, satu per satu dengan perintah yang sama. Cek dulu apakah sudah pernah jalan lewat objek yang dibuatnya (kolom, fungsi, policy); lihat `docs/database.md`.
- **Jangan pakai `supabase db push` ke production.** Tanpa riwayat, CLI menganggap semua migration belum jalan dan mencoba menjalankan ulang semuanya.

Kalau ada satu file gagal, berhenti dan perbaiki dulu. Jangan lompati file.

### 2. Isi konten publik: `supabase/seed.sql`

Isinya:
- lomba (CP dan Rally: biaya, kuota, rekening, twibbon, jendela pendaftaran 10 Nov 2026 – 10 Jan 2027 23:59 WIB);
- timeline (4 baris);
- sesi CP (`scheduled`, 18 Jan 2027);
- sesi Rally (`not_open`).

File ini aman dijalankan berulang:
- lomba dicocokkan lewat slug, timeline lewat judul Indonesia;
- sesi yang sudah dimulai tidak disentuh;
- link grup WhatsApp tidak pernah ditimpa.

Jalankan dengan salah satu cara:
- Studio → SQL Editor: tempel seluruh isi file, lalu Run;
- `docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/seed.sql`.

Bagian akhir file berisi query verifikasi. Hasil yang diharapkan:
- 2 lomba;
- 4 baris timeline;
- CP `scheduled`;
- Rally `not_open`.

Situs menyimpan cache daftar lomba beberapa menit dan timeline beberapa jam. Setelah mengisi lewat SQL, restart container aplikasi supaya nilai baru langsung tampil.

### 3. Akun admin

1. Daftar akun biasa lewat situs (`/id/signup`).
2. Di Studio → SQL Editor:

   ```sql
   update public.profiles set role = 'admin' where email = '<email>';
   ```

3. Keluar, lalu masuk lagi. Menu Admin muncul.

### 4. Link grup WhatsApp

Admin → Lomba → pilih lomba → "Link grup WhatsApp". Isi lewat Admin, jangan lewat SQL di repo. Link ini hanya terlihat oleh anggota tim yang sudah diterima.

### 5. Env Auth (container `auth` / GoTrue)

Nama variabel saja. Nilainya dipegang pengelola server.

| Variabel | Isi / catatan |
|---|---|
| `ENABLE_EMAIL_AUTOCONFIRM` | `true`. Setelah daftar, akun langsung masuk tanpa email konfirmasi. |
| `SITE_URL` | Domain yang aktif, sekarang `https://nplc.simawa-imtuc.com`. |
| `ADDITIONAL_REDIRECT_URLS` | Isi **kedua** domain dari sekarang, dipisah koma: `https://nplc.simawa-imtuc.com/auth/confirm,https://nplc.ciputra.ac.id/auth/confirm`. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_ADMIN_EMAIL`, `SMTP_SENDER_NAME` | Wajib. Hanya dipakai untuk email lupa kata sandi. |
| `GOTRUE_MAILER_TEMPLATES_RECOVERY` | `https://nplc.simawa-imtuc.com/email/recovery.html` (file `public/email/recovery.html`) |
| `GOTRUE_MAILER_SUBJECTS_RECOVERY` | judul email, mis. "Atur ulang kata sandi NPLC / Reset your NPLC password" |
| `GOTRUE_RATE_LIMIT_EMAIL_SENT` | Jumlah email per jam untuk seluruh situs. Sesuaikan dengan kuota penyedia SMTP. |
| `GOTRUE_RATE_LIMIT_VERIFY` | Batas verifikasi link per IP per 5 menit. |
| `GOTRUE_RATE_LIMIT_TOKEN_REFRESH` | Batas per IP per 5 menit untuk login (`/token`) dan refresh sesi. |
| `GOTRUE_RATE_LIMIT_HEADER` | Header yang dipakai GoTrue sebagai "IP" untuk dua batas di atas. **Baca catatan di bawah.** |

Catatan:

- Di `docker-compose.yml` Supabase self-hosted, variabel `GOTRUE_MAILER_TEMPLATES_*`, `GOTRUE_MAILER_SUBJECTS_*` dan `GOTRUE_RATE_LIMIT_*` belum diteruskan ke service `auth`. Tambahkan ke blok `environment:` service `auth`; mengisinya di `.env` saja tidak cukup.
- Setelah mengubah env, restart service `auth`.
- **Rate limit per IP.** Daftar, masuk, lupa kata sandi, dan verifikasi link semuanya dijalankan dari **server Next.js**: server action di `src/lib/actions/auth.ts` dan route `/auth/confirm`, bukan dari browser. Akibatnya GoTrue melihat satu IP untuk semua peserta, yaitu IP server aplikasi.
  - Kalau `GOTRUE_RATE_LIMIT_HEADER` diisi (mis. `X-Forwarded-For`), batas per IP berlaku untuk **seluruh situs sekaligus**. Saat ramai, peserta bisa ditolak padahal masing-masing baru mencoba sekali.
  - Kosongkan `GOTRUE_RATE_LIMIT_HEADER`, atau isi `GOTRUE_RATE_LIMIT_VERIFY` dan `GOTRUE_RATE_LIMIT_TOKEN_REFRESH` jauh di atas jumlah login yang diperkirakan per 5 menit.
  - Pembatasan per peserta lebih tepat dilakukan di reverse proxy (Nginx Proxy Manager) berdasarkan IP asli.

### 6. Backup harian

Backup disimpan **di luar VPS**. Kalau VPS rusak, backup di dalamnya ikut hilang. Contoh cron harian, jam 02.00:

```bash
# /etc/cron.d/nplc-backup
0 2 * * * root docker exec supabase-db pg_dump -U postgres -d postgres -Fc > /var/backups/nplc/nplc-$(date +\%F).dump && rclone copy /var/backups/nplc <remote>:nplc-backup && find /var/backups/nplc -name '*.dump' -mtime +14 -delete
```

- `-Fc` mencakup seluruh database, termasuk akun (`auth`) dan data pendaftaran.
- File bukti pembayaran ada di Cloudinary, bukan di database.
- Pulihkan dengan:

  ```bash
  docker exec -i supabase-db pg_restore -U postgres -d postgres --clean --if-exists < nplc-YYYY-MM-DD.dump
  ```

  Coba dulu di database kosong, jangan langsung di production.

### 7. Pindah domain ke `nplc.ciputra.ac.id`

Domain aktif sekarang `https://nplc.simawa-imtuc.com`. `nplc.ciputra.ac.id` diaktifkan ICT nanti, mengarah ke IP VPS yang sama.

Urutan langkahnya:

1. **DNS (ICT).** Record A `nplc.ciputra.ac.id` → IP VPS. Cek dengan `dig +short nplc.ciputra.ac.id` sebelum lanjut.
2. **Nginx Proxy Manager.**
   - Buat proxy host `nplc.ciputra.ac.id` → `nplc-web:3000`, centang Websockets Support, lalu minta sertifikat SSL Let's Encrypt (Force SSL, HTTP/2).
   - Proxy host lama dibiarkan dulu. Setelah domain baru stabil, ubah menjadi redirect 301 ke domain baru.
   - Kalau API Supabase juga pindah domain, buat proxy host + SSL untuk domain API yang baru dengan cara yang sama.
3. **Env Supabase (`/var/www/supabase/.env`).** Backup dulu (`cp .env .env.bak-YYYYMMDD-HHMM`).

   | Variabel | Nilai baru |
   |---|---|
   | `SITE_URL` | `https://nplc.ciputra.ac.id` |
   | `ADDITIONAL_REDIRECT_URLS` | Sudah berisi kedua domain (langkah 5), tidak perlu diubah. |
   | `GOTRUE_MAILER_TEMPLATES_RECOVERY` | `https://nplc.ciputra.ac.id/email/recovery.html` |
   | `API_EXTERNAL_URL`, `SUPABASE_PUBLIC_URL` | Hanya diubah kalau domain API Supabase ikut pindah. |

   Setelah itu restart service yang terkena saja. `auth` selalu; `studio` dan `envoy` hanya kalau URL API berubah. Jangan restart seluruh stack.
4. **GitHub Actions (Settings → Secrets).**
   - `NEXT_PUBLIC_SUPABASE_URL`: hanya kalau domain API Supabase ikut pindah. Nilai ini ditanam ke kode browser saat build, jadi perlu build ulang: jalankan ulang workflow deploy.
   - `VAPID_SUBJECT`: kalau isinya `https://nplc.simawa-imtuc.com`, ganti ke domain baru (atau `mailto:`).
   - Secret lain tidak bergantung pada domain.
5. **Aplikasi.** Redirect auth dibangun dari header `Host` (`src/lib/request-origin.ts`), jadi tidak ada kode yang perlu diubah. Setelah pindah, cek:
   - daftar, masuk, dan keluar di domain baru;
   - "Lupa kata sandi": link di email mengarah ke domain baru (`{{ .SiteURL }}`) dan berhasil masuk ke `/reset-password`.
6. **Yang ikut berubah bagi pengguna.**
   - Cookie login terikat domain, jadi semua orang perlu masuk lagi di domain baru.
   - Langganan notifikasi push terikat origin, jadi admin perlu menyalakan notifikasi lagi di Profil.
   - Link lama tetap jalan selama redirect 301 dari domain lama aktif.
