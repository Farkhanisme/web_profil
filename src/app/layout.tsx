import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { site, baseUrl } from "@/config/site";
import { pengaturanSitus } from "@/lib/queries/settings";
import {
  DESKRIPSI_UMUM,
  deskripsi,
  gambarOg,
  judulLengkap,
  verifikasiPencari,
} from "@/lib/seo";
import { hitungTema } from "@/lib/color";
import { blokCssTema, warnaMetaPeramban } from "@/lib/theme-css";
import { ResetGulir } from "@/components/site/scroll-reset";

/**
 * Root layout: kerangka HTML, metadata SEO, dan pewarnaan tema dari CMS.
 *
 * Dua font, keduanya di-host sendiri oleh next/font sehingga tidak ada
 * permintaan ke pihak ketiga saat halaman dimuat.
 */

/** Outfit — geometris, modern, tegas tapi hangat. Untuk judul. */
const fontJudul = Outfit({
  variable: "--tf-judul",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

/** Plus Jakarta Sans oleh Tokotype. Untuk teks. */
const fontSans = Plus_Jakarta_Sans({
  variable: "--tf-sans",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
});

export async function generateMetadata(): Promise<Metadata> {
  const pengaturan = await pengaturanSitus();

  return {
    metadataBase: new URL(baseUrl()),
    title: {
      // Halaman beranda memakai nama sekolah apa adanya; halaman lain
      // mendapat nama sekolah dari template ini.
      default: `${site.name} - ${site.tagline}`,
      template: `%s | ${site.name}`,
    },
    description: await deskripsi(DESKRIPSI_UMUM),
    applicationName: site.name,
    authors: [{ name: site.name, url: baseUrl() }],
    creator: site.name,
    publisher: site.name,
    alternates: { canonical: "/" },
    formatDetection: { telephone: true, address: true },
    /*
      `robots` tidak ditulis di sini. Nilai bawaan Next.js sudah
      `index, follow`, jadi menyebutkannya secara eksplisit tidak
      menambah apa pun, tetapi bocor ke halaman 404: ketika sebuah
      alamat mati dan halamannya dialirkan (soft 404), Next.js
      menyuntik tag `noindex`, sementara tag `index, follow` dari
      layout ikut terbawa sehingga ada dua perintah yang bertentangan
      dalam satu dokumen. Halaman yang perlu larangan indeks
      (/admin/login dan halaman 404) mendeklarasikannya sendiri.
    */
    verification: verifikasiPencari(),
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: "/",
      siteName: site.name,
      title: judulLengkap(site.tagline),
      description: await deskripsi(DESKRIPSI_UMUM),
      ...(pengaturan.logo
        ? {
            images: [
              {
                url: gambarOg(pengaturan.logo.id),
                width: 1200,
                height: 630,
                alt: pengaturan.logo.alt || site.name,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: judulLengkap(site.tagline),
      description: await deskripsi(DESKRIPSI_UMUM),
      ...(pengaturan.logo ? { images: [gambarOg(pengaturan.logo.id)] } : {}),
    },
  };
}

export async function generateViewport(): Promise<Viewport> {
  // Meta theme-color mengikuti warna utama yang dipilih admin.
  const pengaturan = await pengaturanSitus();
  const tema = hitungTema(pengaturan.themePrimary, pengaturan.themeAccent);

  return {
    width: "device-width",
    initialScale: 1,
    themeColor: warnaMetaPeramban(tema),
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const pengaturan = await pengaturanSitus();
  const tema = hitungTema(pengaturan.themePrimary, pengaturan.themeAccent);

  return (
    <html
      lang="id"
      className={`${fontSans.variable} ${fontJudul.variable} h-full`}
    >
      <head>
        {/*
          Warna tema ditulis di dalam <head> pada server, sebelum halaman
          digambar. Ini yang membuat pergantian warna tidak berkedip
          (tidak ada FOUC) dan tidak memerlukan deploy ulang.
        */}
        <style
          id="tema-merek"
          dangerouslySetInnerHTML={{ __html: blokCssTema(tema) }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-putih font-sans text-tinta antialiased">
        <a
          href="#konten"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-tinta focus:px-4 focus:py-3 focus:text-putih"
        >
          Lompat ke konten
        </a>
        <ResetGulir />
        {children}
      </body>
    </html>
  );
}