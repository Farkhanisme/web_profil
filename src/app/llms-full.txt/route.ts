import { susunLlmsFullTxt } from "@/lib/llms";

/**
 * Isi lengkap situs untuk mesin kecerdasan buatan.
 *
 * Berisi profil, visi, misi, struktur, fasilitas, dan seluruh
 * pertanyaan umum. Ditautkan dari /llms.txt.
 */
export function GET(): Response {
  return new Response(susunLlmsFullTxt(), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
      "X-Robots-Tag": "index, follow",
    },
  });
}