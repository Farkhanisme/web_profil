import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import sharp from "sharp";
import { query } from "@/lib/db";
import { mediaClient } from "@/lib/media";
import { TAG } from "@/lib/queries/cache-tags";
import { pengaturanSitus } from "@/lib/queries/settings";

/**
 * Favicon (ikon tab peramban) yang dihasilkan dari logo CMS.
 *
 * `src/app/icon.tsx` memanggil fungsi ini lalu menyajikan hasilnya sebagai
 * PNG 32×32. Fungsi memakai `'use cache'` dengan tag `settings`, sehingga
 * mengganti logo di /admin/settings ikut membuang cache ikon — favicon
 * baru muncul tanpa deploy ulang, sama seperti halaman publik lain.
 *
 * Berkas dikembalikan sebagai base64 karena string adalah tipe yang pasti
 * bisa disimpan oleh `'use cache'`, sementara Buffer bisa berubah bentuk
 * saat diserialisasi.
 */

const UKURAN = 32;

/**
 * Ikon cadangan: kotak bercorak warna tema dengan bulan sabit.
 *
 * Sengaja tanpa teks huruf: pemuatan huruf bergantung pada font di server
 * yang belum tentu tersedia di lingkungan build, sedangkan bentuk geometris
 * selalu tergambar. Warna diambil dari tema agar tetap mengikuti warna situs.
 */
function svgCadangan(warna: string): string {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">`,
    `<rect width="32" height="32" rx="7" fill="${warna}"/>`,
    `<circle cx="15" cy="16" r="8.5" fill="#ffffff"/>`,
    `<circle cx="19.5" cy="14" r="7.5" fill="${warna}"/>`,
    `</svg>`,
  ].join("");
}

/**
 * PNG favicon 32×32 dalam base64.
 *
 * Bila logo belum dipilih atau berkasnya gagal diambil (misalnya Telegram
 * sedang terganggu saat build), fungsi jatuh ke ikon cadangan supaya build
 * dan permintaan favicon tetap berhasil. Kegagalan bersifat sementara:
 * entri `stale` setelah 5 menit, jadi percobaan berikutnya berjalan ulang.
 */
export async function pngIkon(): Promise<string> {
  "use cache";
  cacheTag(TAG.settings);
  cacheLife("max");

  const pengaturan = await pengaturanSitus();

  if (pengaturan.logoMediaId) {
    try {
      const media = await query<{
        tg_file_id: string | null;
        tg_message_id: number | null;
      }>("SELECT tg_file_id, tg_message_id FROM media WHERE id = ?", [
        pengaturan.logoMediaId,
      ]);
      const rujukan = media[0];

      if (rujukan?.tg_file_id) {
        const berkas = await mediaClient().load({
          fileId: rujukan.tg_file_id,
          messageId: rujukan.tg_message_id,
        });

        // `density` 300 hanya berpengaruh pada logo vektor (SVG), supaya
        // diresterisasi pada resolusi tinggi sebelum diperkecil — hasilnya
        // tidak buram. Pada berkas raster opsi ini diabaikan.
        const png = await sharp(berkas, { density: 300 })
          .rotate()
          .resize(UKURAN, UKURAN, {
            fit: "contain",
            background: { r: 0, g: 0, b: 0, alpha: 0 },
          })
          .png()
          .toBuffer();

        return png.toString("base64");
      }
    } catch (error) {
      console.error(
        "Favicon: gagal memakai logo CMS, memakai ikon cadangan.",
        error,
      );
    }
  }

  const cadangan = await sharp(
    Buffer.from(svgCadangan(pengaturan.themePrimary)),
  ).png().toBuffer();

  return cadangan.toString("base64");
}
