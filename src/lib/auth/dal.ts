import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

/**
 * Data Access Layer untuk otorisasi admin.
 *
 * Semua Server Action dan Route Handler admin WAJIB memanggil
 * `requireAdmin()` lebih dulu. Pemeriksaan dilakukan di server, bukan
 * hanya di proxy, sesuai PRD.
 */

export type AdminUser = {
  id: string;
  email: string;
};

/** Baca sesi saat ini tanpa memaksa redirect. Untuk action & route handler. */
export const getSessionAdmin = cache(async (): Promise<AdminUser | null> => {
  const session = await auth();
  if (!session?.user?.id) return null;
  return { id: session.user.id, email: session.user.email ?? "" };
});

/**
 * Pastikan pemohon adalah admin.
 * Mengalihkan ke halaman login bila belum masuk.
 */
export const requireAdmin = cache(async (): Promise<AdminUser> => {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
});

/**
 * Versi yang melempar error (bukan redirect), untuk dipakai di dalam
 * Server Action dan Route Handler yang tidak boleh mengalihkan halaman.
 */
export async function assertAdmin(): Promise<AdminUser> {
  const admin = await getSessionAdmin();
  if (!admin) throw new Error("Akses ditolak: sesi admin tidak valid.");
  return admin;
}
