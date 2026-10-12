/**
 * Verifikasi algoritma kompresi T5.
 *
 * Meniru langkah `kompresGambar()` memakai sharp (kanvas browser tidak
 * tersedia di Node). Tujuannya mengukur apakah foto besar dari HP benar
 * turun ke bawah 1 MB setelah dikompres ke WebP pada sisi terpanjang 1600 px.
 *
 *   npx tsx scripts/uji-kompresi.ts
 */

import sharp from "sharp";

const MAKS_SISI = 1600;
const TARGET = 1024 * 1024;
const KUALITAS = [0.8, 0.7, 0.6];

function formatMb(byte: number): string {
  return `${(byte / (1024 * 1024)).toFixed(2)} MB`;
}

async function kompres(
  sumber: Buffer,
  lebar: number,
  tinggi: number,
): Promise<{ byte: number; w: number; h: number; q: number; putaran: number }> {
  let skala = Math.min(1, MAKS_SISI / Math.max(lebar, tinggi));

  for (let putaran = 0; putaran <= 2; putaran += 1) {
    const w = Math.max(1, Math.round(lebar * skala));
    const h = Math.max(1, Math.round(tinggi * skala));

    for (const q of KUALITAS) {
      const out = await sharp(sumber)
        .resize({ width: w, height: h, fit: "fill", withoutEnlargement: true })
        .webp({ quality: Math.round(q * 100) })
        .toBuffer();

      if (out.byteLength <= TARGET || q === 0.6) {
        return { byte: out.byteLength, w, h, q, putaran };
      }
    }

    skala *= 0.75;
  }

  throw new Error("gagal");
}

async function main() {
  console.log("Verifikasi kompresi T5\n");

  // Foto HP: 4032 x 3024 (12 MP), dibuat dari noise agar sulit dikompres,
  // lalu disimpan sebagai JPEG mutu 0.98 supaya ukurannya besar seperti
  // hasil kamera ponsel.
  const W = 4032;
  const H = 3024;
  const noise = Buffer.alloc(W * H * 3);
  for (let i = 0; i < noise.length; i += 1) {
    noise[i] = Math.floor(Math.random() * 256);
  }

  const jpeg = await sharp(noise, { raw: { width: W, height: H, channels: 3 } })
    .jpeg({ quality: 98 })
    .toBuffer();

  console.log(
    `Foto uji : ${W} x ${H} JPEG mutu 98 = ${formatMb(jpeg.byteLength)}`,
  );

  const hasil = await kompres(jpeg, W, H);
  const hemat = 100 - (hasil.byte / jpeg.byteLength) * 100;

  console.log(`Hasil    : ${hasil.w} x ${hasil.h} WebP mutu ${hasil.q}`);
  console.log(`Ukuran   : ${formatMb(hasil.byte)}`);
  console.log(`Hemat    : ${hemat.toFixed(1)}%`);
  console.log(`Target   : ${formatMb(TARGET)}`);
  console.log(
    `Tercapai : ${hasil.byte <= TARGET ? "YA" : "TIDAK"} (target < 1 MB)`,
  );
  console.log(
    `Di bawah batas body Vercel 4,5 MB: ${hasil.byte < 4.5 * 1024 * 1024 ? "YA" : "TIDAK"}`,
  );
  console.log(
    `Di bawah batas route /api/admin/media 3 MB: ${
      hasil.byte < 3 * 1024 * 1024 ? "YA" : "TIDAK"
    }`,
  );

  // Foto kecil pun tidak diperbesar (withoutEnlargement).
  const kecil = await sharp({
    create: { width: 320, height: 240, channels: 3, background: { r: 10, g: 120, b: 90 } },
  })
    .jpeg({ quality: 90 })
    .toBuffer();
  const hasilKecil = await kompres(kecil, 320, 240);
  console.log(
    `\nFoto kecil 320x240 -> ${hasilKecil.w} x ${hasilKecil.h} (tidak diperbesar: ${
      hasilKecil.w === 320 ? "YA" : "TIDAK"
    })`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
