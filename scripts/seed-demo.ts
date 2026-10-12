/**
 * Isi data contoh supaya situs bisa dilihat dan dinilai.
 *
 * PENTING: seluruh data di sini adalah CONTOH. Ganti dengan data resmi
 * sekolah sebelum rilis (T20).
 *
 *   npm run seed:demo
 */

import sharp from "sharp";
import { loadEnv } from "./load-env";
import { createDb, nowSeconds } from "../src/lib/db/client";
import { newId } from "../src/lib/ids";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

loadEnv();

const DIR_MEDIA = ".data/media";
const PREFIX = "demo-";

async function simpanLokal(id: string, data: Buffer): Promise<void> {
  await mkdir(join(process.cwd(), DIR_MEDIA), { recursive: true });
  await writeFile(join(process.cwd(), DIR_MEDIA, `${id}.bin`), data);
}

async function sisipMedia(
  db: Awaited<ReturnType<typeof createDb>>,
  data: Buffer,
  alt: string,
  mime: string,
  lebar: number,
  tinggi: number,
): Promise<string> {
  const id = newId();
  await simpanLokal(id, data);
  await db.execute({
    sql: `INSERT INTO media (id, tg_file_id, tg_file_unique_id, tg_message_id,
                              mime, width, height, bytes, alt, created_at)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`,
    args: [id, id, id, null, mime, lebar, tinggi, data.byteLength, alt, nowSeconds()],
  });
  return id;
}

/** Buat gambar contoh dari SVG tanpa berkas eksternal. */
async function gambar(
  teks: string,
  warna: [number, number, number],
  lebar = 1200,
  tinggi = 800,
): Promise<Buffer> {
  const [r, g, b] = warna;
  const font = Math.round(Math.min(lebar, tinggi) / 9);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${lebar}" height="${tinggi}">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="rgb(${r},${g},${b})"/>
<stop offset="100%" stop-color="rgb(${Math.round(r * 0.55)},${Math.round(g * 0.55)},${Math.round(b * 0.55)})"/>
</linearGradient></defs>
<rect width="${lebar}" height="${tinggi}" fill="url(#g)"/>
<text x="50%" y="50%" font-family="sans-serif" font-size="${font}" font-weight="700" fill="rgba(255,255,255,0.94)" text-anchor="middle" dominant-baseline="middle">${teks}</text>
</svg>`;

  return sharp(Buffer.from(svg, "utf8"))
    .resize(lebar, tinggi)
    .webp({ quality: 82 })
    .toBuffer();
}

/* ----------------------------- Data contoh ----------------------------- */

const STAF: Array<[string, string, string]> = [
  ["Ahmad Fauzi, S.Pd.I.", "Kepala Madrasah", "Pendidikan Agama Islam"],
  ["Siti Rahmawati, S.Pd.", "Guru Kelas VI", "Bahasa Indonesia"],
  ["Muhammad Rizal, S.Pd.", "Guru Kelas V", "Matematika"],
  ["Nurul Hidayah, S.Pd.I.", "Guru Agama", "Pendidikan Agama Islam"],
  ["Budi Santoso, S.Kom.", "Guru TIK", "Informatika"],
  ["Dewi Lestari, S.Pd.", "Guru Kelas VII", "Ilmu Pengetahuan Alam"],
  ["Hendra Gunawan, S.Pd.", "Guru PJOK", "Pendidikan Jasmani"],
  ["Rina Marlina, S.Pd.", "Guru Bahasa Inggris", "Bahasa Inggris"],
];

const PROGRAM: Array<{ name: string; summary: string; description: string }> = [
  {
    name: "Pembelajaran Tematik Terpadu",
    summary: "Menggabungkan mata pelajaran umum dan pendidikan agama dalam satu tema.",
    description:
      "Mata pelajaran umum dan pendidikan agama dipadukan dalam satu tema yang dekat dengan kehidupan siswa. Belajar dilakukan melalui proyek, diskusi kelompok, dan pengamatan langsung.",
  },
  {
    name: "Program Literasi Sekolah",
    summary: "Membiasaan membaca dan menulis setiap hari sekolah.",
    description:
      "Setiap siswa membaca lima belas menit sebelum pelajaran dimulai. Setiap siswa membuat catatan membaca dan meminjam buku dari perpustakaan sekolah.",
  },
  {
    name: "Pembelajaran Agama dan Akhlak",
    summary: "Pembiasaan ibadah, adab, dan karakter setiap hari.",
    description:
      "Siswa dibiasakan salat berjamaah, menghafal Al-Quran, dan mempraktikkan kejujuran serta disiplin. Guru agama memberi bimbingan individual bila diperlukan.",
  },
  {
    name: "Pengembangan Bakat dan Minat",
    summary: "Pendampingan potensi siswa lewat kegiatan pilihan.",
    description:
      "Setiap siswa dapat memilih kegiatan sesuai minatnya. Guru pendamping memetakan minat pada awal tahun lalu memantau perkembangan selama satu semester.",
  },
];

const EKSTRA: Array<{
  name: string;
  summary: string;
  description: string;
  schedule: string;
  coach: string;
}> = [
  {
    name: "Rohani Islam (ROIS)",
    summary: "Pembinaan kerohaniansale cepat.",
    description: "Pembinaan kerohaniansale cepat.",
    schedule: "Sabtu, 08.00-10.00",
    coach: "Ahmad Fauzi, S.Pd.I.",
  },
  {
    name: "Pramuka",
    summary: "Pembinaan ketangkasan dan kedisiplinan.",
    description: "Pembinaan ketangkasan dan kedisiplinan.",
    schedule: "Jumat, 15.00-17.00",
    coach: "Dewi Lestari, S.Pd.",
  },
  {
    name: "Futsal",
    summary: "Olahraga beregu antar siswa.",
    description: "Olahraga beregu antar siswa.",
    schedule: "Rabu, 15.30-17.00",
    coach: "Hendra Gunawan, S.Pd.",
  },
  {
    name: "Marching Band",
    summary: "Latihan musik dan tampil pada acara sekolah.",
    description: "Latihan musik dan tampil pada acara sekolah.",
    schedule: "Selasa dan Jumat, 16.00-18.00",
    coach: "Rina Marlina, S.Pd.",
  },
];

const FOTO: Array<[string, [number, number, number]]> = [
  ["Kegiatan Belajar Mengajar", [4, 120, 87]],
  ["Upacara Bendera", [30, 58, 138]],
  ["Praktikum Laboratorium", [217, 119, 6]],
  ["Ekstrakurikuler Pramuka", [13, 148, 136]],
  ["Perpustakaan Sekolah", [109, 40, 217]],
  ["Kegiatan Kepahuan", [190, 24, 93]],
];

/* ------------------------------- Proses -------------------------------- */

async function main() {
  const db = createDb();

  await db.execute("DELETE FROM photos WHERE album_id LIKE ?", [`${PREFIX}%`]);
  await db.execute("DELETE FROM albums WHERE id LIKE ?", [`${PREFIX}%`]);
  await db.execute("DELETE FROM extracurriculars WHERE id LIKE ?", [`${PREFIX}%`]);
  await db.execute("DELETE FROM programs WHERE id LIKE ?", [`${PREFIX}%`]);
  await db.execute("DELETE FROM staff WHERE id LIKE ?", [`${PREFIX}%`]);
  console.log("Data contoh lama dibersihkan.");

  // Logo
  const logoSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
<rect width="512" height="512" rx="96" fill="#047857"/>
<path d="M256 104 L416 204 L256 304 L96 204 Z" fill="#ffffff" opacity="0.95"/>
<rect x="164" y="246" width="184" height="146" rx="12" fill="#ffffff" opacity="0.88"/>
<text x="256" y="348" font-family="sans-serif" font-size="72" font-weight="800" fill="#047857" text-anchor="middle">MTs</text>
</svg>`;
  const logoBuffer = Buffer.from(logoSvg, "utf8");
  const logoId = await sisipMedia(db, logoBuffer, "Logo sekolah", "image/svg+xml", 512, 512);
  await db.execute({
    sql: `INSERT INTO settings (key, value) VALUES ('logo_media_id', ?1)
          ON CONFLICT(key) DO UPDATE SET value = ?1`,
    args: [logoId],
  });
  console.log("Logo contoh dibuat.");

  // Staf
  for (let i = 0; i < STAF.length; i += 1) {
    const [name, position, subject] = STAF[i]!;
    const foto = await gambar(name.split(" ")[0]!, [4, 120, 87], 480, 640);
    const mediaId = await sisipMedia(db, foto, `Foto ${name}`, "image/webp", 480, 640);
    await db.execute({
      sql: `INSERT INTO staff (id, name, position, subject, photo_media_id,
                                sort_order, is_published, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, 1, ?7, ?7)`,
      args: [`${PREFIX}staf-${i + 1}`, name, position, subject, mediaId, i + 1, nowSeconds()],
    });
  }
  console.log(`${STAF.length} guru dan staf contoh dibuat.`);

  // Program
  for (let i = 0; i < PROGRAM.length; i += 1) {
    const p = PROGRAM[i]!;
    const foto = await gambar(p.name.slice(0, 20), [30, 58, 138]);
    const mediaId = await sisipMedia(db, foto, p.name, "image/webp", 1200, 800);
    await db.execute({
      sql: `INSERT INTO programs (id, slug, name, summary, description, image_media_id,
                                  sort_order, is_published, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, 1, ?8)`,
      args: [
        `${PREFIX}program-${i + 1}`,
        `program-${i + 1}`,
        p.name,
        p.summary,
        p.description,
        mediaId,
        i + 1,
        nowSeconds(),
      ],
    });
  }
  console.log(`${PROGRAM.length} program contoh dibuat.`);

  // Ekstrakurikuler
  for (let i = 0; i < EKSTRA.length; i += 1) {
    const e = EKSTRA[i]!;
    const foto = await gambar(e.name.slice(0, 16), [217, 119, 6]);
    const mediaId = await sisipMedia(db, foto, e.name, "image/webp", 1200, 800);
    await db.execute({
      sql: `INSERT INTO extracurriculars (id, slug, name, summary, description, schedule, coach,
                                          image_media_id, sort_order, is_published, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 1, ?10)`,
      args: [
        `${PREFIX}ekstra-${i + 1}`,
        `ekstrakurikuler-${i + 1}`,
        e.name,
        e.summary,
        e.description,
        e.schedule,
        e.coach,
        mediaId,
        i + 1,
        nowSeconds(),
      ],
    });
  }
  console.log(`${EKSTRA.length} ekstrakurikuler contoh dibuat.`);

  // Album dan foto
  const albumId = `${PREFIX}album-1`;
  await db.execute({
    sql: `INSERT INTO albums (id, slug, title, description, created_at, updated_at)
          VALUES (?1, 'kegiatan-sekolah', 'Kegiatan Sekolah',
                  'Cuplikan kegiatan belajar, upacara, dan kegiatan sekolah.',
                  ?2, ?2)`,
    args: [albumId, nowSeconds()],
  });

  let sampul: string | null = null;
  for (let i = 0; i < FOTO.length; i += 1) {
    const [caption, warna] = FOTO[i]!;
    const foto = await gambar(caption, warna);
    const mediaId = await sisipMedia(db, foto, caption, "image/webp", 1200, 800);
    if (i === 0) sampul = mediaId;
    await db.execute({
      sql: `INSERT INTO photos (id, album_id, media_id, caption, sort_order, created_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
      args: [newId(), albumId, mediaId, caption, i + 1, nowSeconds()],
    });
  }

  await db.execute({
    sql: "UPDATE albums SET cover_media_id = ?1 WHERE id = ?2",
    args: [sampul, albumId],
  });
  console.log(`Album contoh dibuat dengan ${FOTO.length} foto.`);

  console.log("\nSelesai. Buka http://localhost:3000 untuk melihat hasilnya.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});