import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { query, queryOne } from "@/lib/db";
import type { MediaRow, StaffRow } from "@/lib/db/types";
import { staffToDTO, type Staff } from "@/lib/db/types";
import { TAG } from "./cache-tags";

/**
 * Kueri data untuk halaman publik dan CMS.
 *
 * Setiap fungsi dibungkus `'use cache'` + `cacheTag()` supaya:
 *   1. Hasilnya ikut masuk ke static shell dan dilayani dari CDN.
 *   2. Admin bisa membatalkan cache dari Server Action tanpa deploy ulang.
 *
 * Pembatalan cache dilakukan lewat `updateTag(TAG.xxx)` di Server Action.
 */

/** Baris hasil JOIN staff + media. */
interface BarisGabung extends StaffRow {
  m_id: string | null;
  m_file_id: string | null;
  m_mime: string | null;
  m_width: number | null;
  m_height: number | null;
  m_bytes: number | null;
  m_alt: string | null;
  m_created: number | null;
}

const KOLOM_STAFF = `
  s.id, s.name, s.position, s.subject, s.photo_media_id,
  s.sort_order, s.is_published, s.created_at, s.updated_at`;

/** Kolom media yang di-JOIN dengan alias m. */
const KOLOM_MEDIA = `
  m.id AS m_id, m.tg_file_id AS m_file_id, m.mime AS m_mime,
  m.width AS m_width, m.height AS m_height, m.bytes AS m_bytes,
  m.alt AS m_alt, m.created_at AS m_created`;

function mediaDari(b: BarisGabung): MediaRow | null {
  if (!b.m_id) return null;
  return {
    id: b.m_id,
    tg_file_id: b.m_file_id,
    tg_file_unique_id: null,
    tg_message_id: null,
    mime: b.m_mime ?? "image/webp",
    width: Number(b.m_width ?? 0),
    height: Number(b.m_height ?? 0),
    bytes: Number(b.m_bytes ?? 0),
    alt: b.m_alt ?? "",
    created_at: Number(b.m_created ?? 0),
  };
}

/** Guru/staf yang dipublikasikan, urut sesuai urutan yang diatur admin. */
export async function staffTerbit(): Promise<Staff[]> {
  "use cache";
  cacheTag(TAG.staff);
  cacheLife("max");

  const baris = await query<BarisGabung>(
    `SELECT ${KOLOM_STAFF}, ${KOLOM_MEDIA}
       FROM staff s
       LEFT JOIN media m ON m.id = s.photo_media_id
      WHERE s.is_published = 1
      ORDER BY s.sort_order ASC, s.name ASC`,
  );

  return baris.map((b) => staffToDTO(b, mediaDari(b)));
}

/** Semua guru/staf termasuk yang belum dipublikasikan (khusus CMS). */
export async function staffSemua(): Promise<Staff[]> {
  "use cache";
  cacheTag(TAG.staff);
  cacheLife("max");

  const baris = await query<BarisGabung>(
    `SELECT ${KOLOM_STAFF}, ${KOLOM_MEDIA}
       FROM staff s
       LEFT JOIN media m ON m.id = s.photo_media_id
      ORDER BY s.sort_order ASC, s.name ASC`,
  );

  return baris.map((b) => staffToDTO(b, mediaDari(b)));
}

/** Satu guru/staf untuk form ubah. Null bila id tidak ada. */
export async function staffSatu(id: string): Promise<Staff | null> {
  "use cache";
  cacheTag(TAG.staff);
  cacheLife("max");

  const baris = await queryOne<BarisGabung>(
    `SELECT ${KOLOM_STAFF}, ${KOLOM_MEDIA}
       FROM staff s
       LEFT JOIN media m ON m.id = s.photo_media_id
      WHERE s.id = ?`,
    [id],
  );

  return baris ? staffToDTO(baris, mediaDari(baris)) : null;
}

/** Jumlah total guru/staf (dipakai dasbor). */
export async function jumlahStaff(): Promise<number> {
  "use cache";
  cacheTag(TAG.staff);
  cacheLife("max");

  const baris = await queryOne<{ c: number }>("SELECT count(*) AS c FROM staff");
  return Number(baris?.c ?? 0);
}
