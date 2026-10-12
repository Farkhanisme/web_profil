import { z } from "zod";
import { slugValid } from "@/lib/slug";

/** Skema validasi formulir album galeri. */
export const albumSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { error: "Judul album minimal 3 karakter." })
    .max(140, { error: "Judul album maksimal 140 karakter." }),
  slug: z
    .string()
    .trim()
    .refine((v) => v.length === 0 || slugValid(v), {
      error: "Slug hanya boleh huruf kecil, angka, dan tanda hubung.",
    }),
  description: z.string().trim().max(2000).default(""),
  cover_media_id: z.string().trim().max(40).default(""),
});

export type AlbumInput = z.infer<typeof albumSchema>;

/** Skema saat menyisipkan satu foto ke dalam album. */
export const sisipFotoSchema = z.object({
  albumId: z.string().trim().min(1, { error: "Album tidak dikenal." }),
  mediaId: z.string().trim().min(1, { error: "Gambar tidak dikenal." }),
  caption: z.string().trim().max(200).default(""),
});

/** Skema saat mengubah keterangan satu foto. */
export const ubahKeteranganSchema = z.object({
  photoId: z.string().trim().min(1, { error: "Foto tidak dikenal." }),
  caption: z.string().trim().max(200, { error: "Keterangan maksimal 200 karakter." }),
});

/** Skema saat memilih sampul album. */
export const pilihSampulSchema = z.object({
  albumId: z.string().trim().min(1, { error: "Album tidak dikenal." }),
  mediaId: z.string().trim().max(40),
});

export function galatPerField(galat: z.ZodError): Record<string, string[]> {
  const hasil: Record<string, string[]> = {};
  for (const isu of galat.issues) {
    const kunci = isu.path[0];
    if (typeof kunci === "string") (hasil[kunci] ??= []).push(isu.message);
  }
  return hasil;
}

export function kosongkan(nilai: string): string | null {
  const v = nilai.trim();
  return v.length > 0 ? v : null;
}
