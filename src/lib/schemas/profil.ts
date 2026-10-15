import { z } from "zod";

/**
 * Validasi isi profil & identitas sekolah.
 *
 * Semua kolom bertipe teks boleh dikosongkan: kolom kosong berarti
 * "pengelola belum mengisi", dan halaman publik menyembunyikan bagian
 * yang kosong alih-alih menampilkan teks TODO.
 *
 * Batas panjang dipilih agar:
 *   - nilai yang tidak masuk akal (mis. alamat 5.000 karakter) ditolak
 *     lebih awal di sisi server, bukan tersimpan lalu merusak tampilan.
 */

/** Teks bebas, boleh kosong, maksimal `maks` karakter. */
function teks(maks: number, pesan: string) {
  return z
    .string()
    .trim()
    .max(maks, `${pesan} maksimal ${maks} karakter.`);
}

/** Nomor telepon: hanya angka, spasi, tanda plus, dan tanda hubung. */
const teleponSchema = z
  .string()
  .trim()
  .max(30, "Nomor telepon terlalu panjang.")
  .refine(
    (v) => v === "" || /^[+\d][\d\s()-]*$/.test(v),
    "Nomor telepon hanya boleh berisi angka, spasi, dan tanda + - ( ).",
  );

/** WhatsApp: format internasional tanpa tanda "+", contoh 6281234567890. */
const whatsappSchema = z
  .string()
  .trim()
  .refine(
    (v) => v === "" || /^\d{9,15}$/.test(v),
    "Nomor WhatsApp harus 9 sampai 15 digit angka tanpa tanda +, contoh 6281234567890.",
  );

/** Email: kosong atau bentuk email yang wajar. */
const emailSchema = z
  .string()
  .trim()
  .max(160, "Email terlalu panjang.")
  .refine(
    (v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    "Format email belum benar.",
  );

/** Tahun berdiri: kosong (0) atau tahun 4 digit yang masuk akal. */
const tahunSchema = z
  .union([z.literal(""), z.coerce.number().int()])
  .refine(
    (v) => v === "" || (v >= 1900 && v <= 2100),
    "Tahun berdiri harus antara 1900 sampai 2100.",
  );

/**
 * Koordinat desimal: kosong atau angka dalam rentang yang sah.
 *
 * Batas lintang ±90 dan bujur ±180, karena bujur di bumi menyeberang
 * 180 derajat sedangkan lintang berhenti di kutub.
 */
function koordinat(nama: string, batas: number) {
  return z
    .string()
    .trim()
    .refine(
      (v) => {
        if (v === "") return true;
        const n = Number(v);
        return Number.isFinite(n);
      },
      `${nama} harus berupa angka desimal, contoh -7.3975.`,
    )
    .refine(
      (v) => {
        if (v === "") return true;
        const n = Number(v);
        return n >= -batas && n <= batas;
      },
      `${nama} di luar rentang yang sah (-${batas} sampai ${batas}).`,
    );
}

/** Satu baris daftar (misi, sejarah,dst). Kosong diabaikan. */
function daftarBaris(maks: number, label: string) {
  return z
    .string()
    .trim()
    .max(maks, `${label} terlalu panjang.`);
}

/**
 * Skema utama. Satu berkas formulir untuk lima bagian, jadi pesan galat
 * dikembalikan per nama field agar admin tahu bagian mana yang perlu
 * diperbaiki.
 */
export const profilSchema = z.object({
  // Identitas
  name: teks(120, "Nama sekolah").min(1, "Nama sekolah wajib diisi."),
  short_name: teks(120, "Nama navigasi"),
  legal_name: teks(160, "Nama resmi"),
  tagline: teks(160, "Slogan"),
  description: teks(400, "Deskripsi singkat"),

  identity_status: teks(120, "Bentuk sekolah"),
  npsn: teks(30, "NPSN"),
  accreditation: teks(60, "Status akreditasi"),
  founded_year: tahunSchema,
  curriculum: teks(120, "Kurikulum"),
  founder: teks(120, "Lembaga pengusul"),

  // Kontak & lokasi
  street: teks(200, "Alamat jalan"),
  village: teks(120, "Desa atau kelurahan"),
  subdistrict: teks(120, "Kecamatan"),
  city: teks(120, "Kabupaten atau kota"),
  province: teks(120, "Provinsi"),
  postal_code: teks(10, "Kode pos"),
  geo_lat: koordinat("Lintang", 90),
  geo_lng: koordinat("Bujur", 180),
  phone: teleponSchema,
  email: emailSchema,
  whatsapp: whatsappSchema,
  students: z
    .string()
    .trim()
    .refine(
      (v) => v === "" || /^\d{1,6}$/.test(v),
      "Jumlah siswa harus berupa angka.",
    ),

  // Profil
  ringkasan: teks(1000, "Ringkasan profil"),
  sejarah: z.array(daftarBaris(1500, "Paragraf sejarah")).default([]),
  visi: teks(1000, "Visi"),
  misi: z.array(daftarBaris(1000, "Butir misi")).default([]),

  // Sambutan
  sambutan_nama: teks(160, "Nama kepala madrasah"),
  jabatan: teks(120, "Jabatan").optional(),
  sambutan_teks: z.array(daftarBaris(2000, "Paragraf sambutan")).default([]),

  // FAQ (pertanyaan & jawaban dikirim berpasangan lewat faq_json)
  faq_json: z
    .string()
    .trim()
    .max(20000, "Isi FAQ terlalu panjang.")
    .refine((v) => {
      if (v === "") return true;
      try {
        const data: unknown = JSON.parse(v);
        return (
          Array.isArray(data) &&
          data.every(
            (x) =>
              x &&
              typeof x === "object" &&
              typeof (x as { question?: unknown }).question === "string" &&
              typeof (x as { answer?: unknown }).answer === "string",
          )
        );
      } catch {
        return false;
      }
    }, "Format FAQ tidak valid.")
    .optional(),

  // Struktur & fasilitas dikirim sebagai JSON terstruktur
  struktur_json: z
    .string()
    .trim()
    .max(20000, "Daftar struktur terlalu panjang.")
    .optional(),
  fasilitas_json: z
    .string()
    .trim()
    .max(20000, "Daftar fasilitas terlalu panjang.")
    .optional(),
});

export type ProfilInput = z.infer<typeof profilSchema>;

/* ------------------------------------------------------------------ */
/* Skema per modul                                                    */
/* ------------------------------------------------------------------ */
/*
 * Modul CMS dipisah per halaman (Identitas, Teks Profil, Struktur,
 * Fasilitas, Pertanyaan Umum), tapi validasinya tetap satu sumber: tiap
 * modul mengambil subset field dari `profilSchema` dengan `.pick()`.
 * Aturan panjang karakter karena itu tidak pernah berbeda antar halaman.
 */

/** Nama, slogan, NPSN, alamat, peta, dan kontak. */
export const identitasSchema = profilSchema.pick({
  name: true,
  short_name: true,
  legal_name: true,
  tagline: true,
  description: true,
  identity_status: true,
  npsn: true,
  accreditation: true,
  founded_year: true,
  curriculum: true,
  founder: true,
  street: true,
  village: true,
  subdistrict: true,
  city: true,
  province: true,
  postal_code: true,
  geo_lat: true,
  geo_lng: true,
  phone: true,
  email: true,
  whatsapp: true,
  students: true,
});

/** Ringkasan, sejarah, visi, misi, dan sambutan kepala madrasah. */
export const profilTeksSchema = profilSchema.pick({
  ringkasan: true,
  sejarah: true,
  visi: true,
  misi: true,
  sambutan_nama: true,
  jabatan: true,
  sambutan_teks: true,
});

export const strukturSchema = profilSchema.pick({ struktur_json: true });
export const fasilitasSchema = profilSchema.pick({ fasilitas_json: true });
export const faqSchema = profilSchema.pick({ faq_json: true });

/** Pesan galat dikelompokkan per field, sesuai bentuk `state.fieldErrors`. */
export function galatPerField(galat: z.ZodError): Record<string, string[]> {
  const hasil: Record<string, string[]> = {};
  for (const isu of galat.issues) {
    const kunci = isu.path[0];
    if (typeof kunci === "string") (hasil[kunci] ??= []).push(isu.message);
  }
  return hasil;
}