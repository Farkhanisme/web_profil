"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { newId } from "@/lib/ids";
import { nowSeconds } from "@/lib/db/client";
import { slugUnik } from "@/lib/slug";
import { TAG } from "@/lib/queries/cache-tags";
import {
  ekstrakurikulerSchema,
  galatPerField,
  kosongkan,
  pecah,
  programSchema,
} from "@/lib/schemas/konten";

/**
 * Server Action modul program sekolah dan ekstrakurikuler.
 *
 * Berbeda dari modul guru, kedua modul ini memakai slug yang menjadi
 * bagian dari URL publik. Karena itu keunikan slug dijaga dan bila slug
 * bentrok, pesan galatnya disebutkan secara jelas.
 */

export type KontenState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;

/** True bila slug sudah dipakai baris lain. */
async function slugBentrok(
  tabel: "programs" | "extracurriculars",
  slug: string,
  kecualiId: string,
): Promise<boolean> {
  const r = await db.execute({
    sql: `SELECT id FROM ${tabel} WHERE slug = ?1 AND id <> ?2`,
    args: [slug, kecualiId],
  });
  return r.rows.length > 0;
}

/** Urutan berikutnya di sebuah tabel. */
async function urutanBerikutnya(tabel: string): Promise<number> {
  const r = await db.execute({
    sql: `SELECT coalesce(max(sort_order), 0) AS n FROM ${tabel}`,
  });
  return Number((r.rows[0] as unknown as { n: number }).n) + 1;
}

/* ------------------------------ Program ----------------------------- */

export async function simpanProgram(
  _state: KontenState,
  formData: FormData,
): Promise<KontenState> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const { sama } = pecah(formData);

  const hasil = programSchema.safeParse(sama);
  if (!hasil.success) {
    return {
      error: "Periksa kembali data yang diisi.",
      fieldErrors: galatPerField(hasil.error),
    };
  }

  const data = hasil.data;

  // Slug wajib unik. Bila admin mengosongkan atau tidak mengisinya,
  // slug dibuat otomatis dari nama dan dijamin unik dengan akhiran angka.
  const slugDiminta = data.slug.trim();
  const slug = slugDiminta.length > 0 ? slugDiminta : "";

  const finalSlug = slug
    ? slug
    : await slugUnik((k) => slugBentrok("programs", k, id), data.name);

  if (slug && (await slugBentrok("programs", slug, id))) {
    return {
      error: `Slug "${slug}" sudah dipakai program lain. Pilih slug berbeda.`,
      fieldErrors: { slug: ["Slug sudah dipakai."] },
    };
  }

  const sekarang = nowSeconds();

  // Nilai bersama untuk UPDATE; urutannya mengikuti nomor placeholder.
  const untukUbah = [
    data.name,
    data.summary,
    data.description,
    kosongkan(data.image_media_id),
    data.is_published ? 1 : 0,
    sekarang,
    finalSlug,
  ];

  if (id) {
    const ada = await db.execute({
      sql: "SELECT id FROM programs WHERE id = ?",
      args: [id],
    });
    if (ada.rows.length === 0) return { error: "Program tidak ditemukan." };

    await db.execute({
      sql: `UPDATE programs SET
              name = ?1, summary = ?2, description = ?3, image_media_id = ?4,
              is_published = ?5, updated_at = ?6, slug = ?7
            WHERE id = ?8`,
      args: [...untukUbah, id],
    });
  } else {
    // Urutan kolom INSERT: id, slug, name, summary, description,
    // image_media_id, sort_order, is_published, updated_at
    await db.execute({
      sql: `INSERT INTO programs (
              id, slug, name, summary, description, image_media_id,
              sort_order, is_published, updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`,
      args: [
        newId(),
        finalSlug,
        data.name,
        data.summary,
        data.description,
        kosongkan(data.image_media_id),
        await urutanBerikutnya("programs"),
        data.is_published ? 1 : 0,
        sekarang,
      ],
    });
  }

  updateTag(TAG.programs);
  redirect("/admin/programs?saved=1");
}

export async function hapusProgram(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await db.execute({ sql: "DELETE FROM programs WHERE id = ?", args: [id] });
  updateTag(TAG.programs);
  redirect("/admin/programs?deleted=1");
}

export async function geserProgram(formData: FormData): Promise<void> {
  await geserUmum(formData, "programs", TAG.programs);
}

/* -------------------------- Ekstrakurikuler ------------------------- */

export async function simpanEkstrakurikuler(
  _state: KontenState,
  formData: FormData,
): Promise<KontenState> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const { sama, schedule, coach } = pecah(formData);

  const hasil = ekstrakurikulerSchema.safeParse({ ...sama, schedule, coach });
  if (!hasil.success) {
    return {
      error: "Periksa kembali data yang diisi.",
      fieldErrors: galatPerField(hasil.error),
    };
  }

  const data = hasil.data;

  if (data.slug && (await slugBentrok("extracurriculars", data.slug, id))) {
    return {
      error: `Slug "${data.slug}" sudah dipakai ekstrakurikuler lain. Pilih slug berbeda.`,
      fieldErrors: { slug: ["Slug sudah dipakai."] },
    };
  }

  const slug =
    data.slug ||
    (await slugUnik((k) => slugBentrok("extracurriculars", k, id), data.name));

  const sekarang = nowSeconds();
  // Nilai bersama untuk UPDATE; urutannya mengikuti nomor placeholder.
  const kolom = [
    data.name,
    data.summary,
    data.description,
    data.schedule,
    data.coach,
    kosongkan(data.image_media_id),
    data.is_published ? 1 : 0,
    sekarang,
    slug,
  ];

  if (id) {
    const ada = await db.execute({
      sql: "SELECT id FROM extracurriculars WHERE id = ?",
      args: [id],
    });
    if (ada.rows.length === 0) return { error: "Ekstrakurikuler tidak ditemukan." };

    await db.execute({
      sql: `UPDATE extracurriculars SET
              name = ?1, summary = ?2, description = ?3, schedule = ?4,
              coach = ?5, image_media_id = ?6, is_published = ?7,
              updated_at = ?8, slug = ?9
            WHERE id = ?10`,
      args: [...kolom, id],
    });
  } else {
    await db.execute({
      sql: `INSERT INTO extracurriculars (
              id, slug, name, summary, description, schedule, coach,
              image_media_id, sort_order, is_published, updated_at
            ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)`,
      // Urutan kolom INSERT: id, slug, name, summary, description,
      // schedule, coach, image_media_id, sort_order, is_published, updated_at
      args: [
        newId(),
        slug,
        data.name,
        data.summary,
        data.description,
        data.schedule,
        data.coach,
        kosongkan(data.image_media_id),
        await urutanBerikutnya("extracurriculars"),
        data.is_published ? 1 : 0,
        sekarang,
      ],
    });
  }

  updateTag(TAG.extracurriculars);
  redirect("/admin/extracurriculars?saved=1");
}

export async function hapusEkstrakurikuler(formData: FormData): Promise<void> {
  await assertAdmin();
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await db.execute({ sql: "DELETE FROM extracurriculars WHERE id = ?", args: [id] });
  updateTag(TAG.extracurriculars);
  redirect("/admin/extracurriculars?deleted=1");
}

export async function geserEkstrakurikuler(formData: FormData): Promise<void> {
  await geserUmum(formData, "extracurriculars", TAG.extracurriculars);
}

/* ------------------------------ Umum -------------------------------- */

/**
 * Pindahkan satu baris satu tingkat, lalu tulis ulang seluruh urutan.
 * Nama tabel berasal dari konstanta di atas, bukan dari input pengguna,
 * sehingga aman dipakai apa adanya di dalam kueri.
 */
async function geserUmum(
  formData: FormData,
  tabel: "programs" | "extracurriculars",
  tag: string,
): Promise<void> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const arah = String(formData.get("arah") ?? "");
  if (!id || (arah !== "naik" && arah !== "turun")) return;

  const semua = await db.execute({
    sql: `SELECT id FROM ${tabel} ORDER BY sort_order ASC, name ASC`,
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
      sql: `UPDATE ${tabel} SET sort_order = ?1 WHERE id = ?2`,
      args: [index + 1, idBaris],
    })),
    "write",
  );

  updateTag(tag);
}
