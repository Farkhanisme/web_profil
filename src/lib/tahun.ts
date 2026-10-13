/**
 * Tahun berjalan untuk footer.
 *
 * Next.js 16 dengan Cache Components menolak `new Date()` saat prerender
 * karena nilainya bisa berubah antar render. Fungsi ini dibungkus
 * `"use cache"` supaya dihitung sekali saat build lalu di-cache.
 */
export async function tahunSekarang(): Promise<number> {
  "use cache";
  return new Date().getFullYear();
}