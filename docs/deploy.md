# Deploy

## Menyiapkan Supabase baru (self-hosted)

Untuk database production yang masih kosong: Supabase self-hosted (Docker) di VPS yang sama dengan aplikasi. Self-hosted tidak punya halaman Auth settings atau Rate Limits di Studio, jadi semua pengaturan Auth lewat env container (langkah 5).

Jangan tulis nilai env, password, key, email, atau link grup WhatsApp di repo ini. Repo ini publik.

### 1. Jalankan semua migration, berurutan

Jalankan semua file di `supabase/migrations/`, urut nama file (tanggal paling lama dulu). Pilih salah satu cara.

**A. Supabase CLI lewat SSH tunnel (disarankan).** CLI mencatat migration yang sudah jalan, jadi deploy berikutnya hanya menjalankan yang baru.

```bash
# Terminal 1: buka tunnel ke port Postgres container (sesuaikan host dan port).
ssh -N -L 54322:localhost:5432 <user>@<vps>
# Terminal 2, dari folder repo:
pnpm sb db push --db-url "postgresql://postgres:<password>@localhost:54322/postgres" --dry-run   # cek daftarnya dulu
pnpm sb db push --db-url "postgresql://postgres:<password>@localhost:54322/postgres"
```

Password diketik saat itu juga. Jangan simpan ke file.

**B. psql di container `db`.** Cara ini tidak mencatat riwayat, jadi catat sendiri migration terakhir yang sudah jalan.

```bash
for f in supabase/migrations/*.sql; do
  echo "== $f"
  docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < "$f" || break
done
```

Kalau ada satu file gagal, berhenti dan perbaiki dulu. Jangan lompati file.

### 2. Isi konten publik: `supabase/production-content.sql`

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
- `docker exec -i supabase-db psql -U postgres -d postgres -v ON_ERROR_STOP=1 < supabase/production-content.sql`.

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
| `SITE_URL` | domain production, `https://…` |
| `ADDITIONAL_REDIRECT_URLS` | `https://<domain>/auth/confirm` |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_ADMIN_EMAIL`, `SMTP_SENDER_NAME` | Wajib. Hanya dipakai untuk email lupa kata sandi. |
| `GOTRUE_MAILER_TEMPLATES_RECOVERY` | `https://<domain>/email/recovery.html` (file `public/email/recovery.html`) |
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
