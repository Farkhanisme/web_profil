import "server-only";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { nowSeconds } from "@/lib/db/client";

/**
 * Pembatas laju berbasis tabel `rate_limits`.
 *
 * IP tidak pernah disimpan mentah: yang disimpan hanya HMAC-SHA256 dari IP
 * dengan `AUTH_SECRET` sebagai kunci. Hash ini stabil selama satu deploy,
 * cukup untuk membatasi percobaan, dan tidak bisa dibalik ke IP asli.
 */

export interface RateLimitResult {
  /** true bila permintaan masih di bawah batas */
  ok: boolean;
  /** jumlah permintaan dalam jendela berjalan */
  count: number;
  /** sisaKuota */
  remaining: number;
  /** detik sampai jendela berikutnya dimulai */
  retryAfter: number;
}

/** Hash stabil untuk alamat IP. Dipakai sebagai bagian dari kunci rate limit. */
export function hashIp(ip: string): string {
  const secret = process.env.AUTH_SECRET ?? "dev-secret";
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}

/**
 * Catat satu percobaan dan kembalikan statusnya.
 * Satu pertanyaan SQL yang atomik, sehingga permintaan paralel tetap aman.
 */
export async function consumeRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const now = nowSeconds();
  const batasJendela = now - windowSeconds;

  const hasil = await db.execute({
    sql: `
      INSERT INTO rate_limits (key, count, window_start)
      VALUES (?1, 1, ?2)
      ON CONFLICT(key) DO UPDATE SET
        count = CASE
          WHEN rate_limits.window_start <= ?3 THEN 1
          ELSE rate_limits.count + 1
        END,
        window_start = CASE
          WHEN rate_limits.window_start <= ?3 THEN ?2
          ELSE rate_limits.window_start
        END
      RETURNING count, window_start
    `,
    // ?1 kunci, ?2 epoch sekarang, ?3 ambang jendela Kadaluwarsa
    args: [key, now, batasJendela],
  });

  const baris = hasil.rows[0] as unknown as { count: number; window_start: number };
  const count = Number(baris.count);
  const sisaDetik = Math.max(0, baris.window_start + windowSeconds - now);

  return {
    ok: count <= limit,
    count,
    remaining: Math.max(0, limit - count),
    retryAfter: sisaDetik,
  };
}

/** Hapus penghitung untuk sebuah kunci. Dipanggil setelah login berhasil. */
export async function resetRateLimit(key: string): Promise<void> {
  await db.execute({ sql: "DELETE FROM rate_limits WHERE key = ?", args: [key] });
}

/**
 * Periksa status rate limit TANPA menambah penghitung.
 * Dipakai untuk menampilkan pesan "coba lagi dalam N menit" sebelum
 * pengguna semestinya.
 */
export async function peekRateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<RateLimitResult> {
  const hasil = await db.execute({
    sql: "SELECT count, window_start FROM rate_limits WHERE key = ?",
    args: [key],
  });

  const baris = hasil.rows[0] as unknown as
    | { count: number; window_start: number }
    | undefined;

  const now = nowSeconds();

  if (!baris || now - baris.window_start > windowSeconds) {
    return { ok: true, count: 0, remaining: limit, retryAfter: 0 };
  }

  const count = Number(baris.count);
  const sisaDetik = Math.max(0, baris.window_start + windowSeconds - now);

  return {
    ok: count < limit,
    count,
    remaining: Math.max(0, limit - count),
    retryAfter: sisaDetik,
  };
}

/** Bersihkan baris rate limit yang sudah lewat (> 1 hari). Dipanggil dari seed. */
export async function bersihkanRateLimit(): Promise<void> {
  await db.execute({
    sql: "DELETE FROM rate_limits WHERE window_start < ?",
    args: [nowSeconds() - 86_400],
  });
}

/**
 * Ambil alamat IP pengunjung dari header proxy Vercel.
 * Nilai dikembalikan apa adanya; pemanggil yang membangkitkan hash-nya.
 */
export async function ipPengunjung(): Promise<string> {
  const h = await headers();
  const xForwardedFor = h.get("x-forwarded-for");
  if (xForwardedFor) return xForwardedFor.split(",")[0]!.trim();
  return h.get("x-real-ip")?.trim() ?? "127.0.0.1";
}

/** Kunci rate limit siap pakai: "login:<hash-ip>" */
export async function kunciRateLimit(tujuan: string): Promise<string> {
  return `${tujuan}:${hashIp(await ipPengunjung())}`;
}
