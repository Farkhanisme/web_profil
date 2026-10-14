import type { ReactNode } from "react";
import type { IsiSitus } from "@/lib/konten";
import { pengaturanSitus } from "@/lib/queries/settings";
import { BarBawah, NavigasiAtas } from "./navigasi";
import { Footer } from "./blok";
import { TombolWa } from "./wa";

/**
 * Kerangka halaman publik: navigasi di atas, bar bawah dan tombol
 * WhatsApp di ponsel, footer di bawah.
 *
 * `main` diberi jarak bawah sebesar tinggi bar bawah supaya konten
 * terakhir tidak tertutup saat digulir sampai paling bawah.
 *
 * Nama sekolah dan logo diteruskan ke navigasi dari data CMS. Sebelumnya
 * keduanya ditulis mati ("MTs Ma'arif Tieng" dan kotak huruf "M"), jadi
 * mengganti nama atau logo lewat CMS tidak terlihat di header.
 */
export async function Kerangka({
  situs,
  children,
}: {
  situs: IsiSitus;
  children: ReactNode;
}) {
  const pengaturan = await pengaturanSitus();

  return (
    <>
      <NavigasiAtas nama={situs.name} logo={pengaturan.logo} />
      <main id="konten" className="pb-24 md:pb-0">
        {children}
      </main>
      <BarBawah />
      <TombolWa situs={situs} />
      <Footer situs={situs} />
    </>
  );
}