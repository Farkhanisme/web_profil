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

## Prototype FE — Blok Warna Madrasah

Tiga halaman untuk dinilai: `/`, `/profil`, `/guru`.

```bash
npm run dev    # lalu buka http://localhost:3000
```

Audiens: anak kelas 6 yang akan bersekolah di sini, dan orang tua yang
mengambil keputusan serta browsanya WhatsApp dan Facebook.

| Bagian | Pekat | Muda | Teks |
| ------ | ----- | ---- | ---- |
| Profil, sejarah | hijau `#047857` | `#d1fae5` | `#065f46` |
| Program, metabah | jingga `#c2410c` | `#ffedd5` | `#7c2d12` |
| Guru, galeri | biru `#1e40af` | `#dbeafe` | `#1e3a8a` |
| Pendaftaran | kuning `#ca8a04` | `#fef9c3` | `#713f12` |

Tiga aturan warna (angka kontras ada di komentar `globals.css`):

1. Setiap bagian punya satu warna identitas, jadi orang tua mengenali
   bagian tanpa membaca, seperti gelembung berwarna di WhatsApp.
2. Warna tidak pernah dipakai untuk teks kecil di atas warna. Teks kecil
   selalu gelap di atas latar muda, atau putih di atas blok pekat.
3. Varian terang hanya untuk garis bawah, dekorasi, dan ikon.

Kuning pekat `#ca8a04` hanya 3,3:1 terhadap teks putih, jadi tidak boleh
menjadi latar teks. Blok pendaftaran karena itu memakai kuning muda dengan
teks coklat tua.

Empat aturan struktural untuk audiens ini:

1. Tombol WhatsApp mengambang ada di semua halaman, karena orang tua sering
   membuka satu halaman dari tautan WhatsApp tanpa lewat beranda.
2. Bar navigasi bawah di ponsel dengan empat tujuan, seperti tab WhatsApp.
3. Teks dasar 17px di layar kecil.
4. Target sentuh minimal 48px.

Font: **Outfit** untuk judul, **Plus Jakarta Sans** untuk teks.

Isi halaman masih contoh dan berada di `src/lib/contoh.ts`. Ganti dengan
`bacaProfil()` dan `bacaSitus()` begitu data sekolah asli tersedia.

## Struktur

```
db/migrations/       Migrasi SQL bernomor (dijalankan scripts/migrate.ts)
scripts/             Skrip operasional dan uji backend (migrate, seed, uji media)
src/app/             Halaman, Route Handler, Route metadata, dan Server Action
src/app/actions/     Server Action: albums, kontak, konten, messages, profil, settings, staff
src/app/globals.css  Token desain "Blok Warna Madrasah"
src/components/site/ Komponen FE: dasar, blok, kerangka, navigasi, wa
src/config/          site.ts (identitas & NAP), profil.ts (konten), navigation.ts
src/lib/             Klien DB, kueri bertipe, skema Zod, auth, rate limit, media, Telegram
src/types/           Deklarasi tipe untuk NextAuth
```

## Pemeriksaan sebelum rilis

```bash
npm run lint && npm run typecheck
npm run build
npm run cek:konten      # harus melaporkan "tidak ada placeholder"
npm run build:rilis     # gabungan cek konten ketat + build
```

Ukuran halaman, waktu respons, tautan rusak, dan kontras warna diukur
oleh `npm run qa` yang sudah dihapus bersama halaman FE. Buat ulang skrip itu,
atau pakai Lighthouse resmi setelah deploy, begitu FE lengkap.

## Catatan operasional

- **Gambar**: diunggah ke grup Telegram privat, lalu disajikan lewat
  `/media/[id]?w=480`. During development tanpa token bot, berkas disimpan di
  `.data/media`. Jalankan `npm run backup:media` secara berkala.
- **Warna tema**: disimpan di tabel `settings` dan ditulis ke `<head>` sebagai
  CSS variable oleh root layout, sehingga admin bisa mengganti warna tanpa
  deploy ulang dan tanpa kedipan warna.
- **Cache**: kueri database dibungkus `'use cache'` + `cacheTag()`. Server
  Action memakai `updateTag()` supaya admin langsung melihat perubahannya.
