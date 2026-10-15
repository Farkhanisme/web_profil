import "server-only";

import sharp from "sharp";
import { assertAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { newId } from "@/lib/ids";
import { nowSeconds } from "@/lib/db/client";
import { mediaClient } from "@/lib/media";
import { GalatMedia, type KodeGalatMedia } from "@/lib/media/galat";
import type { StoredFile } from "@/lib/media/types";

/** Batas ukuran berkas masuk (hasil kompresi browser). */
const MAKS_BYTES = 3 * 1024 * 1024;

/** Tipe yang boleh diterima. SVG hanya untuk logo. */
const TIPE_DIIZINKAN = new Set([
  "image/webp",
  "image/png",
  "image/jpeg",
  "image/svg+xml",
]);

/**
 * Pesan untuk pengelola, dipilih menurut kode galat penyimpanan.
 *
 * Tujuannya adalah pengelola TIDAK perlu membaca log server: tiap pesan
 * harus langsung menyebut variabel lingkungan atau tindakan yang perlu
 * diperbaiki.
 */
const PESAN_MEDIA: Record<KodeGalatMedia, string> = {
  token:
    "Token bot Telegram tidak sah atau sudah dicabut. Perbarui TELEGRAM_BOT_TOKEN di environment, lalu deploy ulang.",
  akses:
    "Bot belum punya akses ke grup. Jadikan bot sebagai anggota (disarankan admin) dari grup TELEGRAM_CHAT_ID.",
  grup:
    "Grup TELEGRAM_CHAT_ID tidak ditemukan. Periksa id grup dan pastikan bot masih menjadi anggotanya.",
  laju:
    "Telegram menolak permintaan karena terlalu sering. Tunggu sekitar satu menit, lalu coba lagi.",
  server: "Telegram sedang bermasalah di sisi mereka. Coba lagi beberapa saat lagi.",
  jaringan:
    "Server tidak dapat menghubungi Telegram. Periksa koneksi keluar server, lalu coba lagi.",
  penyimpanan:
    "Server tidak dapat menulis berkas gambar ke penyimpanan. Periksa kapasitas disk, lalu coba lagi.",
  "tak-dikenal": "Gagal menyimpan gambar. Coba lagi.",
};

/** Pilih pesan yang sesuai untuk galat yang dilempar saat menyimpan media. */
function pesanGalatMedia(error: unknown): string {
  if (error instanceof GalatMedia) return PESAN_MEDIA[error.kode];
  return PESAN_MEDIA["tak-dikenal"];
}

/**
 * Unggah satu berkas gambar.
 *
 * Satu berkas per permintaan (bukan banyak) supaya ukuran body tetap di
 * bawah batas Vercel. Kompresi ke WebP dilakukan di browser sebelum
 * berkas sampai ke sini; server hanya memvalidasi ulang.
 */
export async function POST(request: Request): Promise<Response> {
  // Pemeriksaan sesi di server, bukan hanya di proxy.
  try {
    await assertAdmin();
  } catch {
    return Response.json({ error: "Akses ditolak." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return Response.json({ error: "Permintaan tidak valid." }, { status: 400 });
  }

  const file = form.get("file");
  const alt = String(form.get("alt") ?? "").slice(0, 300);

  if (!(file instanceof File)) {
    return Response.json({ error: "Berkas gambar wajib diunggah." }, { status: 400 });
  }

  if (!TIPE_DIIZINKAN.has(file.type)) {
    return Response.json(
      { error: `Tipe berkas tidak didukung: ${file.type || "tidak dikenal"}.` },
      { status: 415 },
    );
  }

  if (file.size > MAKS_BYTES) {
    return Response.json(
      { error: "Ukuran berkas melebihi batas 3 MB." },
      { status: 413 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Buka ulang dengan sharp untuk memastikan benar-benar gambar valid
  // dan untuk mengambil dimensi asli.
  let width = 0;
  let height = 0;
  try {
    if (file.type === "image/svg+xml") {
      // SVG tidak punya dimensi intrinsik yang andal; dibaca dari viewBox.
      const svg = buffer.toString("utf8");
      const viewBox = /viewBox\s*=\s*["']\s*[\d.]+\s+[\d.]+\s+([\d.]+)\s+([\d.]+)/.exec(svg);
      width = viewBox ? Math.round(Number(viewBox[1])) : 512;
      height = viewBox ? Math.round(Number(viewBox[2])) : 512;
    } else {
      const meta = await sharp(buffer, { failOn: "error" }).metadata();
      width = meta.width ?? 0;
      height = meta.height ?? 0;
      if (!width || !height) throw new Error("Dimensi tidak terbaca.");
    }
  } catch {
    return Response.json(
      { error: "Berkas bukan gambar yang bisa diproses." },
      { status: 415 },
    );
  }

  // Tahap 1: simpan berkasnya (Telegram atau disk lokal).
  let tersimpan: StoredFile;
  const client = mediaClient();
  try {
    tersimpan = await client.save(buffer, file.type);
  } catch (error) {
    console.error("Simpan berkas media gagal:", error);
    return Response.json({ error: pesanGalatMedia(error) }, { status: 502 });
  }

  // Tahap 2: catat referensinya di database. Kalau tahap ini yang gagal,
  // berkasnya sudah tersimpan, jadi pesannya harus berbeda — menyuruh
  // mengunggah ulang akan membuat duplikat.
  try {
    const id = newId();
    await db.execute({
      sql: `
        INSERT INTO media (
          id, tg_file_id, tg_file_unique_id, tg_message_id,
          mime, width, height, bytes, alt, created_at
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
      `,
      args: [
        id,
        tersimpan.fileId,
        tersimpan.fileUniqueId,
        tersimpan.messageId,
        tersimpan.mime,
        tersimpan.width || width,
        tersimpan.height || height,
        tersimpan.bytes,
        alt,
        nowSeconds(),
      ],
    });

    return Response.json({
      id,
      width: tersimpan.width || width,
      height: tersimpan.height || height,
      bytes: tersimpan.bytes,
      storage: client.isRemote ? "telegram" : "lokal",
    });
  } catch (error) {
    console.error("Mencatat media ke database gagal:", error);
    return Response.json(
      {
        error:
          "Gambarnya sudah tersimpan, tetapi gagal dicatat di database. Coba lagi — bila terus gagal, periksa koneksi database.",
      },
      { status: 502 },
    );
  }
}
