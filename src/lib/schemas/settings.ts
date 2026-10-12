import { z } from "zod";
import { KONTRAS_MINIMUM, kontrasDenganPutih } from "@/lib/color";

/** Warna harus hex 6 digit, misalnya #047857. */
const hexSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, {
    error: "Format warna harus #047857 (6 digit heksadesimal).",
  });

/**
 * Warna utama: format benar DAN kontrasnya terhadap teks putih cukup.
 * Validasi kontras dipakai refined agar pesan yang muncul menyebut
 * angka kontrasnya, sehingga admin tahu persis mengapa ditolak.
 */
export const warnaUtamaSchema = hexSchema.superRefine((hex, ctx) => {
  const kontras = kontrasDenganPutih(hex);
  if (kontras < KONTRAS_MINIMUM) {
    ctx.addIssue({
      code: "custom",
      message: `Kontras ${kontras.toFixed(2)}:1 terlalu rendah. Warna utama harus minimal ${KONTRAS_MINIMUM}:1 terhadap teks putih.`,
    });
  }
});

/** Warna aksen: format benar saja, karena tidak dipakai sebagai latar teks putih. */
export const warnaAksenSchema = hexSchema;

export const temaSchema = z.object({
  theme_primary: warnaUtamaSchema,
  theme_accent: warnaAksenSchema,
});

export const logoSchema = z.object({
  logo_media_id: z.string().trim().max(40),
});

export type TemaInput = z.infer<typeof temaSchema>;

export function galatPerField(galat: z.ZodError): Record<string, string[]> {
  const hasil: Record<string, string[]> = {};
  for (const isu of galat.issues) {
    const kunci = isu.path[0];
    if (typeof kunci === "string") (hasil[kunci] ??= []).push(isu.message);
  }
  return hasil;
}