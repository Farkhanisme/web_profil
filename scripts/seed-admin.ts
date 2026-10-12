/**
 * Membuat atau memperbarui akun admin tunggal.
 *
 * Cara pakai:
 *   ADMIN_EMAIL=... ADMIN_PASSWORD=... npm run seed:admin
 *
 * Nilai diambil dari variabel lingkungan sehingga kata sandi tidak pernah
 * tertulis di dalam berkas sumber.
 */

import { hash } from "bcryptjs";
import { createDb, nowSeconds, resolveDatabaseUrl } from "../src/lib/db/client";
import { newId } from "../src/lib/ids";
import { loadEnv } from "./load-env";

const KEKUATAN_MINIMAL = 10;

function validasiSandi(password: string): void {
  const masalah: string[] = [];
  if (password.length < KEKUATAN_MINIMAL) {
    masalah.push(`minimal ${KEKUATAN_MINIMAL} karakter`);
  }
  if (!/[a-z]/.test(password)) masalah.push("harus ada huruf kecil");
  if (!/[A-Z]/.test(password)) masalah.push("harus ada huruf besar");
  if (!/[0-9]/.test(password)) masalah.push("harus ada angka");

  if (masalah.length > 0) {
    console.error(`Kata sandi ditolak: ${masalah.join(", ")}.`);
    process.exit(1);
  }
}

async function main(): Promise<void> {
  loadEnv();

  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? "";

  if (!email || !email.includes("@")) {
    console.error("ADMIN_EMAIL belum diisi atau tidak valid.");
    process.exit(1);
  }
  if (!password) {
    console.error("ADMIN_PASSWORD belum diisi.");
    process.exit(1);
  }

  validasiSandi(password);

  const db = createDb(resolveDatabaseUrl());
  const passwordHash = await hash(password, 12);

  const ada = await db.execute({
    sql: "SELECT id FROM admins WHERE email = ?",
    args: [email],
  });

  if (ada.rows.length > 0) {
    await db.execute({
      sql: "UPDATE admins SET password_hash = ? WHERE email = ?",
      args: [passwordHash, email],
    });
    console.log(`Kata sandi diperbarui untuk ${email}`);
  } else {
    await db.execute({
      sql: "INSERT INTO admins (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)",
      args: [newId(), email, passwordHash, nowSeconds()],
    });
    console.log(`Akun admin dibuat: ${email}`);
  }

  // Bersihkan penghitung rate limit yang sudah basi.
  await db.execute({
    sql: "DELETE FROM rate_limits WHERE window_start < ?",
    args: [nowSeconds() - 86_400],
  });
}

main().catch((error) => {
  console.error("Seed admin gagal:", error);
  process.exit(1);
});
