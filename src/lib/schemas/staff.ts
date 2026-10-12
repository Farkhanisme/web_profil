import { z } from "zod";

/**
 * Skema validasi formulir guru/staf.
 *
 * Dipisah dari Server Action supaya bisa diuji langsung tanpa perlu
 * mengirim permintaan HTTP.
 */
export const staffSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { error: "Nama minimal 3 karakter." })
    .max(120, { error: "Nama maksimal 120 karakter." }),
  position: z.string().trim().max(120, { error: "Jabatan maksimal 120 karakter." }),
  subject: z.string().trim().max(160, { error: "Mata pelajaran maksimal 160 karakter." }),
  /** Id media, boleh kosong bila foto tidak diunggah. */
  photo_media_id: z.string().trim().max(40),
  is_published: z.boolean(),
});

export type StaffInput = z.infer<typeof staffSchema>;

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
  return {
    name: formData.get("name"),
    position: formData.get("position") ?? "",
    subject: formData.get("subject") ?? "",
    photo_media_id: formData.get("photo_media_id") ?? "",
    // Checkbox tidak terkirim ketika tidak dicentang.
    is_published: formData.get("is_published") === "on",
  };
}
