"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MENU_PUBLIK } from "@/config/navigation";

/**
 * Navigasi.
 *
 * Desktop: bar atas biasa.
 * Ponsel: menu penuh saat tombol ditekan, PLUS bar bawah yang menempel
 * dengan empat tujuan. Bar bawah sengaja mengikuti kebiasaan tab WhatsApp
 * karena lebih mudah ditemukan dan tidak perlu dipelajari.
 *
 * Menu diambil dari `@/config/navigation` agar sama dengan footer dan
 *breadcrumb — satu perubahan cukup di satu tempat.
 */
const MENU = MENU_PUBLIK;

export function NavigasiAtas({
  nama,
  logo,
}: {
  nama: string;
  logo: { id: string; alt: string } | null;
}) {
  const pathname = usePathname();
  const [terbuka, setTerbuka] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-garis bg-putih/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/media/${logo.id}?w=120`}
              alt=""
              width={36}
              height={36}
              className="h-9 w-9 shrink-0 rounded-lg object-contain"
            />
          ) : (
            <span
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-hijau font-judul text-base text-white"
              aria-hidden="true"
            >
              {nama.charAt(0).toUpperCase()}
            </span>
          )}
          <span className="truncate font-judul text-[1.0625rem] leading-none font-bold">
            {nama}
          </span>
        </Link>

        <nav aria-label="Navigasi utama" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {MENU.map((m) => {
              const aktif = pathname === m.href;
              return (
                <li key={m.href}>
                  <Link
                    href={m.href}
                    aria-current={aktif ? "page" : undefined}
                    className={`block rounded-lg px-4 py-2.5 text-[0.9375rem] font-semibold transition-colors ${
                      aktif
                        ? "bg-hijau-muda text-hijau-tua"
                        : "text-tinta-2 hover:bg-garis hover:text-tinta"
                    }`}
                  >
                    {m.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <button
          type="button"
          onClick={() => setTerbuka((v) => !v)}
          aria-expanded={terbuka}
          aria-controls="menu-penuh"
          className="grid h-12 w-12 place-items-center rounded-lg border border-garis text-tinta md:hidden"
        >
          <span className="sr-only">{terbuka ? "Tutup menu" : "Buka menu"}</span>
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {terbuka ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>

      {terbuka && (
        <div id="menu-penuh" className="border-t border-garis bg-putih md:hidden">
          <nav aria-label="Navigasi lengkap" className="px-4 py-2">
            <ul>
              {MENU.map((m) => (
                <li key={m.href}>
                  <Link
                    href={m.href}
                    onClick={() => setTerbuka(false)}
                    className="flex min-h-14 items-center gap-3 border-b border-garis text-lg font-semibold"
                  >
                    <m.ikon className="h-6 w-6 text-hijau" aria-hidden="true" />
                    {m.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      )}
    </header>
  );
}

/**
 * Bar bawah yang menempel di layar ponsel.
 *
 * `aria-label` menjelaskan tujuannya agar pembaca layar tahu ini bukan
 * navigasi utama yang terduplikasi, melainkan pintasan.
 */
export function BarBawah() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Pintasan cepat"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-garis bg-putih md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid grid-cols-4">
        {MENU.map((m) => {
          const aktif = pathname === m.href;
          return (
            <li key={m.href}>
              <Link
                href={m.href}
                aria-current={aktif ? "page" : undefined}
                className={`flex min-h-16 flex-col items-center justify-center gap-1 text-xs font-semibold ${
                  aktif ? "text-hijau" : "text-tinta-3"
                }`}
              >
                <m.ikon className="h-6 w-6" aria-hidden="true" />
                {m.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
