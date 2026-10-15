-- =============================================================================
-- Migrasi 0002 — tabel profil_content
--
-- Tabel ini menyimpan isi profil & identitas yang diedit lewat CMS
-- (`/admin/profil`). Tabel serupa sudah ada di database pengembangan lokal,
-- tetapi belum pernah masuk ke 0001, sehingga database produksi yang dibuat
-- dari migrasi tidak memilikinya dan setiap halaman publik yang membaca
-- `bacaSitus()` / `bacaProfil()` langsung gagal.
--
-- Konvensi mengikuti 0001:
--   * waktu disimpan sebagai epoch detik (INTEGER)
--   * kolom yang isinya daftar disimpan sebagai teks JSON array
-- =============================================================================

-- ---------------------------------------------------------------------------
-- profil_content — TEPAT SATU baris (id = 1) untuk seluruh situs.
--
-- Kolom yang teksnya masih kosong di database akan jatuh ke nilai bawaan
-- di dalam repo (`src/config/site.ts`, `src/config/profil.ts`), jadi tidak
-- perlu disiapkan baris default: Server Action membuat baris ini saat
-- pengelola pertama kali menyimpan sesuatu (lihat `siapkanBaris()`).
--
-- Kolom ber-JSON (diakses lewat JSON.parse di queries/profil.ts):
--   sejarah, misi, struktur_organisasi, fasilitas, sambutan_teks, faq
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profil_content (
  id                  INTEGER PRIMARY KEY CHECK (id = 1),

  -- Identitas singkat situs
  name                TEXT    NOT NULL DEFAULT '',
  short_name          TEXT    NOT NULL DEFAULT '',
  legal_name          TEXT    NOT NULL DEFAULT '',
  tagline             TEXT    NOT NULL DEFAULT '',
  description         TEXT    NOT NULL DEFAULT '',

  -- Identitas resmi (NPSN, akreditasi, dsb.)
  identity_status     TEXT    NOT NULL DEFAULT '',
  npsn                TEXT    NOT NULL DEFAULT '',
  accreditation       TEXT    NOT NULL DEFAULT '',
  founded_year        INTEGER NOT NULL DEFAULT 0,
  curriculum          TEXT    NOT NULL DEFAULT '',
  founder             TEXT    NOT NULL DEFAULT '',

  -- Alamat, koordinat, dan kontak
  street              TEXT    NOT NULL DEFAULT '',
  village             TEXT    NOT NULL DEFAULT '',
  subdistrict         TEXT    NOT NULL DEFAULT '',
  city                TEXT    NOT NULL DEFAULT '',
  province            TEXT    NOT NULL DEFAULT '',
  postal_code         TEXT    NOT NULL DEFAULT '',
  geo_lat             REAL,
  geo_lng             REAL,
  phone               TEXT    NOT NULL DEFAULT '',
  email               TEXT    NOT NULL DEFAULT '',
  whatsapp            TEXT    NOT NULL DEFAULT '',

  -- Statistik beranda
  students            INTEGER NOT NULL DEFAULT 0,

  -- Isi halaman /profil
  ringkasan           TEXT    NOT NULL DEFAULT '',
  sejarah             TEXT    NOT NULL DEFAULT '[]',
  visi                TEXT    NOT NULL DEFAULT '',
  misi                TEXT    NOT NULL DEFAULT '[]',
  struktur_organisasi TEXT    NOT NULL DEFAULT '[]',
  fasilitas           TEXT    NOT NULL DEFAULT '[]',

  -- Sambutan kepala madrasah
  sambutan_nama       TEXT    NOT NULL DEFAULT '',
  sambutan_jabatan    TEXT    NOT NULL DEFAULT '',
  sambutan_teks       TEXT    NOT NULL DEFAULT '[]',

  -- FAQ halaman profil
  faq                 TEXT    NOT NULL DEFAULT '[]',

  updated_at          INTEGER NOT NULL DEFAULT 0
);
