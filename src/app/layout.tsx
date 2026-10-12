import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
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

const fontSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
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
    description: deskripsi(DESKRIPSI_UMUM),
    applicationName: site.name,
    authors: [{ name: site.name, url: baseUrl() }],
    creator: site.name,
    publisher: site.name,
    alternates: { canonical: "/" },
    formatDetection: { telephone: true, address: true },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-video-preview": -1, "max-snippet": -1 },
    },
    verification: verifikasiPencari(),
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: "/",
      siteName: site.name,
      title: judulLengkap(site.tagline),
      description: deskripsi(DESKRIPSI_UMUM),
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
      description: deskripsi(DESKRIPSI_UMUM),
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

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const pengaturan = await pengaturanSitus();
  const tema = hitungTema(pengaturan.themePrimary, pengaturan.themeAccent);

  return (
    <html lang="id" className={`${fontSans.variable} h-full`}>
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
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}