import { z } from "zod";
import { slugValid } from "@/lib/slug";

/**
 * Skema validasi formulir program sekolah dan ekstrakurikuler.
 *
 * Program dan ekstrakurikuler memakai skema yang sama, kecuali
 * ekstrakurikuler menambah dua kolom: jadwal dan pembina.
 */

const dasar = {
  name: z
    .string()
    .trim()
    .min(3, { error: "Nama minimal 3 karakter." })
    .max(120, { error: "Nama maksimal 120 karakter." }),
  slug: z
    .string()
    .trim()
    .min(1, { error: "Slug wajib diisi." })
    .refine(slugValid, {
      error: "Slug hanya boleh huruf kecil, angka, dan tanda hubung.",
    }),
  summary: z
    .string()
    .trim()
    .max(300, { error: "Ringkasan maksimal 300 karakter." })
    .default(""),
  description: z.string().trim().max(20_000).default(""),
  image_media_id: z.string().trim().max(40).default(""),
  is_published: z.boolean(),
};

export const programSchema = z.object(dasar);

export const ekstrakurikulerSchema = z.object({
  ...dasar,
  schedule: z
    .string()
    .trim()
    .max(160, { error: "Jadwal maksimal 160 karakter." })
    .default(""),
  coach: z.string().trim().max(120).default(""),
});

export type ProgramInput = z.infer<typeof programSchema>;
export type EkstrakurikulerInput = z.infer<typeof ekstrakurikulerSchema>;

/** Kumpulkan pesan galat per nama field untuk ditampilkan di bawah input. */
export function galatPerField(galat: z.ZodError): Record<string, string[]> {
  const hasil: Record<string, string[]> = {};
  for (const isu of galat.issues) {
    const kunci = isu.path[0];
    if (typeof kunci === "string") (hasil[kunci] ??= []).push(isu.message);
  }
  return hasil;
}

/** Teks kosong dari kolom teks diubah menjadi null. */
export function kosongkan(nilai: string): string | null {
  const v = nilai.trim();
  return v.length > 0 ? v : null;
}

/** Bentuk objek dari FormData mentah. */
export function dariFormData(formData: FormData) {
  const dasar = {
    name: formData.get("name"),
    slug: formData.get("slug"),
    summary: formData.get("summary") ?? "",
    description: formData.get("description") ?? "",
    image_media_id: formData.get("image_media_id") ?? "",
    is_published: formData.get("is_published") === "on",
  };

  return {
    ...dasar,
    schedule: formData.get("schedule") ?? "",
    coach: formData.get("coach") ?? "",
  };
}

/** Pisahkan bagian yang sama dan bagian khusus ekstrakurikuler. */
export function pecah(formData: FormData) {
  const semua = dariFormData(formData);
  const { schedule, coach, ...sama } = semua;
  return { sama, schedule, coach };
}
