# Rencana Rally Games

Status: **disetujui, dikerjakan bertahap.** Rute dan main ulang ditunda sampai ada jawaban Divisi Event.
Sumber: Website Request Guidelines NPLC 14th, Brief Fitur Rally Games, dan keputusan Tech per 31 Oktober 2026.

Kalau brief dan dokumen ini berbeda, yang berlaku dokumen ini. Contohnya undo oleh LO: brief hanya menyebut koreksi oleh admin.

## 1. Ringkasan

LO memindai QR tim dengan kamera HP, lalu menekan Menang, Kalah, atau Seri. Poin tercatat otomatis dan leaderboard ikut berubah secara realtime.

Rancangan ini memakai pola yang sudah terbukti di kontes CP: sesi dengan status, skor yang diperbarui trigger, Realtime, dan freeze lewat snapshot.

| Keputusan yang sudah ada | Dampak ke rancangan |
|---|---|
| 2 role: peserta dan LO. LO hanya mengakses pos miliknya | Role baru `lo` dan tabel penugasan |
| Poin per pos: menang, kalah, seri, toggle "bisa seri" (awal 100/25/50) | Kolom di `rally_posts`, nilainya bisa diubah admin |
| Undo oleh LO dalam beberapa menit, koreksi oleh admin, semua tercatat | Hasil tidak pernah dihapus, hanya dibatalkan; ada log append-only |
| Pos fisik dan digital diinput LO dengan cara yang sama | `kind` hanya label, alurnya sama |

## 2. Skema

Semua tabel memakai RLS. Semua penulisan oleh LO dan peserta lewat fungsi RPC yang divalidasi di server, bukan INSERT langsung.

### Role

`user_role` mendapat nilai baru `lo`. `ALTER TYPE ... ADD VALUE` harus berada di file migration terpisah sebelum dipakai, seperti `cp_pause_and_difficulty_enums`.

Fungsi baru `private.is_lo_of_post(post_id)` mengecek penugasan. `create_registration` dan `join_team` menolak akun LO, supaya panitia tidak bisa sekaligus menjadi peserta.

### Tabel

```sql
create type public.rally_post_kind as enum ('physical', 'digital');
create type public.rally_outcome as enum ('win', 'lose', 'draw');
create type public.rally_log_action as enum ('recorded', 'undone', 'corrected', 'voided');

-- Satu sesi per lomba, seperti cp_sessions.
create table public.rally_sessions (
  competition_id uuid primary key references public.competitions (id) on delete cascade,
  status public.cp_session_status not null default 'scheduled',
  undo_window_seconds integer not null default 300 check (undo_window_seconds between 0 and 3600),
  leaderboard_frozen_at timestamptz,
  started_at timestamptz,
  ended_at timestamptz
);

create table public.rally_posts (
  id uuid primary key default gen_random_uuid(),
  competition_id uuid not null references public.competitions (id) on delete restrict,
  name text not null check (char_length(btrim(name)) between 2 and 80),
  kind public.rally_post_kind not null default 'physical',
  location text,
  ordinal smallint not null default 0,
  points_win integer not null default 100 check (points_win >= 0),
  points_lose integer not null default 25 check (points_lose >= 0),
  points_draw integer not null default 50 check (points_draw >= 0),
  allow_draw boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Satu LO bisa memegang beberapa pos, dan satu pos bisa dipegang beberapa LO.
create table public.rally_post_assignments (
  post_id uuid not null references public.rally_posts (id) on delete cascade,
  lo_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, lo_id)
);
create index on public.rally_post_assignments (lo_id);

-- Rute per tim. Kosong berarti tim bebas memilih pos (menunggu keputusan Event).
create table public.rally_team_routes (
  registration_id uuid not null references public.registrations (id) on delete cascade,
  post_id uuid not null references public.rally_posts (id) on delete cascade,
  ordinal smallint not null,
  primary key (registration_id, post_id),
  unique (registration_id, ordinal)
);

-- Hasil tidak pernah dihapus. Undo dan koreksi mengisi voided_at.
create table public.rally_results (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations (id) on delete restrict,
  post_id uuid not null references public.rally_posts (id) on delete restrict,
  outcome public.rally_outcome not null,
  points integer not null,              -- salinan saat dicatat, tidak ikut berubah kalau poin pos diedit
  client_request_id uuid not null,      -- tombol ditekan dua kali atau sinyal putus tidak mencatat dobel
  recorded_by uuid not null references public.profiles (id),
  recorded_at timestamptz not null default now(),
  voided_at timestamptz,
  voided_by uuid references public.profiles (id),
  void_reason text,
  unique (client_request_id)
);
-- Satu hasil aktif per tim per pos. Dihapus atau diubah kalau Event mengizinkan main ulang.
create unique index rally_results_one_active on public.rally_results (registration_id, post_id) where voided_at is null;
create index on public.rally_results (post_id, recorded_at desc);

-- Append-only, diisi trigger. Tidak ada policy UPDATE atau DELETE untuk siapa pun.
create table public.rally_result_log (
  id bigint generated always as identity primary key,
  result_id uuid not null references public.rally_results (id) on delete restrict,
  action public.rally_log_action not null,
  actor_id uuid not null references public.profiles (id),
  before jsonb,
  after jsonb,
  reason text,
  created_at timestamptz not null default now()
);
create index on public.rally_result_log (result_id, created_at);

-- Diperbarui trigger dari rally_results, seperti cp_scores, dan masuk publication Realtime.
create table public.rally_scores (
  registration_id uuid primary key references public.registrations (id) on delete cascade,
  competition_id uuid not null references public.competitions (id) on delete cascade,
  team_name text not null,
  total_points integer not null default 0,
  wins integer not null default 0,
  posts_played integer not null default 0,
  last_scored_at timestamptz
);
create index on public.rally_scores (competition_id, total_points desc);

-- Snapshot saat dibekukan, seperti cp_leaderboard_snapshots.
create table public.rally_leaderboard_snapshots (like public.rally_scores including defaults);
```

Token QR ditambahkan ke tim:

```sql
alter table public.registrations
  add column rally_qr_token uuid not null default gen_random_uuid() unique;
```

Token dibuat terpisah dari `referral_code` supaya bisa diganti tanpa mengubah kode tim. QR berisi `nplc-rally:<token>`, tanpa data pribadi.

### RPC

| Fungsi | Dipanggil oleh | Validasi |
|---|---|---|
| `rally_lookup_team(post_id, code)` | LO | LO memegang pos itu. Menerima token atau kode tim, dan tim harus `accepted`. Mengembalikan nama tim, status di pos ini, dan apakah pos ada di rutenya. Tidak mengembalikan NISN, HP, atau email |
| `rally_record_result(post_id, code, outcome, client_request_id)` | LO | Pemeriksaan di atas, kontes `live`, pos aktif, `draw` hanya kalau `allow_draw`, belum ada hasil aktif. Poin diambil dari pos |
| `rally_undo_result(result_id)` | LO | Hanya hasil miliknya, dan masih dalam `undo_window_seconds`. Setelah itu lewat admin |
| `rally_correct_result(result_id, outcome, reason)` | Admin | Alasan wajib. Membatalkan hasil lama dan membuat yang baru dalam satu transaksi |
| `rally_void_result(result_id, reason)` | Admin | Alasan wajib |
| `rally_recalculate_post(post_id, reason)` | Admin | Dipakai kalau nilai poin final datang setelah ada hasil. Dicatat di log per hasil |

### RLS

| Tabel | Peserta | LO | Admin |
|---|---|---|---|
| `rally_sessions` | Baca status | Baca status | Semua |
| `rally_posts` | Baca | Baca | Semua |
| `rally_post_assignments` | Tidak | Baca miliknya | Semua |
| `rally_team_routes` | Baca rute timnya | Tidak; dicek di RPC | Semua |
| `rally_results` | Baca hasil timnya | Baca hasil di posnya | Baca; ubah lewat RPC |
| `rally_result_log` | Tidak | Tidak | Baca saja |
| `rally_scores` | Lewat fungsi leaderboard yang menghormati freeze | Sama dengan peserta | Baca langsung |

`rally_qr_token` hanya terbaca oleh tim sendiri dan admin, karena LO tidak punya akses baca ke `registrations`. LO yang mengakses pos di luar penugasannya ditolak di RPC, bukan hanya disembunyikan di UI.

## 3. Alur layar

### Peserta

- **Dasbor tim:** kartu "Rally Games" berisi QR besar, kode tim sebagai cadangan, dan petunjuk menaikkan kecerahan layar.
- **Rute:** daftar pos berurutan dengan status sudah atau belum. Hasil terbaru tiba lewat Realtime.
- **`/rally/leaderboard`:** ranking realtime dengan label "Tim kamu". Saat dibekukan menampilkan snapshot.
- **Opsional:** notifikasi masuk 4 besar atau final, memakai web push yang sudah ada.

### LO

1. **`/lo`:** daftar pos miliknya. Kalau hanya satu, langsung masuk.
2. **`/lo/posts/[id]`:** kamera menyala. Ada input kode manual kalau kamera gagal atau QR rusak.
3. **Setelah scan:** nama tim tampil besar supaya LO memastikan orangnya benar, lalu tombol besar **Menang**, **Kalah**, dan **Seri** (kalau pos mengizinkan). Tombol Batal kembali ke kamera.
4. **Setelah menyimpan:** hasil dan poin tampil, dengan tombol **Batalkan** dan hitung mundur. Kamera siap lagi untuk tim berikutnya.
5. **Riwayat:** 10 input terakhir di pos ini, dengan undo selama masih dalam batas waktu.

Pesan penting ditulis sebagai kalimat lengkap, misalnya "Tim ini sudah punya hasil di pos ini" atau "Tim ini belum diterima". Status kontes yang bukan `live` mengunci tombol.

### Admin

`/admin/rally`, dengan tab:

- **Kendali:** mulai, jeda, akhiri, bekukan, batas waktu undo.
- **Pos:** tambah dan ubah pos, poin, toggle seri, penugasan LO.
- **Akun LO:** admin membuat akun lewat server action dengan service role. LO mengganti password saat login pertama.
- **Rute:** atur per tim, kalau Event memakainya.
- **Hasil:** filter per pos dan tim, koreksi dan batalkan dengan alasan wajib.
- **Log:** riwayat lengkap, hanya baca.
- **Leaderboard:** skor terbaru dan snapshot.

`src/proxy.ts` membatasi `/lo` untuk role `lo` dan `admin`, dan mengarahkan akun LO dari `/dashboard`, `/register`, dan `/join` ke `/lo`.

## 4. Library scan QR

Rilis terakhir dicek di npm pada 31 Oktober 2026.

| Library | Rilis terakhir | Catatan |
|---|---|---|
| `@yudiel/react-qr-scanner` 2.6.0 | Mei 2026 | **Rekomendasi.** Komponen React, peer dependency mencakup React 19, memakai `barcode-detector` dan `webrtc-adapter` |
| `barcode-detector` 3.2.3 | Oktober 2026 | Ponyfill Barcode Detection API berbasis ZXing WebAssembly. Pilihan kalau butuh kontrol penuh; butuh kode kamera sendiri |
| `@zxing/browser` 0.2.1 | Juli 2026 | Masih dirawat, tapi perlu kode kamera sendiri |
| `html5-qrcode` 2.3.8 | April 2023 | Tidak dipilih, sudah lama tidak rilis |
| `qr-scanner` 1.4.2 | November 2022 | Tidak dipilih, sudah lama tidak rilis |
| `jsqr` 1.4.0 | April 2021 | Tidak dipilih, sudah lama tidak rilis |

Untuk membuat QR: `qrcode` 1.5.4 di server, hasilnya SVG, jadi tidak menambah beban JavaScript di browser.

Rekomendasi ini **belum diuji di HP sungguhan**, jadi harus dibuktikan di fase 0. Yang perlu dicek:

- **iPhone Safari dan Android Chrome:** izin kamera, kamera belakang, dan kecepatan scan di ruangan redup dan di layar yang terang.
- **File WebAssembly:** dari mana dimuat. Kalau dari CDN, sebaiknya di-host sendiri supaya tidak mengulang risiko Monaco.
- **HTTPS:** kamera browser hanya jalan lewat HTTPS, jadi VPS UC beserta domain dan SSL harus siap sebelum gladi.

## 5. Risiko

| Risiko | Penanganan |
|---|---|
| Sinyal buruk di lokasi pos | `client_request_id` mencegah input dobel saat dicoba ulang. Antrean offline belum termasuk; lihat pertanyaan 12 |
| LO salah tim | Nama tim harus tampil dan dikonfirmasi sebelum tombol hasil |
| LO salah tombol | Undo dalam batas waktu, lalu koreksi admin. Semua tercatat di log |
| QR dibagikan ke tim lain | LO mencocokkan nama tim. Admin bisa mengganti token |
| HP peserta mati atau tertinggal | Setiap anggota punya QR yang sama, dan LO bisa mengetik kode tim |
| Kamera ditolak di HP LO | Input kode manual |
| Nilai poin berubah setelah kegiatan berjalan | Hasil menyimpan salinan poin. Hitung ulang hanya lewat aksi admin yang tercatat |

## 6. Tahapan

Setiap fase dikerjakan lewat PR kecil ke `staging`.

| Fase | Isi | Syarat |
|---|---|---|
| 1 | Halaman uji scan QR di HP | Sudah disetujui |
| 2 | Role LO, penugasan LO ke pos, pengaturan poin per pos | Sudah disetujui |
| 3 | QR tim, layar LO (scan lalu Menang/Kalah/Seri), undo, log, koreksi admin | Library lolos uji HP di fase 1 |
| 4 | Leaderboard rally | Fase 3 dan pertanyaan 6-8 |
| Ditunda | Rute per tim dan main ulang | Jawaban pertanyaan 1-3 |
| Opsional | Notifikasi 4 besar atau final | Pertanyaan 9 |
| Sebelum acara | Gladi dengan LO sungguhan | VPS UC, domain, dan SSL |

Rute dan main ulang belum dibuat. Skema dirancang agar keduanya mudah ditambah: rute cukup tabel baru, dan main ulang cukup mengubah indeks unik hasil aktif.

## 7. Pertanyaan terbuka untuk Divisi Event

Kolom "Asumsi sementara" dipakai kalau pengembangan harus jalan sebelum ada jawaban.

| # | Pertanyaan | Asumsi sementara | Dampak kalau berbeda |
|---|---|---|---|
| 1 | Siapa yang menentukan rute? Tetap untuk semua, diacak, atau bebas? | Bebas, rute opsional | Tabel rute dan penugasan massal |
| 2 | Apakah tim wajib mengikuti urutan? Bagaimana kalau tim datang ke pos di luar rute? | Hanya peringatan ke LO | Validasi di `rally_record_result` |
| 3 | Boleh main ulang di pos yang sama? Kalau boleh, poin mana yang dihitung? | Tidak boleh | Indeks unik dan rumus skor |
| 4 | Format hasil cukup Menang/Kalah/Seri, atau ada pos dengan skor angka? | Tanpa skor angka | Kolom dan UI input |
| 5 | Lawan di pos: tim lain, AI, atau panitia? Kalau antar tim, satu input untuk dua tim? | Satu input per tim | Alur LO jadi dua kali scan |
| 6 | Tie-break leaderboard kalau poin sama? | Menang terbanyak, lalu yang lebih dulu mencapai poin itu | Urutan leaderboard |
| 7 | Kapan leaderboard dibekukan? | Admin menekan manual | Otomatis berdasarkan waktu |
| 8 | Kapan batas waktu rally? Input setelah waktu habis diterima? | Admin mengakhiri manual | Akhir otomatis, seperti CP |
| 9 | Siapa yang masuk final? 4 besar keseluruhan atau ada aturan lain? Finalnya memakai sistem ini? | 4 besar dari leaderboard, final di luar sistem | Fitur notifikasi dan alur final |
| 10 | Berapa jumlah pos fisik, pos digital, LO, dan tim? | Belum ada | Ukuran VPS dan jumlah akun |
| 11 | QR per tim atau per anggota? Apakah semua anggota harus hadir di pos? | Per tim | Token dan alur scan |
| 12 | Apakah semua lokasi pos punya sinyal yang stabil? | Ya, atau ada Wi-Fi panitia | Perlu antrean offline di HP LO |
| 13 | Berapa menit batas undo oleh LO? | 5 menit, bisa diubah admin | Hanya pengaturan |
| 14 | Berapa poin final per pos, dan kapan aturan dikunci? | 100/25/50 | Hanya data, selama sebelum kegiatan |
| 15 | Bolehkah peserta melihat poin tiap pos sebelum bermain? | Boleh | RLS `rally_posts` |
| 16 | Apakah NISN perlu diisi saat registrasi akun? Saat ini NISN diisi per anggota saat daftar atau gabung tim, dan satu NISN hanya boleh ikut satu lomba | Tidak perlu | Kolom baru di `profiles` dan form signup |

## 8. Keputusan Tech

Disetujui pada 31 Oktober 2026:

1. Rancangan skema dan RPC di bagian 2. Bagian rute dan main ulang belum dibuat.
2. `@yudiel/react-qr-scanner`, dengan syarat lolos uji di HP.
3. Token QR terpisah dari kode tim, dan kode tim sebagai input manual cadangan.
4. Lomba Rally memakai `competition_type` `logic` yang sudah ada (Category 2), bukan tipe baru.
