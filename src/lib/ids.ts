import { nanoid } from "nanoid";

/**
 * Pembuat id untuk seluruh tabel. Semua kolom `id` bertipe TEXT.
 * Nanoid 21 karakter URL-safe, cukup acak untuk dipakai sebagai id publik.
 */
export function newId(): string {
  return nanoid(21);
}
