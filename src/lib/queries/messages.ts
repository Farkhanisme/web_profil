import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { query, queryOne } from "@/lib/db";
import type { MessageRow } from "@/lib/db/types";
import { messageToDTO, type ContactMessage } from "@/lib/db/types";
import { TAG } from "./cache-tags";

/**
 * Kueri pesan dari form kontak.
 *
 * Hanya dipakai CMS, sehingga tidak perlu di-cache untuk halaman publik,
 * tetapi tetap diberi tag supaya bisa dibatalkan setelah admin mengubah
 * status baca.
 */

export interface HalamanPesan {
  pesan: ContactMessage[];
  total: number;
  belumDibaca: number;
  halaman: number;
  totalHalaman: number;
}

export const PESAN_PER_HALAMAN = 20;

export async function daftarPesan(
  halaman = 1,
): Promise<HalamanPesan> {
  "use cache";
  cacheTag(TAG.messages);
  cacheLife("max");

  const ke = Math.max(1, Math.floor(halaman));

  const [baris, totalRow, belumRow] = await Promise.all([
    query<MessageRow>(
      `SELECT * FROM messages ORDER BY created_at DESC LIMIT ?1 OFFSET ?2`,
      [PESAN_PER_HALAMAN, (ke - 1) * PESAN_PER_HALAMAN],
    ),
    queryOne<{ c: number }>("SELECT count(*) AS c FROM messages"),
    queryOne<{ c: number }>(
      "SELECT count(*) AS c FROM messages WHERE is_read = 0",
    ),
  ]);

  const total = Number(totalRow?.c ?? 0);

  return {
    pesan: baris.map(messageToDTO),
    total,
    belumDibaca: Number(belumRow?.c ?? 0),
    halaman: ke,
    totalHalaman: Math.max(1, Math.ceil(total / PESAN_PER_HALAMAN)),
  };
}

export async function pesanBelumDibaca(): Promise<number> {
  "use cache";
  cacheTag(TAG.messages);
  cacheLife("max");

  const r = await queryOne<{ c: number }>(
    "SELECT count(*) AS c FROM messages WHERE is_read = 0",
  );
  return Number(r?.c ?? 0);
}