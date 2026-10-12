/**
 * Memuat variabel lingkungan dari berkas `.env.local` untuk skrip Node.
 *
 * Next.js memuat `.env.local` secara otomatis, tetapi skrip yang dijalankan
 * lewat `tsx` tidak. Tanpa ini, `npm run migrate` tidak akan menemukan
 * `TURSO_DATABASE_URL` yang ditulis di `.env.local`.
 */

import { existsSync } from "node:fs";
import { join } from "node:path";

export function loadEnv(): void {
  for (const nama of [".env.local", ".env"]) {
    const berkas = join(process.cwd(), nama);
    if (existsSync(berkas)) {
      process.loadEnvFile(berkas);
      return;
    }
  }
}
