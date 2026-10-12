import { susunLlmsTxt } from "@/lib/llms";

/**
 * Ringkasan situs untuk mesin kecerdasan buatan.
 *
 * Berkas ini dibaca mesin AI yang mencari jawaban singkat tentang
 * sebuah sekolah. Isinya Markdown murni, tanpa HTML.
 *
 * Route Handler di bawah memakai model prerender Next.js: karena
 * tidak membaca data permintaan, berkas ini dilayani dari cache CDN.
 */
export function GET(): Response {
  return new Response(susunLlmsTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "index, follow",
    },
  });
}