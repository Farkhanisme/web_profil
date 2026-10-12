-- =============================================================================
-- Migrasi 0001 — skema awal
-- Konvensi:
--   * id bertipe TEXT (nanoid)
--   * waktu disimpan sebagai epoch detik (INTEGER)
--   * boolean disimpan sebagai INTEGER 0/1
-- =============================================================================

-- ---------------------------------------------------------------------------
-- admins — satu baris, dibuat lewat `npm run seed:admin`
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  created_at    INTEGER NOT NULL
);

-- ---------------------------------------------------------------------------
-- media — satu baris per gambar, tidak pernah ditimpa.
-- Setiap unggahan baru selalu mendapat id baru agar cache CDN tidak basi.
--
-- Catatan penyimpanan:
--   tg_file_id NULL  -> berkas disimpan lokal (mode pengembangan)
--   tg_file_id isi   -> berkas ada di grup Telegram (mode produksi)
-- Token bot tidak pernah disimpan di sini.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS media (
  id                TEXT PRIMARY KEY,
  tg_file_id        TEXT,
  tg_file_unique_id TEXT,
  tg_message_id     INTEGER,
  mime              TEXT NOT NULL DEFAULT 'image/webp',
  width             INTEGER NOT NULL,
  height            INTEGER NOT NULL,
  bytes             INTEGER NOT NULL,
  alt               TEXT NOT NULL DEFAULT '',
  created_at        INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_media_created_at ON media (created_at DESC);

-- ---------------------------------------------------------------------------
-- settings — konfigurasi key/value.
-- Kunci: theme_primary, theme_accent, logo_media_id, site_tagline
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO settings (key, value) VALUES ('theme_primary', '#047857');
INSERT OR IGNORE INTO settings (key, value) VALUES ('theme_accent', '#B45309');

-- ---------------------------------------------------------------------------
-- staff — guru dan staf. Hanya data yang aman dipublikasikan.
-- Tidak ada kolom NIP, nomor HP pribadi, atau alamat rumah.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS staff (
  id              TEXT PRIMARY KEY,
  name            TEXT NOT NULL,
  position        TEXT NOT NULL DEFAULT '',
  subject         TEXT NOT NULL DEFAULT '',
  photo_media_id  TEXT REFERENCES media (id) ON DELETE SET NULL,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  is_published    INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_staff_order ON staff (is_published, sort_order);

-- ---------------------------------------------------------------------------
-- programs — program sekolah
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS programs (
  id             TEXT PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  summary        TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  image_media_id TEXT REFERENCES media (id) ON DELETE SET NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_published   INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
  updated_at     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_programs_order ON programs (is_published, sort_order);

-- ---------------------------------------------------------------------------
-- extracurriculars — kegiatan ekstrakurikuler
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS extracurriculars (
  id             TEXT PRIMARY KEY,
  slug           TEXT NOT NULL UNIQUE,
  name           TEXT NOT NULL,
  summary        TEXT NOT NULL DEFAULT '',
  description    TEXT NOT NULL DEFAULT '',
  schedule       TEXT NOT NULL DEFAULT '',
  coach          TEXT NOT NULL DEFAULT '',
  image_media_id TEXT REFERENCES media (id) ON DELETE SET NULL,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  is_published   INTEGER NOT NULL DEFAULT 1 CHECK (is_published IN (0, 1)),
  updated_at     INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_extracurriculars_order
  ON extracurriculars (is_published, sort_order);

-- ---------------------------------------------------------------------------
-- albums — album galeri
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS albums (
  id              TEXT PRIMARY KEY,
  slug            TEXT NOT NULL UNIQUE,
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  cover_media_id  TEXT REFERENCES media (id) ON DELETE SET NULL,
  created_at      INTEGER NOT NULL,
  updated_at      INTEGER NOT NULL
);

-- ---------------------------------------------------------------------------
-- photos — foto di dalam album.
-- Menghapus album ikut menghapus photos (lihat scripts & action hapus album).
-- Baris media sengaja dibiarkan agar foto tidak hilang diam-diam.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS photos (
  id         TEXT PRIMARY KEY,
  album_id   TEXT NOT NULL REFERENCES albums (id) ON DELETE CASCADE,
  media_id   TEXT NOT NULL REFERENCES media (id) ON DELETE CASCADE,
  caption    TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_photos_album ON photos (album_id, sort_order);

-- ---------------------------------------------------------------------------
-- messages — pesan dari form kontak.
-- ip_hash menyimpan hash, bukan IP mentah.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS messages (
  id         TEXT PRIMARY KEY,
  name       TEXT NOT NULL,
  contact    TEXT NOT NULL,
  body       TEXT NOT NULL,
  is_read    INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0, 1)),
  ip_hash    TEXT NOT NULL DEFAULT '',
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages (is_read, created_at DESC);

-- ---------------------------------------------------------------------------
-- rate_limits — penghitung jendela untuk login dan form kontak.
-- key   : "<tujuan>:<hash>"  (hash IP, bukan IP mentah)
-- window_start : epoch detik awal jendela
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rate_limits (
  key          TEXT PRIMARY KEY,
  count        INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL
);
