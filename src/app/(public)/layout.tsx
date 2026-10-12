import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { pengaturanSitus } from "@/lib/queries/settings";

/**
 * Layout seluruh halaman publik.
 *
 * Logo dibaca dari pengaturan CMS (sudah di-cache), lalu diteruskan ke
 * header dan footer. Warna tidak di sini: seluruh warna berasal dari
 * variabel CSS yang ditulis layout root ke dalam <head>.
 */
export default async function LayoutPublic({
  children,
}: {
  children: React.ReactNode;
}) {
  const pengaturan = await pengaturanSitus();

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Lewati navigasi: helps pengguna keyboard dan pembaca layar */}
      <a
        href="#konten-utama"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Lewati ke konten utama
      </a>

      <SiteHeader logoId={pengaturan.logoMediaId} />

      <main id="konten-utama" className="flex-1">
        {children}
      </main>

      <SiteFooter logoId={pengaturan.logoMediaId} />
    </div>
  );
}