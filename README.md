# Website MTs Ma'arif Tieng

Situs informasi resmi MTs Ma'arif Tieng: halaman publik yang cepat dan ramah
crawler, plus CMS sederhana untuk satu admin.

Rujukan kebutuhan: `PRD Website MTs Ma'arif Tieng.md`.

## Stack

| Area           | Teknologi                                            |
| -------------- | --------------------------------------------------- |
| Framework      | Next.js 16 (App Router, TypeScript strict, Turbopack) |
| Rendering      | React Server Component + Cache Components (PPR)      |
| Database       | Turso (libSQL) via `@libsql/client`, SQL mentah      |
| Auth           | Auth.js (NextAuth v5) Credentials + JWT              |
| Penyimpanan gambar | Telegram Bot API + proxy `/media/[id]` (sharp)   |
| Styling        | Tailwind CSS v4 (CSS-first) + shadcn/ui             |
| Validasi       | Zod di server untuk semua input                      |
| Hosting        | Vercel Hobby                                         |

## Menjalankan secara lokal

```bash
npm install
cp .env.example .env.local   # lalu isi ADMIN_EMAIL & ADMIN_PASSWORD
npm run migrate              # membuat skema tabel
npm run seed:admin           # membuat akun admin
npm run dev
```

Pengembangan lokal memakai **SQLite** (`.data/dev.db`) sehingga tidak perlu akun
Turso. Ganti `TURSO_DATABASE_URL` dan `TURSO_AUTH_TOKEN` untuk memakai Turso.

## Variabel lingkungan

| Nama                  | Wajib | Keterangan                                              |
| --------------------- | :---: | ------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL` | tidak | URL dasar situs (canonical/OG). Kosong = pakai URL Vercel |
| `TURSO_DATABASE_URL`  |  ya   | `file:./.data/dev.db` (dev) atau `libsql://...` (prod)  |
| `TURSO_AUTH_TOKEN`    |  prod | Token auth dari dashboard Turso                         |
| `AUTH_SECRET`         |  ya   | `openssl rand -base64 32`. Wajib diganti saat produksi |
| `ADMIN_EMAIL`         | tidak | Dipakai `npm run seed:admin`                            |
| `ADMIN_PASSWORD`      | tidak | Dipakai `npm run seed:admin`                            |
| `TELEGRAM_BOT_TOKEN`  | tidak | Kosong = memakai penyimpanan lokal sebagai pengganti      |
| `TELEGRAM_CHAT_ID`    | tidak | ID grup privat tempat bot menjadi admin                 |

## Skema database

Sepuluh tabel dibuat oleh `db/migrations/0001_init.sql`:

| Tabel              | Isi                                                        |
| ------------------ | ---------------------------------------------------------- |
| `admins`           | satu baris: email, `password_hash`, waktu dibuat            |
| `media`            | satu baris per gambar (referensi berkas di Telegram/lokal) |
| `settings`         | key/value: warna tema, `logo_media_id`                      |
| `staff`            | guru dan staf, hanya kolom yang aman dipublikasikan        |
| `programs`         | program sekolah, slug unik                                 |
| `extracurriculars` | kegiatan ekstrakurikuler, slug unik                        |
| `albums`           | album galeri                                               |
| `photos`           | foto di dalam album (ikut terhapus bila album dihapus)     |
| `messages`         | pesan form kontak, `ip_hash` bukan IP mentah               |
| `rate_limits`      | penghitung jendela untuk login dan form kontak             |

Konvensi: kolom `id` bertipe `TEXT` (nanoid), waktu epoch detik (`INTEGER`),
boolean `INTEGER` 0/1. Menambah tabel cukup dengan membuat berkas
`db/migrations/0002_....sql` lalu menjalankan `npm run migrate` — skrip
melewati migrasi yang sudah pernah diterapkan.

## Skrip

| Perintah                 | Fungsi                                              |
| ------------------------ | --------------------------------------------------- |
| `npm run dev`            | Server pengembangan                                  |
| `npm run build`          | Build produksi                                      |
| `npm run lint`           | ESLint                                              |
| `npm run typecheck`      | TypeScript tanpa emit                               |
| `npm run migrate`        | Menjalankan migrasi SQL yang belum dipakai           |
| `npm run seed:admin`     | Membuat atau memperbarui akun admin                 |
| `npm run backup:media`   | Mengunduh seluruh media ke folder lokal              |
| `npm run seed:demo`     | Mengisi data contoh agar situs bisa dinilai           |
| `npm run cek:konten`    | Daftar placeholder yang masih tersisa                |
| `npm run build:rilis`   | Cek konten ketat lalu build, gagal bila ada placeholder|
| `npm run qa`            | Mengukur halaman publik, menulis `docs/laporan-qa.md`  |

## Struktur

```
db/migrations/       Migrasi SQL bernomor (dijalankan scripts/migrate.ts)
scripts/             Skrip operasional (migrate, seed-admin, backup-media)
src/app/             Route App Router (publik, /admin, /api, /media)
src/components/      Komponen UI (ui/ = shadcn, sisanya komponen proyek)
src/config/          site.ts (identitas & NAP) dan profil.ts (konten profil)
src/lib/             Klien DB, kueri bertipe, utilitas warna, Telegram
```

## Pemeriksaan sebelum rilis

```bash
npm run lint && npm run typecheck
npm run build
npm run cek:konten      # harus melaporkan "tidak ada placeholder"
npm run qa              # menulis docs/laporan-qa.md
npm run build:rilis     # gabungan cek konten ketat + build
```

`npm run qa` mengukur ukuran halaman, waktu respons, tautan yang rusak,
teks alternatif gambar, struktur heading, dan kontras warna. Lighthouse
resmi tetap dijalankan manual setelah deploy karena membutuhkan Chrome.

## Catatan operasional

- **Gambar**: diunggah ke grup Telegram privat, lalu disajikan lewat
  `/media/[id]?w=480`. During development tanpa token bot, berkas disimpan di
  `.data/media`. Jalankan `npm run backup:media` secara berkala.
- **Warna tema**: disimpan di tabel `settings` dan ditulis ke `<head>` sebagai
  CSS variable oleh root layout, sehingga admin bisa mengganti warna tanpa
  deploy ulang dan tanpa kedipan warna.
- **Cache**: kueri database dibungkus `'use cache'` + `cacheTag()`. Server
  Action memakai `updateTag()` supaya admin langsung melihat perubahannya.
