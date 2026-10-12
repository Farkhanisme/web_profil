import {
  BATAS_PESAN_PER_JAM,
  JENDELA_PESAN_DETIK,
  galatPerField,
  kontakSchema,
} from "@/lib/schemas/message";

/**
 * Logika murni formulir kontak.
 *
 * Dipisah dari Server Action supaya bisa diuji tanpa menjalankan
 * Next.js. Tidak mengimpor apa pun dari server.
 */

export type HasilPeriksa =
  | { jenis: "spam" }
  | { jenis: "sah"; nama: string; kontak: string; isi: string }
  | { jenis: "salah"; fieldErrors: Record<string, string[]> };

/** Honeypot terisi berarti bot. */
export function periksaHoneypot(formData: FormData): boolean {
  return String(formData.get("website") ?? "").trim().length > 0;
}

/**
 * Periksa isi formulir tanpa efek samping.
 *
 * Honeypot diperiksa paling awal karena murah dan tidak menyentuh
 * database. Setelah itu baru validasi isi dengan Zod.
 */
export function periksaPesan(formData: FormData): HasilPeriksa {
  if (periksaHoneypot(formData)) return { jenis: "spam" };

  const hasil = kontakSchema.safeParse({
    name: formData.get("name"),
    contact: formData.get("contact"),
    body: formData.get("body"),
    website: "",
  });

  if (!hasil.success) {
    return { jenis: "salah", fieldErrors: galatPerField(hasil.error) };
  }

  return {
    jenis: "sah",
    nama: hasil.data.name,
    kontak: hasil.data.contact,
    isi: hasil.data.body,
  };
}

/** Susun teks notifikasi yang dikirim ke grup Telegram. */
export function teksNotifikasi(
  nama: string,
  kontak: string,
  isi: string,
): string {
  const potong = isi.length > 600 ? `${isi.slice(0, 600)}...` : isi;
  return [
    "Pesan baru dari situs",
    `Nama: ${nama}`,
    `Kontak: ${kontak}`,
    `Isi: ${potong}`,
  ].join("\n");
}

export { BATAS_PESAN_PER_JAM, JENDELA_PESAN_DETIK };