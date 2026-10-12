/**
 * Album uji berisi 30 foto, untuk memeriksa tombol "Muat lebih banyak".
 *
 *   npx tsx scripts/seed-galeri-uji.ts
 *   npx tsx scripts/seed-galeri-uji.ts --hapus
 */

import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { loadEnv } from "./load-env";
import { createDb, nowSeconds } from "../src/lib/db/client";
import { newId } from "../src/lib/ids";

loadEnv();

const ALBUM_ID = "uji-galeri";
const JUMLAH = 30;

async function main(): Promise<void> {
  const db = createDb();
  const hapus = process.argv.includes("--hapus");

  await db.execute({
    sql: "DELETE FROM photos WHERE album_id = ?",
    args: [ALBUM_ID],
  });
  await db.execute({ sql: "DELETE FROM albums WHERE id = ?", args: [ALBUM_ID] });

  if (hapus) {
    console.log("Album uji dihapus.");
    return;
  }

  await db.execute({
    sql: `INSERT INTO albums (id, slug, title, description, created_at, updated_at)
          VALUES (?1, ?2, ?3, ?4, ?5, ?5)`,
    args: [
      ALBUM_ID,
      "uji-galeri",
      "Album Uji 30 Foto",
      "Album sementara untuk menguji tombol muat lebih banyak.",
      nowSeconds(),
    ],
  });

  await mkdir(join(process.cwd(), ".data/media"), { recursive: true });

  for (let i = 1; i <= JUMLAH; i += 1) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800">
<rect width="1200" height="800" fill="rgb(${20 + i * 7},120,90)"/>
<text x="50%" y="50%" font-family="sans-serif" font-size="140" font-weight="700"
      fill="white" text-anchor="middle" dominant-baseline="middle">${i}</text>
</svg>`;

    const buffer = await sharp(Buffer.from(svg, "utf8"))
      .webp({ quality: 80 })
      .toBuffer();

    const mediaId = newId();
    await writeFile(
      join(process.cwd(), ".data/media", `${mediaId}.bin`),
      buffer,
    );

    await db.execute({
      sql: `INSERT INTO media (id, tg_file_id, tg_file_unique_id, tg_message_id,
                                mime, width, height, bytes, alt, created_at)
            VALUES (?1, ?2, ?2, NULL, 'image/webp', 1200, 800, ?3, ?4, ?5)`,
      args: [mediaId, mediaId, buffer.byteLength, `Foto uji ${i}`, nowSeconds()],
    });

    await db.execute({
      sql: `INSERT INTO photos (id, album_id, media_id, caption, sort_order, created_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
      args: [newId(), ALBUM_ID, mediaId, `Foto kegiatan ke-${i}`, i, nowSeconds()],
    });
  }

  console.log(`Album uji dibuat dengan ${JUMLAH} foto.`);
  console.log("Buka /galeri/uji-galeri untuk mengujinya.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});