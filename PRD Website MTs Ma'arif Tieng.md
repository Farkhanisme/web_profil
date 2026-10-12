# PRD Website MTs Ma'arif Tieng

Oct 12, 2026 · @Farkhan

Website informasi MTs Ma'arif Tieng yang cepat, mudah ditemukan di Google dan mesin AI, dengan CMS sederhana untuk satu admin, dirilis dalam 2 hari.

## Ringkasan

Tujuan rilis: calon siswa, orang tua, dan masyarakat dapat menemukan informasi resmi MTs Ma'arif Tieng lewat Google maupun mesin AI, dalam 2 hari kerja.

- **Pengguna utama:** orang tua siswa baru, calon siswa baru, masyarakat umum.
- **Pengelola:** satu admin (kepala madrasah, staf TU, atau operator).
- **Prinsip:** sedikit fitur, SEO dan GEO sebagai prioritas, kode sederhana agar mudah dikerjakan dengan vibe coding.
- **Ukuran berhasil:** semua halaman P0 tayang di domain .sch.id; skor Lighthouse SEO dan Best Practices di atas 95; Performance di atas 90 pada perangkat seluler; halaman terindeks di Google Search Console; admin dapat mengubah data tanpa menyentuh kode.

## Ruang lingkup

Rilis 2 hari mencakup situs informasi, CMS data sekolah, dan SEO/GEO penuh. Berita/artikel dan PPDB online ditunda ke fase 2.

| Fitur | Prioritas | Catatan |
| --- | --- | --- |
| Beranda | P0 | Hero, sambutan, statistik, cuplikan galeri, ajakan kontak |
| Profil sekolah | P0 | Visi, misi, sejarah, struktur; ditulis di kode |
| Guru dan staf | P0 | CRUD lewat CMS |
| Program dan ekstrakurikuler | P0 | CRUD lewat CMS |
| Galeri foto | P0 | Album dan foto, upload lewat CMS |
| Kontak dan peta | P0 | Form kontak, peta Google Maps dari koordinat, notifikasi Telegram |
| CMS admin | P0 | Login Auth.js, CRUD, upload gambar WebP, pengaturan logo dan warna tema |
| SEO dan GEO | P0 | Metadata, JSON-LD, sitemap, robots, llms.txt, FAQ |
| Berita/artikel dan pengumuman | Fase 2 | Editor WYSIWYG Tiptap, draft, jadwal terbit |
| PPDB online | Fase 2 | Formulir, penyimpanan data, ekspor CSV, toggle buka/tutup |
| Multi-admin, audit log, pengaturan situs lanjutan | Fase 3 | Tidak dibutuhkan saat ini |

Desain dan skema dibuat agar fase 2 hanya menambah tabel dan halaman baru, tanpa mengubah fondasi.

## Keputusan teknis

Pakai Next.js 16 (App Router, TypeScript), karena menurut [kebijakan dukungan Next.js](https://nextjs.org/support-policy) versi ini berstatus Active LTS sejak 21 Oktober 2025, sedangkan Next.js 15 berakhir dukungannya pada 21 Oktober 2026. Jika saat inisiasi sudah ada major yang lebih baru, tetap pakai 16 sampai ia menjadi LTS yang matang.

| Area | Keputusan | Alasan |
| --- | --- | --- |
| Framework | Next.js 16, App Router, TypeScript strict | LTS aktif, SEO bawaan (Metadata API, sitemap, robots) |
| Rendering | Server Component + ISR, `revalidateTag` saat admin menyimpan | HTML statis cepat dan ramah crawler |
| Database | Turso (libSQL) lewat `@libsql/client`, SQL mentah | Tanpa ORM; migrasi berupa file `.sql` bernomor |
| Autentikasi | Auth.js, Credentials provider, sesi JWT, satu admin | Cukup untuk satu admin; hash `bcryptjs`, rate limit login |
| Gambar | Telegram Bot API (grup privat), kompres WebP, proxy `/media/[id]` | Sesuai keputusan awal; tanpa biaya penyimpanan |
| Kompresi | Di browser (canvas, WebP, maks 1600 px) + validasi dan thumbnail dengan `sharp` di server | Menghindari batas body 4,5 MB di Vercel |
| Hosting | Vercel Hobby, domain .sch.id | Sesuai keputusan; batasi durasi dan memori fungsi |
| Styling | Tailwind CSS, font lewat `next/font` | Cepat dibuat dan cepat dimuat |
| Validasi | Zod di server untuk semua input | Mencegah data rusak dan injeksi |
| Bahasa | Indonesia saja (`lang="id"`) | Sesuai kebutuhan |

Catatan Hobby: paket ini ditujukan untuk penggunaan non-komersial dan memiliki batas fungsi yang lebih ketat, jadi proxy gambar harus mengandalkan cache CDN agar tidak memanggil Telegram di setiap kunjungan.

## Spesifikasi fitur publik

Semua halaman publik dirender di server, memakai HTML semantik, satu `h1` per halaman, gambar dengan `alt`, dan breadcrumb. Tiap fitur punya kriteria penerimaan (KP) yang bisa langsung dipakai sebagai prompt dan uji.

### 1. Beranda (`/`)

- Isi: hero (logo, nama, slogan, tombol "Hubungi Kami"), sambutan kepala madrasah, statistik (jumlah siswa, guru, ekstrakurikuler), cuplikan program, cuplikan galeri (6 foto terbaru), blok alamat dan peta singkat.
- Data statistik dan sambutan di file konfigurasi `site.ts`.
- KP: LCP di bawah 2,5 detik pada simulasi seluler; gambar hero memakai `priority`; JSON-LD `School` dan `WebSite` ada.

### 2. Profil sekolah (`/profil`)

- Bagian: identitas (NPSN, akreditasi, tahun berdiri, alamat), sejarah, visi, misi, struktur organisasi, fasilitas.
- Ditulis di kode (konten di file `profil.ts`), tanpa CMS.
- KP: fakta ringkas muncul di paragraf pembuka dan tabel identitas agar mudah dikutip mesin AI; ada FAQ 5 sampai 8 pertanyaan dengan JSON-LD `FAQPage`.

### 3. Guru dan staf (`/guru`)

- Kartu: foto, nama, jabatan, mata pelajaran; urut berdasarkan kolom `urutan`.
- Data dari tabel `staff`; hanya data yang aman dipublikasikan (tanpa NIP, nomor HP pribadi, atau alamat rumah).
- KP: foto tampil lewat `/media/[id]` berformat WebP dengan `width` dan `height` tetap; daftar kosong menampilkan pesan yang jelas.

### 4. Program dan ekstrakurikuler (`/program`, `/ekstrakurikuler`)

- Daftar kartu (nama, deskripsi singkat, gambar) dan halaman detail `/program/[slug]`, `/ekstrakurikuler/[slug]` (deskripsi, jadwal, pembina, foto).
- Data dari tabel `programs` dan `extracurriculars`.
- KP: slug unik dan ramah URL; tiap detail memiliki `title`, `description`, canonical, dan masuk sitemap.

### 5. Galeri foto (`/galeri`)

- Grid album; halaman `/galeri/[slug]` menampilkan foto dengan lightbox sederhana dan lazy loading.
- Data dari `albums` dan `photos`; thumbnail 480 px untuk grid, versi 1600 px untuk lightbox.
- KP: halaman memuat 24 foto pertama lalu "Muat lebih banyak"; tidak ada pergeseran tata letak (CLS di bawah 0,1).

### 6. Kontak dan peta (`/kontak`)

- Isi: alamat, telepon, email, jam layanan, peta Google Maps (iframe embed dari koordinat, `loading="lazy"`), tombol "Buka di Google Maps", dan form kontak.
- Form: nama, email atau HP, pesan; validasi Zod, honeypot, rate limit per IP (misalnya 5 pesan per jam); data disimpan di `messages` dan dikirim sebagai notifikasi ke grup Telegram admin.
- KP: pesan valid tersimpan dan notifikasi terkirim; pesan gagal terkirim ke Telegram tetap tersimpan di DB; JSON-LD memuat `geo` (koordinat), `address`, `telephone`, `openingHoursSpecification`.

### 7. Halaman pendukung

- `404` khusus, `/kebijakan-privasi` (singkat, karena ada form kontak), footer berisi NAP (nama, alamat, telepon) yang konsisten dengan seluruh situs.

## Spesifikasi CMS (`/admin`)

Satu admin, tanpa role. Semua rute `/admin/*` dan semua Server Action/route API tulis dilindungi sesi; pengecekan dilakukan di server, bukan hanya di middleware.

| Modul | Fungsi | Kriteria penerimaan |
| --- | --- | --- |
| Login (`/admin/login`) | Email + password, Auth.js Credentials, hash bcrypt, sesi JWT 7 hari | Salah password menampilkan pesan umum; maks 5 percobaan per 15 menit per IP; admin awal dibuat lewat skrip `seed` dengan variabel lingkungan |
| Dasbor (`/admin`) | Ringkasan jumlah guru, program, ekstrakurikuler, album, pesan baru | Pesan belum dibaca tampil di atas |
| Guru dan staf | Tambah, ubah, hapus, urutkan; foto opsional | Validasi Zod; hapus meminta konfirmasi; halaman publik ter-revalidate saat simpan |
| Program | CRUD: nama, slug otomatis, deskripsi, gambar | Slug unik; slug berubah tidak merusak halaman lain |
| Ekstrakurikuler | CRUD: nama, slug, deskripsi, jadwal, pembina, gambar | Sama seperti program |
| Galeri | Buat album, unggah banyak foto sekaligus (antrean, maks 20 per sesi), ubah keterangan, hapus, pilih sampul | Setiap foto dikompres ke WebP sebelum unggah; progres per file terlihat; kegagalan satu file tidak membatalkan yang lain |
| Pesan masuk | Daftar pesan form kontak, tandai dibaca, hapus | Pesan terbaru di atas; ada pagination |
| Pengaturan | Unggah logo (disimpan sebagai media, dipakai di header, footer, favicon, dan OG default) dan atur warna tema dengan pratinjau langsung | Format PNG/JPG/SVG masuk, hasil raster dikonversi WebP; Logo dan warna berubah di semua halaman publik setelah revalidate, tanpa deploy ulang; warna dengan kontras rendah ditolak |

### Komponen upload gambar

- Satu komponen `ImageUploader` dipakai semua modul.
- Langkah di browser: baca file, resize ke maksimal 1600 px sisi terpanjang, ekspor WebP kualitas 0,8 (thumbnail dibuat oleh proxy, bukan browser).
- Batas: file masukan maks 15 MB; hasil kompresi di bawah 1 MB (jika lebih, turunkan kualitas bertahap sampai 0,6).
- Server memeriksa tipe MIME dan ukuran, membuka ulang dengan `sharp` untuk memastikan benar-benar gambar, lalu mengirim ke Telegram (lihat bagian alur gambar).

### Pengaturan warna tema

Admin dapat mengubah warna situs dari menu Pengaturan tanpa menyentuh kode atau deploy ulang.

- **Yang bisa diatur:** warna utama (tombol, tautan, header) dan warna aksen (sorotan, label). Mode gelap tidak termasuk fase 1.
- **Pemilih warna:** input warna dan kolom kode hex, pratinjau langsung (header, tombol, kartu, tautan), tombol "Kembalikan ke bawaan", dan 4 sampai 5 preset palet agar admin non-teknis tidak salah pilih.
- **Penyimpanan:** dua baris di tabel `settings` dengan kunci `theme_primary` dan `theme_accent`; nilai hanya hex 6 digit, divalidasi dengan Zod.
- **Penerapan:** layout root membaca pengaturan di server (di-cache dengan tag `settings`, di-revalidate saat admin menyimpan) dan menulis variabel CSS `--color-primary` dan `--color-accent` ke `<head>`. Dengan begitu tidak ada kedipan warna saat halaman dimuat. Tailwind memakai variabel itu lewat `@theme`, sehingga seluruh komponen otomatis mengikuti.
- **Warna turunan:** warna hover, latar tipis, dan warna teks di atas warna utama (putih atau gelap) dihitung di server dari warna utama.
- **Aksesibilitas:** rasio kontras warna utama terhadap teks putih atau gelap harus minimal 4,5:1; jika tidak, simpan ditolak dengan pesan yang menyebut kontrasnya.
- **SEO:** meta `theme-color` ikut warna utama.
- **Kriteria penerimaan:** warna baru tampil di halaman publik dalam hitungan detik setelah simpan; hex tidak valid atau kontras rendah ditolak; tombol reset mengembalikan warna bawaan yang diambil dari logo.

### Keamanan CMS

- Semua input divalidasi Zod di server; teks disimpan apa adanya dan dirender dengan escape bawaan React.
- Cookie sesi `httpOnly`, `secure`, `sameSite=lax`; header keamanan (CSP dasar, `X-Content-Type-Options`, `Referrer-Policy`) di `next.config`.
- Token bot, rahasia Auth.js, dan kredensial Turso hanya di variabel lingkungan Vercel; tidak pernah dikirim ke klien.

## Alur gambar via Telegram

Gambar disimpan sebagai berkas (document) di satu grup Telegram privat lewat bot; database hanya menyimpan referensinya. Satu gambar = satu pesan Telegram (versi 1600 px WebP), dan thumbnail dibuat saat dibutuhkan lalu di-cache CDN.

### Alur unggah

1. Admin memilih file; browser meresize dan mengompres ke WebP.
2. Browser mengirim satu file per permintaan ke route `POST /api/admin/media` (satu file per request menjaga body di bawah batas Vercel).
3. Server memeriksa sesi, tipe MIME, ukuran, dan membuka ulang file dengan `sharp`.
4. Server memanggil `sendDocument` ke grup (chat ID dari variabel lingkungan), sebagai document agar Telegram tidak mengompres ulang.
5. Dari balasan Telegram, server menyimpan `file_id`, `file_unique_id`, `message_id`, ukuran, lebar, dan tinggi ke tabel `media`.
6. Server mengembalikan `media.id` ke formulir yang memakainya (guru, album, logo, dan lain-lain).

Bot dibatasi sekitar 20 pesan per menit ke satu grup, jadi antrean unggah berjalan berurutan dengan jeda dan menghormati `retry_after` saat Telegram membalas 429. Karena itu satu sesi unggah dibatasi 20 foto.

### Alur tampil

1. Halaman memakai `<img src="/media/{id}">` atau `/media/{id}?w=480` untuk thumbnail; lebar yang diizinkan hanya 240, 480, 800, 1600.
2. Route `GET /media/[id]` mencari `file_id`, memanggil `getFile`, lalu mengunduh berkas dari Telegram di server.
3. Untuk `w` tertentu, server meresize dengan `sharp`; respons dikirim dengan `Cache-Control: public, max-age=31536000, immutable` dan `Content-Type: image/webp`.
4. CDN Vercel menyimpan hasilnya, sehingga Telegram hanya dipanggil sekali per ukuran per gambar. Token bot tidak pernah muncul di HTML atau URL klien.
5. Setiap unggahan baru mendapat `id` baru (bukan menimpa), jadi cache tidak pernah basi.

### Batas dan cadangan

- Unduhan bot dari Telegram dibatasi 20 MB per file, jauh di atas ukuran hasil kompresi kita.
- Telegram bukan layanan hosting resmi: simpan grup dan bot di akun milik sekolah (bukan akun pribadi), dan tambahkan satu admin cadangan di grup.
- Cadangan: skrip `scripts/backup-media.ts` mengunduh semua media berdasarkan tabel `media` ke folder lokal; jalankan manual sebulan sekali dan sebelum perubahan besar. Ekspor CSV tabel `media` ikut disimpan.
- Jika gambar gagal diambil, route mengembalikan gambar placeholder dengan status 404 agar halaman tidak rusak.

## SEO dan GEO

SEO berarti mudah ditemukan di Google; GEO (Generative Engine Optimization) berarti mudah dipahami dan dikutip oleh ChatGPT, Gemini, Perplexity, dan mesin AI sejenis. Keduanya bertumpu pada hal yang sama: HTML yang bersih, fakta yang jelas, dan data terstruktur yang konsisten.

### SEO teknis

| Item | Spesifikasi |
| --- | --- |
| Metadata | `generateMetadata` per halaman: `title` unik (maks 60 karakter), `description` (140 sampai 160 karakter), canonical, Open Graph, Twitter card, `metadataBase` dari domain .sch.id |
| Gambar OG | Gambar default dari logo; halaman detail memakai gambar sendiri (1200x630) |
| `sitemap.ts` | Semua halaman statis dan dinamis (guru tidak per orang; program, ekstrakurikuler, album) dengan `lastModified` dari DB |
| `robots.ts` | Izinkan semua, larang `/admin` dan `/api`, tunjuk ke sitemap; izinkan crawler AI (GPTBot, Google-Extended, PerplexityBot, ClaudeBot) |
| Bahasa | `<html lang="id">`, locale `id_ID` |
| Performa | Server Component, `next/font`, gambar dengan dimensi tetap, `loading="lazy"` kecuali hero, tanpa skrip pihak ketiga selain peta |
| Tautan | URL bersih berbasis slug, breadcrumb, tautan internal antarhalaman, 404 dan redirect yang benar |
| Verifikasi | Meta verifikasi Google Search Console; kirim sitemap setelah rilis |

### Data terstruktur (JSON-LD)

- `School` (atau `EducationalOrganization`) di beranda dan kontak: nama, `alternateName`, alamat, `geo`, telepon, email, `openingHoursSpecification`, `logo`, `sameAs` (Google Maps, media sosial resmi), `identifier` (NPSN).
- `WebSite` di beranda.
- `BreadcrumbList` di semua halaman dalam.
- `FAQPage` di profil dan kontak.
- `ImageGallery`/`ImageObject` di galeri.
- `Person` ringan untuk kepala madrasah di profil (tanpa data pribadi sensitif).

### GEO

- **`/llms.txt`:** ringkasan situs dalam Markdown: nama, alamat, kontak, daftar halaman penting beserta satu kalimat penjelasan. Tambahkan `/llms-full.txt` berisi profil dan FAQ lengkap.
- **Paragraf jawaban langsung:** tiap halaman dibuka dengan 1 sampai 2 kalimat yang menjawab pertanyaan utama, misalnya "MTs Ma'arif Tieng adalah madrasah tsanawiyah swasta di \[kecamatan\], \[kabupaten\], \[provinsi\]" (isi diganti dengan data resmi dari sekolah).
- **Fakta eksplisit:** tabel identitas (nama resmi, NPSN, status, akreditasi, tahun berdiri, alamat lengkap, telepon, email) dan format tanggal dan angka yang konsisten.
- **FAQ berbentuk tanya-jawab** dengan kalimat lengkap, misalnya "Di mana lokasi MTs Ma'arif Tieng?", "Program apa saja yang tersedia?".
- **Konsistensi NAP** di semua halaman, JSON-LD, footer, dan profil eksternal.
- **Tanggal dan penulis jelas** pada konten yang berubah ("Diperbarui: ..." di halaman profil dan program).

### Di luar kode (sangat berdampak)

- Klaim dan lengkapi Google Business Profile (nama, alamat, jam, foto, tautan situs).
- Daftarkan situs di Google Search Console dan Bing Webmaster Tools.
- Samakan data di EMIS dan Dapodik, Facebook, dan YouTube sekolah; tautkan semuanya ke situs baru.
- Minta lembaga yang relevan (Kemenag daerah, LP Ma'arif NU, dinas) menautkan ke situs ini.

## Skema database (Turso/libSQL)

SQL mentah; migrasi disimpan di `db/migrations/0001_init.sql` dan seterusnya, dijalankan oleh `scripts/migrate.ts` yang mencatat versi di tabel `_migrations`. Semua `id` bertipe teks (nanoid), waktu disimpan sebagai epoch detik (`INTEGER`).

| Tabel | Kolom utama | Catatan |
| --- | --- | --- |
| `admins` | `id`, `email` (unik), `password_hash`, `created_at` | Satu baris; dibuat lewat skrip seed |
| `media` | `id`, `tg_file_id`, `tg_file_unique_id`, `tg_message_id`, `mime`, `width`, `height`, `bytes`, `alt`, `created_at` | Satu baris per gambar; tidak pernah ditimpa |
| `settings` | `key` (PK), `value` | Kunci awal: warna tema (theme\_primary, theme\_accent), serta `logo_media_id` |
| `staff` | `id`, `name`, `position`, `subject`, `photo_media_id`, `sort_order`, `is_published`, `created_at`, `updated_at` | Hanya data publik |
| `programs` | `id`, `slug` (unik), `name`, `summary`, `description`, `image_media_id`, `sort_order`, `is_published`, `updated_at` |  |
| `extracurriculars` | `id`, `slug` (unik), `name`, `summary`, `description`, `schedule`, `coach`, `image_media_id`, `sort_order`, `is_published`, `updated_at` |  |
| `albums` | `id`, `slug` (unik), `title`, `description`, `cover_media_id`, `created_at`, `updated_at` |  |
| `photos` | `id`, `album_id`, `media_id`, `caption`, `sort_order`, `created_at` | Indeks pada `album_id` |
| `messages` | `id`, `name`, `contact`, `body`, `is_read`, `ip_hash`, `created_at` | `ip_hash` untuk rate limit tanpa menyimpan IP mentah |
| `rate_limits` | `key`, `count`, `window_start` | Untuk login dan form kontak |

Aturan umum:

- Kunci asing diaktifkan (`PRAGMA foreign_keys = ON`); menghapus album ikut menghapus `photos`, sedangkan baris `media` dibiarkan (pembersihan manual).
- Fase 2 menambah tabel `posts` (berita/pengumuman) dan `applicants` (PPDB) tanpa mengubah tabel di atas.
- Konten profil sekolah dan statistik beranda tetap di kode pada fase 1.

## Non-fungsional dan risiko

### Target non-fungsional

- **Performa (seluler, Lighthouse):** Performance di atas 90, LCP di bawah 2,5 detik, CLS di bawah 0,1, INP di bawah 200 ms.
- **Aksesibilitas:** skor Lighthouse di atas 90; kontras warna cukup; semua gambar punya `alt`; navigasi bisa dengan keyboard.
- **Responsif:** nyaman dari lebar 360 px; menu seluler sederhana.
- **Privasi:** hanya data publik sekolah dan pesan kontak; IP disimpan sebagai hash; halaman kebijakan privasi singkat.
- **Pemeliharaan:** satu repositori, variabel lingkungan terdokumentasi di `README.md`, skrip `migrate`, `seed`, dan `backup-media`.

### Risiko dan mitigasi

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Tenggat 2 hari terlalu ketat | Fitur setengah jadi | Kerjakan sesuai urutan task; semua P0 harus tayang dulu, polesan belakangan |
| Konten dan foto sekolah belum siap | Situs kosong saat rilis | Siapkan data (lihat bagian terakhir) sejak Hari 1; gunakan placeholder yang jelas dan jadwalkan pengisian |
| Telegram bukan hosting resmi | Gambar bisa tidak terjangkau | Bot dan grup di akun sekolah, admin cadangan, backup bulanan, placeholder saat gagal |
| Batas Telegram (20 pesan/menit, 20 MB unduh) | Unggah massal lambat atau gagal | Antrean berurutan, `retry_after`, batas 20 foto per sesi |
| Batas fungsi dan body di Vercel Hobby | Unggah atau proxy gagal | Kompres di browser, satu file per request, cache CDN `immutable` |
| Cold start proxy gambar | Gambar pertama lambat | Cache CDN; thumbnail kecil; `priority` untuk gambar hero |
| Turso: koneksi dan latensi | Halaman lambat | ISR/cache sehingga jarang query; wilayah Turso dekat region Vercel |
| Brute force login | Akses admin | Rate limit, hash bcrypt, password kuat, email admin tidak diumbar |
| Kehilangan token bot | Gambar tak bisa diunggah atau ditampilkan | Simpan token di manajer sandi sekolah; rotasi via BotFather bila bocor |
| Vibe coding menghasilkan kode tidak konsisten | Bug dan celah keamanan | Prompt kecil dengan KP; jalankan `tsc`, `lint`, dan `build` setiap task selesai; tinjau kode auth, upload, dan proxy secara manual |

## Task pengerjaan (2 hari)

Setiap task dirancang sebagai satu prompt vibe coding dengan hasil yang bisa diuji. Setelah tiap task: jalankan `npm run lint`, `npx tsc --noEmit`, dan `npm run build`; commit kecil. Estimasi jam adalah perkiraan untuk satu orang dengan bantuan AI.

### Hari 1: fondasi, CMS, dan pipeline gambar (sekitar 10 jam)

- [ ] **T1 Inisiasi proyek (0,5 jam).** `create-next-app` Next.js 16, TypeScript, Tailwind, App Router, ESLint; atur `.env.example`, `site.ts` (nama, alamat, koordinat, telepon, domain), `README.md`. *Selesai bila* `npm run build` hijau dan `/` tampil.
- [ ] **T2 Database dan migrasi (1 jam).** Klien `@libsql/client`, `db/migrations/0001_init.sql` sesuai skema, `scripts/migrate.ts`, fungsi helper query bertipe. *Selesai bila* `npm run migrate` membuat semua tabel di Turso dan dapat dijalankan ulang tanpa error.
- [ ] **T3 Autentikasi admin (1,5 jam).** Auth.js Credentials, bcrypt, sesi JWT, halaman `/admin/login`, `scripts/seed-admin.ts`, pelindung `/admin/*`, rate limit login. *Selesai bila* tanpa login `/admin` mengalihkan ke login, login benar masuk, 6 kali salah memblokir sementara.
- [ ] **T4 Pipeline media Telegram (2 jam).** Buat bot dan grup privat, `lib/telegram.ts` (`sendDocument`, `getFile`, penanganan 429), `POST /api/admin/media`, `GET /media/[id]` dengan `sharp` (`w` 240/480/800/1600) dan header cache `immutable`, placeholder bila gagal. *Selesai bila* gambar terunggah, muncul lewat `/media/{id}`, respons kedua berasal dari cache, dan token bot tidak muncul di sumber halaman.
- [ ] **T5 Komponen `ImageUploader` (1 jam).** Resize 1600 px dan WebP 0,8 di browser, antrean berurutan, progres, batas 15 MB. *Selesai bila* foto 8 MB dari HP menjadi di bawah 1 MB dan terunggah tanpa melewati batas Vercel.
- [ ] **T6 Layout CMS dan modul guru/staf (1 jam).** Sidebar admin, daftar, form tambah/ubah/hapus, urutan, foto; Server Actions dengan Zod dan `revalidateTag`. *Selesai bila* perubahan terlihat di halaman publik setelah simpan.
- [ ] **T7 Modul program dan ekstrakurikuler (1 jam).** CRUD dengan slug otomatis dan unik. *Selesai bila* slug ganda ditolak dengan pesan jelas.
- [ ] **T8 Modul galeri (1 jam).** Album, unggah banyak foto, keterangan, sampul, hapus. *Selesai bila* 10 foto terunggah dalam satu sesi dan satu kegagalan tidak membatalkan sisanya.
- [ ] **T9 Pengaturan logo, warna tema, dan pesan masuk (1 jam).** Unggah logo ke `settings`, pemilih warna dengan pratinjau, preset, dan tombol reset (validasi hex dan kontras 4,5:1), daftar pesan, tandai dibaca. *Selesai bila* logo dan warna baru tampil di semua halaman publik setelah revalidate tanpa kedipan warna.

### Hari 2: halaman publik, SEO/GEO, rilis (sekitar 11,5 jam)

- [ ] **T10 Layout publik dan komponen dasar (1 jam).** Header dengan logo dan menu, footer berisi NAP, `Container`, `Breadcrumb`, `PageHeader`, tema warna yang dibaca dari pengaturan CMS lewat CSS variable di head (bawaan: warna dari logo). *Selesai bila* tampilan rapi di lebar 360 px dan 1280 px.
- [ ] **T11 Beranda (1 jam).** Hero, sambutan, statistik, cuplikan program dan galeri, blok kontak. *Selesai bila* LCP simulasi seluler di bawah 2,5 detik.
- [ ] **T12 Profil sekolah (1 jam).** Halaman `/profil` dari `profil.ts` dengan tabel identitas, visi, misi, sejarah, struktur, fasilitas, FAQ. *Selesai bila* semua data sekolah terisi (bukan placeholder).
- [ ] **T13 Guru dan staf, program, ekstrakurikuler (1,5 jam).** Daftar dan halaman detail dari DB. *Selesai bila* halaman kosong menampilkan pesan, dan detail dengan slug salah mengembalikan 404.
- [ ] **T14 Galeri publik (1 jam).** Grid album, halaman album, lightbox, lazy loading. *Selesai bila* CLS di bawah 0,1 dan thumbnail memakai `?w=480`.
- [ ] **T15 Kontak, peta, form (1,5 jam).** Alamat, iframe peta dari koordinat, tombol buka di Google Maps, form dengan Zod, honeypot, rate limit, simpan ke `messages`, notifikasi Telegram. *Selesai bila* pesan valid tersimpan dan terkirim ke grup, pesan spam (honeypot terisi) diabaikan.
- [ ] **T16 SEO teknis (1 jam).** `generateMetadata`, canonical, OG, `sitemap.ts`, `robots.ts`, gambar OG, halaman 404, header keamanan. *Selesai bila* `/sitemap.xml` dan `/robots.txt` benar dan tiap halaman memiliki `title` dan `description` unik.
- [ ] **T17 JSON-LD dan GEO (1 jam).** Komponen `JsonLd`, skema `School`, `WebSite`, `BreadcrumbList`, `FAQPage`, `ImageGallery`; `/llms.txt` dan `/llms-full.txt`. *Selesai bila* lolos uji Rich Results Test dan validator Schema.org tanpa error.
- [ ] **T18 Deploy ke Vercel (0,5 jam).** Hubungkan repo, isi variabel lingkungan, jalankan migrasi dan seed pada Turso produksi, pasang domain .sch.id, aktifkan HTTPS. *Selesai bila* situs dapat diakses di domain, admin dapat login dan mengunggah gambar di produksi.
- [ ] **T19 QA dan polesan (1 jam).** Lighthouse seluler untuk semua halaman, cek tautan rusak, uji unggah di HP, cek kontras dan `alt`. *Selesai bila* target non-fungsional terpenuhi atau pengecualiannya tercatat.
- [ ] **T20 Isi konten dan serah terima (1 jam).** Isi guru, program, ekstrakurikuler, galeri, logo; kirim sitemap ke Search Console; klaim Google Business Profile; tulis panduan admin satu halaman. *Selesai bila* tidak ada placeholder yang tersisa di halaman publik.

### Setelah rilis (fase 2)

- [ ] Berita/artikel dan pengumuman dengan editor Tiptap, draft, dan jadwal terbit (tabel `posts`).
- [ ] PPDB online: formulir, tabel `applicants`, ekspor CSV, toggle buka/tutup, notifikasi Telegram.
- [ ] Identitas visual final (font dan gaya komponen); multi-admin bila dibutuhkan.

## Data dan aset dari sekolah, serta pertanyaan terbuka

Kesiapan konten lebih sering menghambat daripada kode. Kumpulkan hal berikut paling lambat di akhir Hari 1.

| Kebutuhan | Dipakai untuk | Status |
| --- | --- | --- |
| Logo (PNG transparan atau SVG, resolusi tinggi) | Header, favicon, OG, JSON-LD | Sudah ada |
| Nama resmi, NPSN, status, akreditasi, tahun berdiri | Profil, JSON-LD, GEO | Perlu dikumpulkan |
| Alamat lengkap, koordinat Google Maps, telepon, email, jam layanan | Kontak, peta, JSON-LD, footer | Perlu dikumpulkan |
| Visi, misi, sejarah singkat, sambutan kepala madrasah | Profil, beranda | Perlu dikumpulkan |
| Struktur organisasi dan daftar fasilitas | Profil | Perlu dikumpulkan |
| Daftar guru dan staf (nama, jabatan, mapel, foto) | Halaman guru | Perlu dikumpulkan; pastikan ada izin menayangkan foto |
| Program dan ekstrakurikuler (nama, deskripsi, jadwal, pembina, foto) | Halaman program | Perlu dikumpulkan |
| 20 sampai 40 foto kegiatan dan gedung berkualitas baik | Galeri, beranda, hero | Perlu dikumpulkan; foto siswa perlu izin sekolah |
| Warna identitas | Tema | Belum siap; admin mengaturnya lewat CMS, awalnya memakai warna bawaan dari logo |
| Akun Telegram sekolah untuk bot dan grup | Penyimpanan gambar, notifikasi | Perlu dibuat dengan akun milik sekolah |
| Email admin dan password awal | Login CMS | Perlu diputuskan |
| Nama domain .sch.id | Produksi | Perlu diurus (pendaftaran .sch.id memerlukan verifikasi sekolah dan bisa memakan waktu) |

### Pertanyaan terbuka

- [ ] Domain .sch.id sudah terdaftar atau belum? Jika belum, rilis awal memakai subdomain `vercel.app` lalu dipindah.
- [ ] Apakah ada ketentuan sekolah atau Kemenag mengenai penayangan foto siswa dan guru?
- [ ] Siapa yang menyiapkan konten dan siapa yang meninjau sebelum tayang?
- [ ] Warna akan diambil dari logo untuk sementara, atau ada preferensi?
- [ ] Apakah email dan nomor telepon yang ditampilkan boleh dipublikasikan?
