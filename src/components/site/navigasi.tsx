"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { MENU_PUBLIK } from "@/config/navigation";
import { LogoSitus, NamaSitus } from "@/components/site/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Navigasi utama.
 *
 * Mobile first: di layar sempit berupa panel yang slid dari atas,
 * di layar lebar menjadi baris menu horizontal. Menu memakai tombol
 * biasa, bukan dari pustaka animasi, agar ringan.
 */
export function NavigasiSitus({ logoId }: { logoId: string | null }) {
  const pathname = usePathname();
  const [buka, setBuka] = useState(false);

  // Kunci pergeseran halaman ketika menu terbuka.
  useEffect(() => {
    if (!buka) return;
    const gayaAwal = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = gayaAwal;
    };
  }, [buka]);

  // Escape menutup menu.
  useEffect(() => {
    if (!buka) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setBuka(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [buka]);

  const aktifUntuk = (href: string): boolean =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      {/* Bilah navigasi */}
      <div className="flex items-center gap-2">
        <Link
          href="/"
          onClick={() => setBuka(false)}
          className="flex min-w-0 items-center gap-2.5"
          aria-label="Beranda"
        >
          <LogoSitus mediaId={logoId} ukuran={36} className="sm:hidden" />
          <NamaSitus tampilkanSlogan className="sm:hidden" />
          <LogoSitus mediaId={logoId} ukuran={40} className="hidden sm:block" />
          <NamaSitus tampilkanSlogan className="hidden sm:block" />
        </Link>

        <nav aria-label="Navigasi utama" className="hidden lg:block">
          <ul className="flex items-center gap-0.5">
            {MENU_PUBLIK.map((item) => {
              const aktif = aktifUntuk(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={aktif ? "page" : undefined}
                    className={cn(
                      "relative rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      aktif
                        ? "text-primary"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {item.label}
                    {aktif ? (
                      <span
                        aria-hidden
                        className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-primary"
                      />
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:hidden">
          <Button
            asChild
            size="sm"
            className="hidden bg-primary hover:bg-primary-hover sm:inline-flex"
          >
            <Link href="/kontak">Hubungi Kami</Link>
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setBuka((v) => !v)}
            aria-expanded={buka}
            aria-controls="menu-seluler"
            aria-label={buka ? "Tutup menu" : "Buka menu"}
          >
            {buka ? <X className="size-5" aria-hidden /> : <Menu className="size-5" aria-hidden />}
          </Button>
        </div>
      </div>

      {/* Menu layar lebar: tombol aksi di kanan */}
      <div className="hidden lg:block">
        <Button asChild size="sm" className="bg-primary hover:bg-primary-hover">
          <Link href="/kontak">Hubungi Kami</Link>
        </Button>
      </div>

      {/* Panel menu seluler */}
      <div
        id="menu-seluler"
        hidden={!buka}
        className="absolute inset-x-0 top-full z-40 border-b bg-background shadow-sm lg:hidden"
      >
        <nav aria-label="Navigasi seluler" className="px-4 py-3">
          <ul className="space-y-0.5">
            {MENU_PUBLIK.map((item) => {
              const aktif = aktifUntuk(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setBuka(false)}
                    aria-current={aktif ? "page" : undefined}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium transition-colors",
                      aktif
                        ? "bg-primary-soft text-primary"
                        : "text-foreground hover:bg-muted",
                    )}
                  >
                    <item.ikon className="size-4 shrink-0 opacity-70" aria-hidden />
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <Button asChild className="mt-3 w-full bg-primary hover:bg-primary-hover">
            <Link href="/kontak" onClick={() => setBuka(false)}>
              Hubungi Kami
            </Link>
          </Button>
        </nav>
      </div>
    </>
  );
}