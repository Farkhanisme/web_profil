import { Container } from "@/components/site/container";
import { NavigasiSitus } from "@/components/site/navigasi";
import { site, wilayahSingkat } from "@/config/site";

/**
 * Kepala situs.
 *
 * Logo dibaca dari pengaturan CMS. Warna tidak di sini: seluruh warna
 * datang dari variabel CSS yang ditulis layout root sebelum halaman
 * digambar.
 */
export function SiteHeader({ logoId }: { logoId: string | null }) {
  return (
    <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <Container>
        <div className="relative flex h-16 items-center justify-between gap-3">
          <NavigasiSitus logoId={logoId} />
        </div>
      </Container>

      {/* Baris identitas sekolah, disembunyikan di layar kecil agar menu tetap lega */}
      <div className="hidden border-t bg-muted/40 sm:block">
        <Container>
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-1.5 text-xs text-muted-foreground">
            <p className="truncate">
              {site.identity.status}
              {site.identity.foundedYear > 0
                ? ` - berdiri sejak ${site.identity.foundedYear}`
                : ""}
            </p>
            <p className="truncate">{wilayahSingkat()}</p>
          </div>
        </Container>
      </div>
    </header>
  );
}