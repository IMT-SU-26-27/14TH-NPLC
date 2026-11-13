# Serah terima desain — Lomba Competitive Programming (NPLC XIV)

Untuk: Claude Code (repo `IMT-SU-26-27/14TH-NPLC`, Next.js 16 + shadcn/ui base-nova)
Sumber desain: canvas Claude Design "14th NPLC – Website", halaman **Lomba CP (redesign)**, versi 89
(https://claude.ai/artifact/WeMRPBKWk5p5Twe4G6VfBK), diimpor ke Figma
[NPLC XIV – Website (Final)](https://www.figma.com/design/KmXmjSDV3syoSzru6OZ6PJ), halaman "Lomba CP (v89)".
Aturan visual: `DESIGN.md` di repo. Aturan lomba: guidebook Kategori 1 (Programming) NPLC 14th.

Canvas adalah referensi tata letak, bukan kode untuk disalin. Bangun ulang dengan primitive di `src/components/ui`,
warna hanya dari token `globals.css`, teks hanya dari kamus `id` / `en`.

> Revisi setelah v89 (disepakati Claude Desktop ↔ Claude Code, 13 Nov 2026):
> - Hitung mundur memakai selisih jam server, jadi teks Tooltip sisa waktu diganti (lihat bagian 1, Waktu).
> - Alasan diskualifikasi **wajib** diisi admin (3–500 karakter) dan selalu tampil ke tim.
> - Route layar 6: `/[lang]/cp/result`. Layar besar 1920: `/[lang]/admin/cp/display` (khusus admin).
> - Token `success-border` dan `warning-border` dari `tokens.css` ditambahkan ke `globals.css` di PR fondasi.

---

## 1. Aturan yang wajib dipegang

**Tampilan (DESIGN.md)**
- Light saja, datar: tanpa `shadow-*`, tanpa gradien, tanpa ornamen masdes (gelombang, sparkle, maskot) di layar lomba.
- Kartu 14px dengan garis 1px. Kontrol 10px. Badge pill 20px.
- Biru = aksi atau "posisi saat ini". Hijau hanya untuk Accepted (dan status diterima). Merah hanya teks di atas tint `destructive-soft`.
- Geist Mono untuk sisa waktu, kode, angka skor, runtime, memori, kode soal. Angka tabel memakai tabular-nums.
- Animasi hanya fade singkat dan Spinner, hormati `prefers-reduced-motion`.
- Warna memakai token yang ada (`success`, `success-border`, `destructive-soft`, `secondary`, `warning`, `warning-border`, `muted-foreground`).

**Lebar layout**
- Ruang kerja soal (`/cp/problems/[id]`) selebar layar, gutter 16–24px.
- Layar lomba lain tetap kolom `max-w-6xl` (1152px).

**Penilaian (guidebook + keputusan dari kode)**
- Accepted = semua test lolos, tanpa nilai parsial, **+100**. Runtime dan memori masuk ke total tim.
- Yes – Solved: skor tidak bertambah. **Hanya runtime yang lebih cepat** yang mengganti catatan terbaik soal (runtime + memori).
- Jawaban bukan Accepted/Solved: **penalti dari pengaturan sesi** (bawaan −10). Compile Error ikut dipotong atau tidak diatur per sesi.
  Angka di teks UI selalu diisi dari pengaturan, jangan ditulis tetap.
- Galat sistem penilai (respons juri lain): tidak mengurangi skor, tidak dihitung salah.
- Runtime satu submission = **test terlama**. Memori satu submission = **test paling boros**.
  Total runtime tim = jumlah runtime terbaik tiap soal Accepted. Total memori dihitung dengan cara yang sama.
- Peringkat: skor tertinggi → total runtime tercepat → total memori terkecil. Skor bisa negatif.
- Batas waktu dan memori ditampilkan **per soal** (sesuai sistem). Guidebook bab 11 menyebut batas bisa beda per test; ini masih dikonfirmasi ke juri.

**Waktu**
- Tidak ada jam dinding di bar lomba. Yang ada hanya hitung mundur "Sisa waktu".
- Sisa waktu dihitung dari waktu selesai di server dan jam server (selisih jam perangkat dikoreksi saat halaman dimuat). Batas resmi tetap jam server.
- Tooltip di sisa waktu (ID/EN):
  - "Mengikuti jam server panitia. Selesai pukul {jam} WIB."
  - "Synced with the committee's server clock. Ends at {time} WIB."
  - Saat dijeda: "Waktu berhenti selama jeda." / "The clock is stopped while paused."
- Saat dijeda, hitung mundur berhenti dan labelnya "Sisa waktu (dibekukan)". Setelah lanjut, waktu selesai bergeser otomatis.
- Submit yang **diterima server sebelum** waktu habis tetap dinilai dan dihitung, walau hasilnya keluar setelah 00:00:00.
- Submit yang **tiba setelah** waktu habis ditolak dan tidak dinilai. Ini tetap bisa terjadi di detik terakhir karena jaringan.

**Alur lomba (fakta sistem)**
- Run = test contoh saja, tidak dinilai, tidak dicatat. Submit = semua test, dinilai.
- Jeda submit 15 detik per tim. Tidak berlaku setelah "penilai sibuk".
- Penilai sibuk muncul setelah 90 detik: submission tidak tercatat, skor tidak berubah.
- Papan peringkat ditutup untuk peserta 1 jam sebelum selesai, menampilkan posisi saat ditutup. Hasil akhir diumumkan saat penutupan.
- Jeda oleh admin: soal disembunyikan, peserta dipindah ke ruang tunggu, waktu berhenti.
- Update live bisa telat beberapa detik. Jangan ada UI yang bergantung pada update instan.

---

## 2. Papan per layar

Semua papan ada di halaman **Lomba CP (redesign)** (Figma: "Lomba CP (v89)"). Papan lama 13–18 ada di halaman arsip. Jangan dipakai lagi.

| Layar / route | Papan | Isi |
|---|---|---|
| 1 Ruang kerja `/cp/problems/[id]` | `cp-01-ruang-kerja-1440` | Normal, hasil Submit Yes – Accepted |
| | `cp-01-ruang-kerja-1280` | Sedang dinilai + jeda submit + peringatan baru kembali ke halaman |
| | `cp-01-ruang-kerja-1024` | Tab Riwayat + papan peringkat ditutup; panel tetap berdampingan |
| | `cp-01-ruang-kerja-390-soal` / `-kode` / `-hasil` | HP: tab Soal \| Kode \| Hasil, target sentuh 44px |
| | `cp-01-state-khusus` | Variasi bar lomba, Tooltip sisa waktu, AlertDialog Reset kode, 4 varian pemberitahuan keluar halaman, layar memuat / error / waktu habis / waktu habis tapi masih dinilai / didiskualifikasi |
| 2 Panel hasil | `cp-02-panel-hasil` | Peta warna verdict, 4 state tombol Run/Submit, 18 state panel hasil, tabel riwayat |
| | `cp-docs-teks-komponen` | Teks ID/EN, komponen per bagian, keputusan layar 1–2 |
| 3 Daftar soal `/cp` | `cp-03-daftar-soal-1440` | Ringkasan tim (skor, total runtime, total memori, peringkat) + tabel soal |
| | `cp-03-daftar-soal-1440-ditutup` | Skor negatif + peringkat "Ditutup" (posisi saat ditutup) |
| | `cp-03-daftar-soal-390` | HP |
| | `cp-03-state` | Memuat, kosong, error |
| 4 Ruang tunggu `/cp/waiting` | `cp-04-ruang-tunggu-1440` / `-390` | Penyisihan belum dimulai: hitung mundur, info sesi, checklist dari guidebook, tombol Buka guidebook |
| | `cp-04-ruang-tunggu-final-1440` / `-390` | Final: Offline · Lab Komputer Lt 3, 4 jam, 10 soal, perangkat dari panitia; checklist tanpa Zoom |
| | `cp-04-ruang-tunggu-1440-jeda` | Lomba dijeda, sisa waktu dibekukan |
| | `cp-04-state` | Belum dijadwalkan, selesai, Final dijeda |
| 5 Papan peringkat `/cp/leaderboard` | `cp-05-papan-1440` | Live |
| | `cp-05-papan-1440-hasil` | Hasil akhir penyisihan + garis batas 15 tim lolos final |
| | `cp-05-papan-390` | HP: daftar kartu + bar "Posisi tim kamu" yang menempel di bawah |
| | `cp-05-papan-1920` → `/admin/cp/display` | Layar besar final 1920×1080, tanpa navigasi |
| | `cp-05-state` | Ditutup 1 jam terakhir, layar besar dibekukan, legenda sel |
| 6 Hasil penyisihan `/cp/result` | `cp-06-lolos-final-1440` / `-390` | Undangan final: TM, jadwal, tempat, format, dresscode |
| | `cp-06-tidak-lolos-1440` | Pesan sopan + ringkasan tim |
| | `cp-06-diskualifikasi-1440` | Status, alasan, kontak CP |
| | `cp-docs-3-6` | Teks ID/EN, komponen, pertanyaan layar 3–6 |
| Komponen | `ds-header-akun-menu` (halaman Design system) | Header situs saat login, dengan menu akun terbuka |

Contoh data di papan (nama tim, sekolah "SMA Contoh n", angka) semuanya fiktif. `[JAM MULAI]`, `[JAM]`, `[LINK GUIDEBOOK]`, dan `[ALASAN DARI PANITIA]` adalah placeholder.

---

## 3. Komponen app baru

Semua komponen di bawah adalah **komposisi** primitive shadcn, bukan primitive baru. Jangan mengubah warna atau bentuk primitive-nya.

### ContestBar
Bar atas di semua layar lomba (1, 3, 4, 5), mengganti header situs supaya editor dapat tinggi maksimal.
- **Isi:** logo · "{Sesi} · Competitive Programming" + nama tim · Badge status · navigasi (Soal, Papan peringkat) · blok sisa waktu (Geist Mono 28px) · tombol bahasa.
- **Status (Badge):**

  | Status | Gaya |
  |---|---|
  | Berlangsung | outline + titik lime |
  | Dijeda | secondary |
  | Waktu habis | secondary; timer jadi slate |
  | Didiskualifikasi | destructive tint |
  | Belum dimulai / Belum dijadwalkan | outline |

- **Papan ditutup:** di jam terakhir, link Papan peringkat diberi Badge secondary "Ditutup" + ikon gembok.
- **Label waktu:**

  | Kondisi | Label |
  |---|---|
  | Berjalan | "Sisa waktu" |
  | Dijeda | "Sisa waktu (dibekukan)" |
  | Ruang tunggu | "Mulai dalam" |
  | Belum dijadwalkan | "Jadwal mulai" |

- Tooltip sisa waktu memakai teks di bagian 1.
- **Ruang tunggu:** navigasi Soal disembunyikan.
- **Lebar ≤1024:** "Competitive Programming" disingkat "CP", dan "Papan peringkat" jadi "Peringkat".
- **HP (390):** dua baris.
  - Baris 1: sesi + tim, sisa waktu di kanan.
  - Baris 2: status, Peringkat (atau Soal saat di papan), tombol bahasa. Semua target 44px.
- **Primitive:** Badge, Button (secondary untuk halaman aktif, ghost untuk lainnya), Tooltip, DropdownMenu (bahasa).

### ProblemSwitcher
Baris huruf soal (A, B, C …) di bawah ContestBar pada ruang kerja.
- **Tombol per soal:** Button outline sm; di HP ukuran 44×44.
  - Soal aktif: border + teks primary, `aria-current="page"`.
- **Penanda status:**

  | Status | Penanda |
  |---|---|
  | Accepted | ikon centang hijau |
  | Belum Accepted | "×n" merah (jumlah salah) |
  | Belum dicoba | tanpa penanda |

- `aria-label` per tombol, misalnya "Soal C, Accepted".
- Tooltip berisi judul soal. Di HP, ScrollArea horizontal.

### LeaveNotice
Satu slot di kanan baris ProblemSwitcher (di HP, di atas konten), supaya editor tidak bergeser. **Tidak pernah dialog modal.**

| Varian | Isi | Gaya |
|---|---|---|
| Tetap | "Aktivitas keluar dari halaman lomba tercatat dan dapat dilihat panitia." | teks muted + ikon info |
| Baru kembali | "Kamu meninggalkan halaman lomba selama {n} detik ({mulai}–{selesai} WIB). Ini tercatat…" + tombol "Mengerti" | Alert, border warning |
| Layar penuh (opsional, menunggu keputusan panitia) | Ajakan masuk layar penuh | Alert biasa |
| Keluar layar penuh (opsional) | Peringatan keluar dari layar penuh | Alert, border warning |

Di ruang tunggu, pemberitahuan yang sama tampil sebagai Alert biasa.

### ResultPanel
Card dengan Tabs "Hasil" | "Riwayat submission {n}".

**Isi tab Hasil per state:**

| State | Isi |
|---|---|
| Kosong | Empty |
| Run · semua lolos / contoh gagal / gagal dikompilasi | Badge "Run · tidak dinilai", tanpa skor |
| Sedang dinilai | Timer berjalan + Skeleton baris test |
| Penilai sibuk (90 dtk) | Alert warning + tombol "Submit lagi" |
| Yes – Accepted | +100 |
| Yes – Solved · lebih cepat | ±0, catatan terbaik diperbarui |
| Yes – Solved · tidak lebih cepat | ±0, catatan terbaik tetap |
| No – Wrong Answer · test rahasia | Hanya nomor test |
| No – Wrong Answer · test contoh | Output diharapkan vs output kamu |
| No – Runtime Error | Exit code, tanpa isi test rahasia |
| No – Time Limit Exceeded | Batas waktu soal ditulis ulang |
| No – Compile Error | Pesan compiler (Geist Mono); varian ±0 kalau sesi tidak memotong CE |
| Galat sistem penilai | Gaya netral |
| Waktu habis · masih dinilai | Alert "Waktu habis" + panel sedang dinilai |
| Waktu habis · hasil keluar | Hasil normal + catatan "Dikirim sebelum waktu habis, tetap dihitung." |
| Ditolak · tiba setelah waktu habis | Badge "Tidak dinilai · waktu habis" + Alert |
| Waktu habis (Run/Submit ditutup) | Alert |
| Didiskualifikasi | Alert destructive |

**Bagian lain di panel:**
- Kepala panel: "Submit #n" + waktu WIB + bahasa, VerdictBadge, ScoreDelta.
- Ringkasan: "8/10 test lolos · Runtime (test terlama) · Memori (test terboros)".
- Tab Riwayat: Table dengan kolom #, Waktu (WIB), Bahasa, Verdict, Skor, Runtime terlama (dtk), Memori terboros (MB). Hanya Submit yang dicatat.

**Tombol Run/Submit:**

| State | Tampilan |
|---|---|
| Siap | Run outline, Submit primary |
| Mengirim | Spinner |
| Jeda 15 detik | Submit disabled "Submit · 0:12" + teks "Jeda submit 15 dtk" |
| Waktu habis / didiskualifikasi | Keduanya disabled; editor hanya baca |

**Reset kode:** satu label "Reset kode" di semua lebar, dengan AlertDialog: "Reset kode? Isi editor untuk soal {X} ({bahasa}) diganti kode awal dan tidak bisa dikembalikan." Tombol Batal + Reset kode (destructive).

### TestResultList
Daftar hasil per test case, komposisi dalam Card/Table.
- **Kolom:** Test (#n) · Contoh/Rahasia · Status (Lolos/Gagal, plus "· TLE"/"· RE") · Runtime (dtk) · Memori (MB).
- **Gagal:** baris berlatar `destructive-soft`.
- **Test contoh yang gagal:** boleh menampilkan Input / Output diharapkan / Output kamu (3 kolom; 1 kolom di HP).
- **Test rahasia:** hanya nomornya.
- Maksimal 10 test per soal.

### ScoreDelta
Angka perubahan skor, Geist Mono 600.

| Nilai | Warna |
|---|---|
| +100 | `success` |
| −{penalti} | `destructive` (nilai dari pengaturan sesi) |
| ±0 | `muted-foreground` |
| Run, sedang dinilai, ditolak | Tidak ditampilkan |

### VerdictBadge (diperluas)
Satu peta dipakai di panel hasil, riwayat, daftar soal, dan papan peringkat. Label verdict persis seperti guidebook dan tidak diterjemahkan.

| Verdict | Gaya Badge | Ikon |
|---|---|---|
| Yes – Accepted | default `bg-success text-success-foreground` (4,95:1) | circle-check |
| Yes – Solved | outline, border `success-border`, teks `success` (4,95:1) | circle-check |
| No – Wrong Answer / Runtime Error / Compile Error | destructive tint (5,14:1) | circle-x |
| No – Time Limit Exceeded | secondary | clock |
| Galat sistem penilai / respons juri lain | outline | info |
| Sedang dinilai | outline | Spinner |
| Run · tidak dinilai | outline | play |
| Tidak dinilai · waktu habis | outline | clock |

Di daftar soal, status tim per soal memakai Badge yang sama:

| Status | Badge |
|---|---|
| Accepted | default success |
| Salah n kali | destructive tint |
| Belum dicoba | outline + ikon lingkaran putus-putus |

### Sel soal di papan peringkat (LeaderboardProblemCell)

| Kondisi | Tampilan |
|---|---|
| Accepted | Kotak `bg-success` + centang. Kalau sebelumnya salah n kali, "×n" kecil di bawah centang. |
| Belum Accepted | Kotak `destructive-soft` dengan "×n" (jumlah salah) |
| Belum dicoba | "–" muted |

- Ukuran sel: 38×30 di 1440; 56×40 di layar besar; 30×24 di HP (tanpa ×n di bawah centang).
- `aria-label` per sel, misalnya "Accepted, 2 salah" / "belum Accepted, 3 salah" / "belum dicoba".
- Legenda tampil di bawah tabel.

**Papan peringkat (layar 5):**
- **Kolom:** # · Tim · Sekolah · Skor (bisa negatif, merah) · Total runtime (dtk) · Total memori (MB) · A…H (penyisihan) atau A…J (final).
- **"Tim kamu":** baris `accent` + garis kiri primary + Badge primary "Tim kamu". Di HP, bar "Posisi tim kamu" sticky di bawah.
- **Ditutup:** Alert dengan gembok, menampilkan posisi saat ditutup.
- **Hasil akhir penyisihan:** garis batas hijau setelah peringkat 15 ("Batas lolos final: 15 tim teratas").
- **Layar besar 1920×1080:**
  - Tanpa navigasi dan tanpa "Tim kamu".
  - Header 120px berisi logo, "Final · Competitive Programming", judul, status, sisa waktu 56px.
  - Teks tabel 20–22px, baris 52px, 15 tim muat tanpa scroll.
  - Saat jam terakhir: banner "Papan dibekukan".

---

## 4. Komponen situs yang berubah

**Header** (dipakai di layar 6 dan semua halaman saat login):
- Isi saat login: "ID · Dasbor · tombol menu ☰". Di HP, Dasbor pindah ke dalam menu.
- Nama akun **tidak** tampil di header.
- **Menu ☰ (DropdownMenu):**
  - Nama + peran (Peserta/Admin).
  - Dasbor (HP saja).
  - Profil.
  - Admin (hanya peran admin).
  - Pemisah, lalu Keluar (teks destructive).
- Contoh: papan `ds-header-akun-menu`.

**Footer** situs tidak berubah. Layar lomba (1, 3, 4, 5) tidak memakai header/footer situs; layar 6 memakai keduanya.

---

## 5. Konten dari guidebook (ruang tunggu dan layar 6)

- **Penyisihan** (Senin, 18 Januari 2027, online via Zoom, 2 jam, 8 soal, 1 perangkat per tim):
  - Kamera menyala dan tidak di-mute.
  - 2 kamera (webcam + kamera tangan dan layar).
  - Nama Zoom `[Nama TIM]_[Nama Peserta]_DeviceCam` / `_BodyCam`.
  - Share screen seluruh layar dan taskbar.
  - Twibbon ke LO di breakout room.
  - Registrasi ulang.
  - Tanpa internet, buku, sumber lain, atau bantuan pihak luar.
- **Final** (Jumat, 29 Januari 2027, offline, 4 jam, 10 soal):
  - Kumpul di Dian Auditorium (Main Building Lt 7), lalu ke Lab Komputer Lt 3.
  - Login dengan akun tim di perangkat dari panitia (1 per tim).
  - Anggota tidak boleh diganti tanpa persetujuan panitia.
  - Seragam sekolah.
  - TM Final Senin, 25 Januari 2027 (wajib 1 perwakilan).
- **Format jawaban:**
  - **C++ (GCC 9.2.0):** `int main()`, tanpa `getch()`, `system("pause")`, `strrev`, atau `fflush(stdin)`; konstanta besar pakai `LL`.
  - **Java (OpenJDK 13.0.1):** class `Main`, tanpa `package`; angka besar jangan dibaca dengan `nextInt()`.
  - **Python (3.8.1):** parse sendiri hasil `input()`.
- **Guidebook:** tombol "Buka guidebook" di ruang tunggu memakai tautan folder Google Drive yang sama dengan Home dan Dasbor.
- **Diskualifikasi:** sertakan kalimat "Keputusan panitia bersifat mutlak". Kontak: CP Competitive Programming · Jae · 0812-3262-6369 (`https://wa.me/6281232626369`).

---

## 6. Teks bilingual

Semua string ID/EN ada di dua papan dokumentasi (`cp-docs-teks-komponen` untuk layar 1–2, `cp-docs-3-6` untuk layar 3–6). Masukkan ke kamus `id` dan `en`.
- Label verdict tetap bahasa Inggris persis guidebook.
- Format angka: `id-ID` → "0,21 dtk" dan "18,4 MB"; `en-GB` → "0.21 s" dan "18.4 MB".

---

## 7. Pertanyaan yang masih terbuka

| Topik | Pertanyaan | Asumsi / status |
|---|---|---|
| Batas waktu & memori | Guidebook bab 11: batas bisa beda per kasus uji. Sistem menyimpan per soal. | Satu batas per soal, menunggu konfirmasi juri |
| Layar penuh | Wajib atau tidak? | Opsional, tidak memblokir apa pun |
| Peringkat saat papan ditutup | Di daftar soal, tampilkan posisi saat ditutup atau disembunyikan? | Tampil "Posisi saat ditutup: #n" |
| Seri di batas lolos final | Tim ke-15 dan ke-16 sama persis (skor, runtime, memori)? | Belum diatur guidebook; desain hanya menampilkan garis batas |
| Sesi final | Sesi final terpisah dan status lolos/tidak lolos per tim | Ditahan, menunggu koordinasi panitia |
| Jam | Jam mulai penyisihan, TM, dan final | Placeholder `[JAM MULAI]` / `[JAM]` |

Di luar cakupan putaran ini: layar Rally Games, admin, dan LO.
