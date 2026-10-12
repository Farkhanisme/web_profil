import { requireAdmin } from "@/lib/auth/dal";

/**
 * Layout area CMS. Wajib login.
 *
 * Pemeriksaan sesi dilakukan di sini (bukan hanya di proxy) sehingga
 * halaman tetap aman meskipun proxy dilewati atau gagal.
 */
export const instant = false;

export default async function CmsLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return <>{children}</>;
}
