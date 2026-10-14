"use server";

import { updateTag } from "next/cache";
import { db } from "@/lib/db";
import { newId } from "@/lib/ids";
import { nowSeconds } from "@/lib/db/client";
import { mediaClient } from "@/lib/media";
import {
  BATAS_PESAN_PER_JAM,
  JENDELA_PESAN_DETIK,
  periksaPesan,
  teksNotifikasi,
} from "@/lib/kontak";
import { consumeRateLimit, ipPengunjung } from "@/lib/rate-limit";
import { hashIp } from "@/lib/ip";
import { TAG } from "@/lib/queries/cache-tags";

/**
 * Server Action formulir kontak.
 *
 * Urutannya penting dan tidak boleh dibalik:
 *   1. Periksa formulir (honeypot + Zod). Tidak menyentuh database.
 *   2. Periksa batas pengiriman per alamat IP.
 *   3. Simpan ke database.
 *   4. Buang cache dasbor supaya pesan langsung terlihat.
 *   5. Kirim notifikasi Telegram sebagai langkah terakhir.
 *
 * Notifikasi Telegram tidak boleh menggagalkan penyimpanan: kalau bot
 * bermasalah, pesan tetap tersimpan dan pengelola tetap bisa membacanya
 * lewat CMS.
 *
 * Pemeriksaannya duduk di `lib/kontak.ts` supaya bisa diuji tanpa
 * menjalankan Next.js.
 */

export type KontakState = {
  sukses?: boolean;
  /** Disembunyikan dari pengguna, hanya untuk catatan teknis. */
  spam?: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;

export async function kirimPesan(
  _state: KontakState,
  formData: FormData,
): Promise<KontakState> {
  const pemeriksaan = periksaPesan(formData);

  // Honeypot terisi berarti bot. Balas seolah berhasil supaya bot tidak
  // belajar, tapi jangan simpan apa pun.
  if (pemeriksaan.jenis === "spam") {
    return { sukses: true, spam: true };
  }

  if (pemeriksaan.jenis === "salah") {
    return {
      error: "Periksa kembali data yang Anda isi.",
      fieldErrors: pemeriksaan.fieldErrors,
    };
  }

  // Batas pengiriman per alamat IP: maksimal 5 pesan per jam.
  const ip = await ipPengunjung();
  const limit = await consumeRateLimit(
    `kontak:${hashIp(ip)}`,
    BATAS_PESAN_PER_JAM,
    JENDELA_PESAN_DETIK,
  );

  if (!limit.ok) {
    const menit = Math.max(1, Math.ceil(limit.retryAfter / 60));
    return {
      error: `Terlalu banyak pesan dikirim. Coba lagi dalam ${menit} menit.`,
    };
  }

  // Simpan lebih dulu. Basis data adalah sumber kebenaran.
  try {
    await db.execute({
      sql: `INSERT INTO messages (id, name, contact, body, is_read, ip_hash, created_at)
            VALUES (?1, ?2, ?3, ?4, 0, ?5, ?6)`,
      args: [
        newId(),
        pemeriksaan.nama,
        pemeriksaan.kontak,
        pemeriksaan.isi,
        hashIp(ip),
        nowSeconds(),
      ],
    });
  } catch (error) {
    console.error("Gagal menyimpan pesan:", error);
    return { error: "Pesan Anda belum tersimpan. Coba lagi sebentar lagi." };
  }

  // Pesan baru tidak boleh menunggu cache kadaluwarsa sendiri.
  updateTag(TAG.messages);

  // Notifikasi Telegram. Kegagalan di sini tidak membatalkan apa pun.
  try {
    await mediaClient().notify(
      teksNotifikasi(pemeriksaan.nama, pemeriksaan.kontak, pemeriksaan.isi),
    );
  } catch (error) {
    console.error("Notifikasi Telegram gagal, pesan tetap tersimpan:", error);
  }

  return { sukses: true };
}