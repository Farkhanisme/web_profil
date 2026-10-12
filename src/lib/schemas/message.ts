import { z } from "zod";

/**
 * Skema validasi formulir kontak.
 *
 * Kolom `website` adalah jebakan bot (honeypot): tidak terlihat oleh
 * manusia, tetapi bot biasanya mengisinya. Bila terisi, pesan dianggap
 * spam dan tidak disimpan.
 */
export const kontakSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, { error: "Nama minimal 2 karakter." })
    .max(120, { error: "Nama maksimal 120 karakter." }),

  /** Email ATAU nomor telepon. Tidak wajib keduanya, tapi wajib salah satu. */
  contact: z
    .string()
    .trim()
    .min(5, { error: "Isi email atau nomor telepon Anda." })
    .max(160, { error: "Kontak maksimal 160 karakter." })
    .refine(
      (v) => looksLikeEmail(v) || looksLikeTelepon(v),
      "Isi dengan alamat email yang sah atau nomor telepon yang sah.",
    ),

  body: z
    .string()
    .trim()
    .min(10, { error: "Pesan minimal 10 karakter." })
    .max(3000, { error: "Pesan maksimal 3000 karakter." }),

  /** Honeypot: harus kosong. */
  website: z.string().max(200).optional().default(""),
});

export type KontakInput = z.infer<typeof kontakSchema>;

function looksLikeEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

function looksLikeTelepon(v: string): boolean {
  const angka = v.replace(/[^\d+]/g, "");
  return angka.length >= 8 && angka.length <= 20;
}

export function galatPerField(galat: z.ZodError): Record<string, string[]> {
  const hasil: Record<string, string[]> = {};
  for (const isu of galat.issues) {
    const kunci = isu.path[0];
    if (typeof kunci === "string") (hasil[kunci] ??= []).push(isu.message);
  }
  return hasil;
}

/** Batas pesan per jam per alamat IP. */
export const BATAS_PESAN_PER_JAM = 5;
export const JENDELA_PESAN_DETIK = 60 * 60;