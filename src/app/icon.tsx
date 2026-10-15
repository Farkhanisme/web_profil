import { pngIkon } from "@/lib/ikon";

/**
 * Favicon dinamis.
 *
 * Berkas ini adalah file-convention Next.js: ia otomatis menambahkan
 * `<link rel="icon" href="/icon?..." type="image/png" sizes="32x32">`
 * ke seluruh halaman, tanpa perlu disentuh di metadata layout.
 *
 * Gambar dihasilkan dari logo pilihan admin (lihat `src/lib/ikon.ts`),
 * jadi favicon selalu sama dengan logo di header.
 */

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Ikon(): Promise<Response> {
  const png = Buffer.from(await pngIkon(), "base64");

  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      // Penanda generate pada URL ikon ikut berubah tiap build, tetapi
      // cache peramban tetap dibatasi satu jam: ketika logo diganti lewat
      // CMS tanpa deploy, pengunjung lama segera mendapat favicon baru.
      "Cache-Control":
        "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
