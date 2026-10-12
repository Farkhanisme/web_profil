import { createHmac } from "node:crypto";

/**
 * Hash alamat IP.
 *
 * Terpisah dari lib/rate-limit karena dipakai juga oleh skrip uji yang
 * berjalan di luar Next.js, di mana modul `server-only` tidak boleh
 * diimpor.
 *
 * IP tidak pernah disimpan mentah: yang tersimpan hanya HMAC-SHA256
 * dengan AUTH_SECRET sebagai kunci. Hash ini stabil selama satu deploy,
 * cukup untuk membatasi percobaan, dan tidak bisa dibalik ke IP asli.
 */
export function hashIp(ip: string): string {
  const secret = process.env.AUTH_SECRET ?? "dev-secret";
  return createHmac("sha256", secret).update(ip).digest("hex").slice(0, 32);
}