import { createClient, type Client } from "@libsql/client";
import { mkdirSync } from "node:fs";
import { dirname } from "node:path";

/**
 * Pembuat klien libSQL.
 *
 * Sengaja TIDAK memakai `server-only` supaya skrip Node (scripts/migrate.ts,
 * scripts/seed-admin.ts, scripts/backup-media.ts) bisa memakainya juga.
 *
 * URL `file:./path.db` memakai driver SQLite bawaan dan cocok untuk
 * pengembangan tanpa akun Turso. URL `libsql://...` memakai Turso.
 */

export const DEFAULT_LOCAL_URL = "file:./.data/dev.db";

export function resolveDatabaseUrl(): string {
  const url = process.env.TURSO_DATABASE_URL?.trim();
  return url && url.length > 0 ? url : DEFAULT_LOCAL_URL;
}

/** Buat folder induk bila memakai database lokal, agar file tidak gagal dibuat. */
export function ensureLocalDir(url: string): void {
  if (!url.startsWith("file:")) return;
  const path = url.slice("file:".length);
  if (path === ":memory:" || path === "") return;
  mkdirSync(dirname(path), { recursive: true });
}

export function createDb(url: string = resolveDatabaseUrl()): Client {
  ensureLocalDir(url);
  const token = process.env.TURSO_AUTH_TOKEN?.trim();
  return createClient({ url, authToken: token ? token : undefined });
}

/** Ubah nilai integer 0/1 dari SQLite menjadi boolean TypeScript. */
export function toBool(value: unknown): boolean {
  return value === 1 || value === true || value === "1";
}

/** Epoch detik dari Date.now(). Dipakai seragam di seluruh aplikasi. */
export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}
