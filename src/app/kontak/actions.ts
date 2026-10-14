"use server";

import { execute } from "@/lib/db";
import { revalidateTag } from "next/cache";
import { TAG } from "@/lib/queries/cache-tags";

export interface HasilKontak {
  ok: boolean;
  pesan: string;
}

/**
 * Tangani pengiriman formulir kontak publik.
 *
 * Tidak ada akun pengirim — pesan disimpan sebagai "belum dibaca" agar
 * admin dapat menanggapi dari panel CMS. Validasi dilakukan di server
 * (klien hanyalah peningkatan UX).
 */
export async function kirimPesan(
  _prev: HasilKontak | null,
  formData: FormData,
): Promise<HasilKontak> {
  const nama = String(formData.get("nama") ?? "").trim();
  const kontak = String(formData.get("kontak") ?? "").trim();
  const isi = String(formData.get("pesan") ?? "").trim();

  if (!nama) return { ok: false, pesan: "Nama wajib diisi." };
  if (!kontak) return { ok: false, pesan: "Nomor telepon atau email wajib diisi." };
  if (!isi) return { ok: false, pesan: "Pesan wajib diisi." };
  if (nama.length > 120) return { ok: false, pesan: "Nama terlalu panjang." };
  if (isi.length > 4000) return { ok: false, pesan: "Pesan terlalu panjang." };

  try {
    await execute(
      "INSERT INTO messages (id, name, contact, body, is_read, ip_hash, created_at) VALUES (?1, ?2, ?3, ?4, 0, ?5, ?6)",
      [crypto.randomUUID(), nama, kontak, isi, "", Date.now()],
    );
  } catch {
    return { ok: false, pesan: "Gagal mengirim. Silakan coba lagi." };
  }

  revalidateTag(TAG.messages, "max");
  return { ok: true, pesan: "Pesan terkirim. Kami akan membalas segera." };
}
