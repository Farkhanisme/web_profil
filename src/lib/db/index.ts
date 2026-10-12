import "server-only";

import type { Client, InValue } from "@libsql/client";
import { createDb } from "./client";

/**
 * Klien database tunggal untuk seluruh aplikasi.
 *
 * Disimpan di globalThis supaya koneksi dipakai ulang saat HMR di dev
 * (kalau tidak, setiap hot reload menambah koneksi baru).
 */
const globalForDb = globalThis as unknown as { __mtsLibsql?: Client };

export const db: Client = (globalForDb.__mtsLibsql ??= createDb());

/** Bentuk baris sebelum dipetakan ke tipe domain. */
type RawRow = Record<string, unknown>;

/**
 * Jalankan SELECT dan kembalikan array objek biasa.
 *
 * Sengaja mengembalikan objek biasa (bukan `Row` milik libSQL) supaya
 * hasilnya aman disimpan di cache `'use cache'` tanpa objek khusus driver.
 */
export async function query<T>(
  sql: string,
  args: InValue[] = [],
): Promise<T[]> {
  const result = await db.execute({ sql, args });
  return result.rows as unknown as T[];
}

/** Sama seperti `query`, tapi hanya baris pertama atau `null`. */
export async function queryOne<T>(
  sql: string,
  args: InValue[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, args);
  return rows[0] ?? null;
}

/**
 * Jalankan INSERT/UPDATE/DELETE.
 *
 * `RETURNING` dipakai bila tersedia sehingga pemanggil langsung mendapat
 * baris yang tersimpan tanpa perlu query kedua.
 */
export async function execute<T = RawRow>(
  sql: string,
  args: InValue[] = [],
): Promise<T | null> {
  const result = await db.execute({ sql, args });
  if (result.rows.length > 0) return result.rows[0] as unknown as T;
  return null;
}

/** Jalankan beberapa statement dalam satu transaksi (atomic). */
export async function transaction<T>(
  statements: Array<[string, InValue[]?]>,
): Promise<void> {
  if (statements.length === 0) return;
  await db.batch(statements, "write");
}

export type { InValue };
