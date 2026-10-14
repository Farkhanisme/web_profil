"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { newId } from "@/lib/ids";
import { nowSeconds } from "@/lib/db/client";
import { TAG } from "@/lib/queries/cache-tags";
import { dariFormData, galatPerField, kosongkan, staffSchema } from "@/lib/schemas/staff";

/**
 * Server Action modul guru dan staf.
 *
 * Tiga aturan berlaku di setiap action:
 *   1. Semua input divalidasi Zod di server (skema di lib/schemas/staff.ts).
 *   2. Sesi admin diperiksa lebih dulu, bukan hanya di proxy.
 *   3. Setelah data berubah, cache publik dibuang lewat `updateTag()`
 *      supaya halaman publik ikut berubah tanpa deploy ulang.
 */

export type StaffState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;

export async function simpanStaff(
  _state: StaffState,
  formData: FormData,
): Promise<StaffState> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();

  const hasil = staffSchema.safeParse(dariFormData(formData));
  if (!hasil.success) {
    return {
      error: "Periksa kembali data yang diisi.",
      fieldErrors: galatPerField(hasil.error),
    };
  }

  const data = hasil.data;
  const sekarang = nowSeconds();

  if (id) {
    const ada = await db.execute({
      sql: "SELECT id FROM staff WHERE id = ?",
      args: [id],
    });
    if (ada.rows.length === 0) return { error: "Data guru tidak ditemukan." };

    await db.execute({
      sql: `UPDATE staff SET
              name = ?1, position = ?2, subject = ?3,
              photo_media_id = ?4, is_published = ?5, updated_at = ?6
            WHERE id = ?7`,
      args: [
        data.name,
        data.position,
        data.subject,
        kosongkan(data.photo_media_id),
        data.is_published ? 1 : 0,
        sekarang,
        id,
      ],
    });
  } else {
    // Urutan default: diletakkan setelah baris terakhir.
    const akhir = await db.execute({
      sql: "SELECT coalesce(max(sort_order), 0) AS n FROM staff",
    });
    const urutan = Number((akhir.rows[0] as unknown as { n: number }).n) + 1;

    await db.execute({
      sql: `INSERT INTO staff (
              id, name, position, subject, photo_media_id,
              sort_order, is_published, created_at, updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
      args: [
        newId(),
        data.name,
        data.position,
        data.subject,
        kosongkan(data.photo_media_id),
        urutan,
        data.is_published ? 1 : 0,
        sekarang,
        sekarang,
      ],
    });
  }

  updateTag(TAG.staff);
  redirect("/admin/staff?saved=1");
}

/** Hapus satu guru/staf. Baris media sengaja dibiarkan. */
export async function hapusStaff(formData: FormData): Promise<void> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await db.execute({ sql: "DELETE FROM staff WHERE id = ?", args: [id] });

  updateTag(TAG.staff);
  redirect("/admin/staff?deleted=1");
}

/**
 * Pindahkan satu guru/staf satu tingkat ke atas atau ke bawah.
 * Seluruh urutan ditulis ulang karena jumlahnya sedikit dan ini yang
 * paling mudah dipahami.
 */
export async function geserStaff(formData: FormData): Promise<void> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const arah = String(formData.get("arah") ?? "");
  if (!id || (arah !== "naik" && arah !== "turun")) return;

  const semua = await db.execute({
    sql: "SELECT id FROM staff ORDER BY sort_order ASC, name ASC",
  });
  const daftar = semua.rows.map((r) => (r as unknown as { id: string }).id);

  const posisi = daftar.indexOf(id);
  if (posisi < 0) return;

  const tujuan = arah === "naik" ? posisi - 1 : posisi + 1;
  if (tujuan < 0 || tujuan >= daftar.length) return;

  const baru = [...daftar];
  [baru[posisi], baru[tujuan]] = [baru[tujuan]!, baru[posisi]!];

  await db.batch(
    baru.map((idBaris, index) => ({
      sql: "UPDATE staff SET sort_order = ?1 WHERE id = ?2",
      args: [index + 1, idBaris],
    })),
    "write",
  );

  updateTag(TAG.staff);
}
