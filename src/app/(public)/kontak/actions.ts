"use server";

import { updateTag } from "next/cache";
import { db } from "@/lib/db";
import { newId } from "@/lib/ids";
import { nowSeconds } from "@/lib/db/client";
import { mediaClient } from "@/lib/media";
import {
  BATAS_PESAN_PER_JAM,
  JENDELA_PESAN_DETIK,
  periksaHoneypot,
  periksaPesan,
  teksNotifikasi,
} from "@/lib/kontak";
import { consumeRateLimit, ipPengunjung } from "@/lib/rate-limit";
import { hashIp } from "@/lib/ip";
import { TAG } from "@/lib/queries/cache-tags";

/**
 * Server Action formulir kontak.
 *
 * Urutan yang penting:
 *   1. Periksa honeypot lalu isi formulir. Tidak menyentuh database.
 *   2. Periksa batas pengiriman per alamat IP.
 *   3. Simpan ke database.
 *   4. Buang cache dasbor supaya pesan langsung terlihat.
 *   5. Kirim notifikasi Telegram sebagai langkah terakhir.
 *
 * Notifikasi Telegram tidak boleh menggagalkan penyimpanan. Kalau bot
 * bermasalah, pesan tetap tersimpan dan pengelola tetap bisa membacanya
 * lewat CMS.
 *
 * Logika pemeriksaannya ada di lib/kontak.ts supaya bisa diuji tanpa
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
  // 1. Honeypot terisi berarti bot. Balas seolah berhasil supaya bot
  //    tidak belajar, tapi jangan simpan apa pun.
  if (periksaHoneypot(formData)) {
    return { sukses: true, spam: true };
  }

  const pemeriksaan = periksaPesan(formData);

  if (pemeriksaan.jenis !== "sah") {
    return {
      error: "Periksa kembali data yang Anda isi.",
      fieldErrors:
        pemeriksaan.jenis === "salah" ? pemeriksaan.fieldErrors : {},
    };
  }

  // 2. Batas pengiriman per alamat IP.
  const ip = await ipPengunjung();
  const kunci = `kontak:${hashIp(ip)}`;
  const limit = await consumeRateLimit(
    kunci,
    BATAS_PESAN_PER_JAM,
    JENDELA_PESAN_DETIK,
  );

  if (!limit.ok) {
    const menit = Math.max(1, Math.ceil(limit.retryAfter / 60));
    return {
      error: `Terlalu banyak pesan dikirim. Coba lagi dalam ${menit} menit.`,
    };
  }

  // 3. Simpan lebih dulu. Basis data adalah sumber kebenaran.
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

  // 4. Buang cache dasbor. Query pesan memakai 'use cache', tanpa ini
  //    pesan baru tidak muncul sampai cache kadaluwarsa sendiri.
  updateTag(TAG.messages);

  // 5. Notifikasi Telegram. Kegagalan di sini tidak membatalkan apa pun.
  try {
    await mediaClient().notify(
      teksNotifikasi(pemeriksaan.nama, pemeriksaan.kontak, pemeriksaan.isi),
    );
  } catch (error) {
    console.error("Notifikasi Telegram gagal, pesan tetap tersimpan:", error);
  }

  return { sukses: true };
}