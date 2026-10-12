"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { nowSeconds } from "@/lib/db/client";
import { BAWAAN, normalisasiHex } from "@/lib/color";
import { TAG } from "@/lib/queries/cache-tags";
import { galatPerField, logoSchema, temaSchema } from "@/lib/schemas/settings";

/**
 * Server Action pengaturan situs: logo dan warna tema.
 *
 * Admin dapat mengganti warna dan logo tanpa menyentuh kode maupun
 * melakukan deploy ulang. Setelah disimpan, cache ber-tag `settings`
 * dibuang sehingga seluruh halaman publik ikut berubah seketika.
 */

export type PengaturanState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;

/** Tulis atau perbarui satu baris pengaturan. */
async function tulis(kunci: string, nilai: string): Promise<void> {
  await db.execute({
    sql: `INSERT INTO settings (key, value) VALUES (?1, ?2)
          ON CONFLICT(key) DO UPDATE SET value = ?2`,
    args: [kunci, nilai],
  });
}

export async function simpanTema(
  _state: PengaturanState,
  formData: FormData,
): Promise<PengaturanState> {
  await assertAdmin();

  const hasil = temaSchema.safeParse({
    theme_primary: formData.get("theme_primary"),
    theme_accent: formData.get("theme_accent"),
  });

  if (!hasil.success) {
    return {
      error: "Warna belum disimpan. Perbaiki dulu warna yang ditandai.",
      fieldErrors: galatPerField(hasil.error),
    };
  }

  await tulis("theme_primary", normalisasiHex(hasil.data.theme_primary));
  await tulis("theme_accent", normalisasiHex(hasil.data.theme_accent));
  await catatPerubahan();

  updateTag(TAG.settings);
  redirect("/admin/settings?saved=1");
}

/** Simpan logo sekolah (atau kosongkan bila admin menghapusnya). */
export async function simpanLogo(
  _state: PengaturanState,
  formData: FormData,
): Promise<PengaturanState> {
  await assertAdmin();

  const hasil = logoSchema.safeParse({
    logo_media_id: formData.get("logo_media_id") ?? "",
  });
  if (!hasil.success) {
    return { error: "Logo tidak valid.", fieldErrors: galatPerField(hasil.error) };
  }

  const id = hasil.data.logo_media_id.trim();

  if (id) {
    const ada = await db.execute({
      sql: "SELECT id FROM media WHERE id = ?",
      args: [id],
    });
    if (ada.rows.length === 0) {
      return { error: "Berkas logo tidak ditemukan. Silakan unggah ulang." };
    }
  }

  await tulis("logo_media_id", id);
  await catatPerubahan();

  updateTag(TAG.settings);
  redirect("/admin/settings?logo=1");
}

/**
 * Kembalikan warna ke warna bawaan.
 * Logo tidak disentuh, karena pengguna biasanya tetap ingin memakai
 * logo yang sama setelah bereksperimen dengan warna.
 */
export async function kembalikanWarnaBawaan(): Promise<void> {
  await assertAdmin();

  await tulis("theme_primary", BAWAAN.primary);
  await tulis("theme_accent", BAWAAN.accent);
  await catatPerubahan();

  updateTag(TAG.settings);
  redirect("/admin/settings?reset=1");
}

/** Catat waktu terakhir pengaturan diubah; dipakai di halaman pengaturan. */
async function catatPerubahan(): Promise<void> {
  await tulis("theme_updated_at", String(nowSeconds()));
}
