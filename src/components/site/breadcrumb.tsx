import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { Container } from "@/components/site/container";
import { labelSegmen } from "@/config/navigation";
import { cn } from "@/lib/utils";

export interface ButirRemah {
  label: string;
  href: string;
}

export interface Remah {
  /** "Laman ini juga ditulis di breadcrumb." */
  nama: string;
  /** Segmen URL, dipakai untuk membuat tautan sebelumnya. */
  segmen?: string;
}

/**
 * Remah roti (breadcrumb).
 *
 * Satu komponen untuk dua sumber data:
 *   - halaman dalam (statis), lewat `nama` dan `segmen`
 *   - halaman detail (dinamis), lewat daftar `butir`
 *
 * Tampil sebagai navigasi dengan label "Remah roti".
 */
export function Breadcrumb({
  nama,
  segmen,
  butir,
  className,
}: {
  nama?: string;
  segmen?: string;
  butir?: ButirRemah[];
  className?: string;
}) {
  const daftar: ButirRemah[] = [];

  if (butir) {
    daftar.push(...butir);
  } else if (nama) {
    if (segmen) {
      daftar.push({ label: labelSegmen(segmen), href: `/${segmen}` });
    }
    daftar.push({ label: nama, href: "" });
  }

  if (daftar.length === 0) return null;

  return (
    <nav aria-label="Remah roti" className={cn("text-sm", className)}>
      <ol className="flex flex-wrap items-center gap-1 text-muted-foreground">
        <li>
          <Link
            href="/"
            className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
          >
            <Home className="size-3.5" aria-hidden />
            <span className="sr-only sm:not-sr-only">Beranda</span>
          </Link>
        </li>

        {daftar.map((item, index) => {
          const terakhir = index === daftar.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-1">
              <ChevronRight className="size-3.5 opacity-50" aria-hidden />
              {terakhir ? (
                <span aria-current="page" className="font-medium text-foreground">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="transition-colors hover:text-foreground"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Remah roti dengan wadah dan jarak, dipakai di atas judul halaman. */
export function BreadcrumbAtas(props: {
  nama?: string;
  segmen?: string;
  butir?: ButirRemah[];
}) {
  return (
    <Container>
      <div className="border-b bg-muted/30 py-3">
        <Breadcrumb {...props} />
      </div>
    </Container>
  );
}