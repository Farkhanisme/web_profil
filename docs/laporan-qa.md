# Laporan QA Pra-Rilis

Tanggal: 2026-10-12

Diukur terhadap build produksi (`npm run build` + `npm run start`).

## Performa

| Halaman | Status | Respons | HTML | Gambar | h1 | Tautan |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| / | 200 | 28 ms | 87 KB | 15 | 1 | 14 |
| /profil | 200 | 5 ms | 89 KB | 2 | 1 | 8 |
| /guru | 200 | 4 ms | 57 KB | 10 | 1 | 8 |
| /program | 200 | 4 ms | 51 KB | 6 | 1 | 12 |
| /program/program-1 | 200 | 4 ms | 47 KB | 3 | 1 | 8 |
| /ekstrakurikuler | 200 | 4 ms | 57 KB | 6 | 1 | 12 |
| /ekstrakurikuler/ekstrakurikuler-1 | 200 | 4 ms | 50 KB | 3 | 1 | 8 |
| /galeri | 200 | 4 ms | 46 KB | 3 | 1 | 9 |
| /galeri/kegiatan-sekolah | 200 | 4 ms | 57 KB | 8 | 1 | 8 |
| /kontak | 200 | 4 ms | 64 KB | 2 | 1 | 8 |
| /kebijakan-privasi | 200 | 3 ms | 46 KB | 2 | 1 | 8 |
| /llms.txt | 200 | 3 ms | 2 KB | 0 | 0 | 0 |
| /llms-full.txt | 200 | 2 ms | 3 KB | 0 | 0 | 0 |
| /sitemap.xml | 200 | 4 ms | 3 KB | 0 | 0 | 0 |
| /robots.txt | 200 | 3 ms | 0 KB | 0 | 0 | 0 |
| /halaman-yang-tidak-ada | 404 | 3 ms | 18 KB | 0 | 1 | 7 |

Aset dimuat beranda: 11 berkas, 690 KB mentah, 203 KB setelah gzip.
Total JavaScript dan CSS setelah gzip adalah angka yang paling mendekati beban yang benar-benar diterima perangkat.
Sebagian besar beban berasal dari React dan Next.js sendiri, bukan dari kode proyek ini.
Rata-rata HTML: 42 KB.

## Aksesibilitas

- [x] lang=id
- [x] charset utf-8
- [x] viewport responsif
- [x] skip link ada
- [x] h1 tepat satu
- [x] heading tidak melompat
- [x] breadcrumb ada di halaman dalam
- [x] peta lazy
- [x] form punya label
- [x] honeypot ada
- [x] warna tema di head

## Warna

- Warna utama: `#047857`
- Kontras terhadap teks putih: 5.48:1 (minimal 4.5:1)

## Tautan

- 17 tautan internal diperiksa, 0 rusak.

## Temuan

Tidak ada temuan yang perlu diperbaiki.

## Catatan

- Tidak ada catatan.

## Yang belum diuji

- Lighthouse (Performance, Accessibility, Best Practices, SEO): membutuhkan Chrome. Jalankan manual setelah deploy dengan `npx lighthouse https://domain --preset=desktop --only-categories=performance`.
- Tampilan nyata di perangkat: buka langsung di ponsel dan periksa lebar 360 px.
- Unggah gambar dari ponsel: buka `/admin`, unggah foto dari galeri HP.

## Pengecualian yang tercatat

- Lighthouse tidak dapat dijalankan di lingkungan build ini karena Chrome tidak tersedia. Target Lighthouse PRD (Performance > 90, LCP < 2,5 detik, CLS < 0,1, INP < 200 ms) belum diukur dan wajib diperiksa setelah deploy.
- Konten masih berupa draf. Jalankan `npm run cek:konten` sebelum rilis.
