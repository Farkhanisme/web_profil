import { requireAdmin } from "@/lib/auth/dal";
import { AdminShell } from "@/components/admin/admin-shell";

/**
 * Layout area CMS. Wajib login.
 *
 * Pemeriksaan sesi dilakukan di sini, bukan hanya di proxy, sehingga
 * halaman tetap aman meskipun proxy dilewati atau gagal.
 *
 * `instant = false` karena area ini membaca sesi pada setiap permintaan
 * dan merupakan halaman kerja, bukan konten publik yang butuh navigasi instan.
 */
export const instant = false;

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <AdminShell>{children}</AdminShell>;
}
