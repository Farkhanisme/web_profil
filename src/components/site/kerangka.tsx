import type { ReactNode } from "react";
import type { IsiSitus } from "@/lib/konten";
import { BarBawah, NavigasiAtas } from "./navigasi";
import { Footer } from "./blok";
import { TombolWa } from "./wa";

/**
 * Kerangka halaman publik: navigasi di atas, bar bawah dan tombol
 * WhatsApp di ponsel, footer di bawah.
 *
 * `main` diberi jarak bawah sebesar tinggi bar bawah supaya konten
 * terakhir tidak tertutup saat digulir sampai paling bawah.
 */
export function Kerangka({
  situs,
  children,
}: {
  situs: IsiSitus;
  children: ReactNode;
}) {
  return (
    <>
      <NavigasiAtas />
      <main id="konten" className="pb-24 md:pb-0">
        {children}
      </main>
      <BarBawah />
      <TombolWa situs={situs} />
      <Footer situs={situs} />
    </>
  );
}