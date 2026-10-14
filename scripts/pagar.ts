/**
 * Abstraksi basis data untuk skrip uji.
 *
 * Latar belakang: skrip uji CRUD mengatur isi tabel agarwynya bisa
 * menguji urutan, slug, dan penghapusan. Dahulu skrip itu memakai
 * `DELETE FROM staff` dan sejenisnya, yang berarti menghapus seluruh isi
 * tabel — termasuk data sekolah yang sudah diisi pengelola lewat CMS.
 * Pada basis data pengembangan, seluruh isi staff, program,
 * ekstrakurikuler, album, dan foto hilang begitu satu skrip uji
 * dijalankan.
 *
 * Solusinya: simpan potret isi tabel sebelum skrip berjalan, lalu
 * pulihkan apa adanya setelah selesai — termasuk ketika skrip gagal di
 * tengah jalan.
 */

import type { Client, InValue } from "@libsql/client";

/** Cukup tipe minimum libSQL; tidak mengikat ke implementasi tertentu. */
export type KlienDb = Pick<Client, "execute">;

export interface Potret {
  tabel: string;
  kolom: string[];
  baris: Record<string, unknown>[];
}

/** Salin isi tabel ke memori. */
export async function potretkan(
  db: KlienDb,
  tabel: string[],
): Promise<Potret[]> {
  const hasil: Potret[] = [];

  for (const nama of tabel) {
    const hasilBaca = await db.execute({ sql: `SELECT * FROM ${nama}` });
    hasil.push({
      tabel: nama,
      kolom: hasilBaca.columns,
      baris: hasilBaca.rows as Record<string, unknown>[],
    });
  }

  return hasil;
}

/**
 * Kembalikan isi tabel persis seperti semula.
 *
 * Urutan penting dan sengaja berbeda antara dua langkah:
 *   - Pengosongan dibalik: tabel anak (photos) dikosongkan lebih dulu
 *     supaya induknya (albums) boleh dihapus tanpa melanggar kunci asing.
 *   - Pengisian ikut urutan aslinya: induk lebih dulu, baru anak.
 *     Kalau dibalik, `photos` akan ditolak karena album tujuannya belum
 *     ada.
 */
export async function pulihkan(db: KlienDb, potret: Potret[]): Promise<void> {
  for (const p of [...potret].reverse()) {
    await db.execute({ sql: `DELETE FROM ${p.tabel}` });
  }

  for (const p of potret) {
    if (p.baris.length === 0) continue;

    const kolom = p.kolom.join(", ");
    const tanda = p.kolom.map(() => "?").join(", ");
    for (const baris of p.baris) {
      await db.execute({
        sql: `INSERT INTO ${p.tabel} (${kolom}) VALUES (${tanda})`,
        args: p.kolom.map((k) => (baris[k] ?? null) as InValue),
      });
    }
  }
}

/**
 * Jalankan skrip uji di dalam pagar pengaman: isi tabel dikembalikan
 * ke kondisi semula apa pun hasilnya.
 */
export async function denganPagar<T>(
  db: KlienDb,
  tabel: string[],
  jalankan: () => Promise<T>,
): Promise<T> {
  const potret = await potretkan(db, tabel);
  try {
    return await jalankan();
  } finally {
    await pulihkan(db, potret);
  }
}