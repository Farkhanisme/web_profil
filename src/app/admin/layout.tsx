import type { Metadata } from "next";

export const metadata: Metadata = {
  title: { default: "CMS", template: "%s | CMS" },
  robots: { index: false, follow: false },
};

/**
 * Layout terluar untuk /admin.
 *
 * `instant = false` karena seluruh area ini membaca sesi pada setiap
 * permintaan (bisa di-prerender), dan merupakan halaman kerja, bukan
 * konten publik yang butuh navigasi instan.
 */
export const instant = false;

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-dvh bg-muted/30">{children}</div>;
}
