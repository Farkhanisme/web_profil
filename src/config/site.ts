import type { IsiSitus } from "@/lib/konten";

/**
 * Konfigurasi identitas & data tetap sekolah.
 *
 * PERAN PENTING: file ini adalah NILAI BAWAAN, bukan sumber kebenaran.
 * Semua teks di sini dapat diubah pengelola lewat CMS
 * (`/admin/profil`). `src/lib/queries/profil.ts` membaca database lalu
 * menyambungkan setiap kolom kosong dengan nilai di bawah, sehingga:
 *   - situs yang belum pernah disentuh CMS tampil persis seperti ini,
 *   - tidak ada konten yang hilang saat fitur CMS dipasang.
 *
 * Yang TIDAK bisa diubah lewat CMS (bernilai teknis atau tidak pernah berubah):
 *   - `url` (dari env), `openingHours`, `sameAs`, `address.country`.
 *
 * TODO(SEKOLAH): nilai bertanda TODO di bawah hanya dipakai sebagai
 * cadangan. Setelah diisi lewat CMS, nilai di sini tidak lagi tampil.
 */

export const site: IsiSitus = {
  /** Nama resmi, persis sama dengan di NPSN/EMIS */
  name: "MTs Ma'arif Tieng",
  /** Nama untuk judul tab dan navigasi */
  shortName: "MTs Ma'arif Tieng",
  /** Bentuk deklaratif agar mudah dikutip mesin AI */
  legalName: "Madrasah Tsanawiyah Ma'arif Tieng",
  tagline: "Berakhlak, Berilmu, Berprestasi",
  description:
    "MTs Ma'arif Tieng adalah madrasah tsanawiyah swasta di Desa Tieng, Kecamatan Kejajar, Kabupaten Wonosobo. Menyediakan pendidikan Islam terpadu yang menggabungkan ilmu agama dan ilmu pengetahuan umum.",

  /**
   * URL dasar situs untuk metadata & canonical.
   * Di produksi isi dengan domain .sch.id; bila kosong, otomatis memakai
   * URL yang disediakan Vercel (VERCEL_PROJECT_PRODUCTION_URL).
   */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "",

  identity: {
    npsn: "TODO-NPSN",
    accreditation: "TODO-Akreditasi",
    status: "Madrasah Tsanawiyah Swasta",
    /** 0 berarti belum diisi — disembunyikan dari halaman & JSON-LD */
    foundedYear: 0,
    curriculum: "Kurikulum Merdeka Madrasah",
    /** Nama lembaga pengusul */
    founder: "LP Ma'arif NU",
  },

  address: {
    street: "TODO Nama jalan dan nomor",
    village: "Tieng",
    subdistrict: "Kejajar",
    city: "Kabupaten Wonosobo",
    province: "Jawa Tengah",
    postalCode: "TODO Kode pos",
    country: "ID",
  },

  /**
   * Koordinat desimal untuk peta dan JSON-LD `geo`.
   * Perkiraan pusat Desa Tieng, Kejajar — ganti dengan koordinat
   * titik pasti gedung sekolah sebelum rilis.
   */
  geo: {
    latitude: Number(-7.3975),
    longitude: Number(109.9736),
  },

  contact: {
    phone: "TODO nomor telepon",
    /** Email resmi sekolah */
    email: "TODO email sekolah",
    /**
     * Nomor WhatsApp sekolah dalam format internasional tanpa tanda "+".
     *
     * PENTING: nilai bawaan sengaja berupa placeholder. Sebelumnya di sini
     * ada angka contoh (6281234567890) yang lolos pemeriksaan dan membuat
     * tombol "Chat WhatsApp" mengarah ke nomor milik orang lain. Selama
     * nomor ini masih placeholder, tombol WhatsApp disembunyikan di seluruh
     * halaman (lihat `whatsappTerisi`).
     */
    whatsapp: "TODO nomor WhatsApp sekolah (format internasional tanpa +)",
  },

  /** Jam layanan — dipakai untuk JSON-LD `openingHoursSpecification` */
  openingHours: [
    {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:00",
      closes: "15:00",
    },
    {
      days: ["Saturday"],
      opens: "07:00",
      closes: "12:00",
    },
  ],

  /**
   * Tautan resmi sekolah di luar situs ini (JSON-LD `sameAs`).
   * TODO(SEKOLAH): ganti bila sudah ada kanal resmi.
   */
  sameAs: [
    "TODO URL Facebook resmi sekolah",
    "TODO URL YouTube resmi sekolah",
    "TODO URL Instagram resmi sekolah",
  ],

  /**
   * Statistik beranda.
   * Jumlah guru dan ekstrakurikuler diambil dari database sehingga selalu
   * sinkron dengan isi situs, jadi tidak ada di sini.
   */
  stats: {
    students: 0,
  },
};

export type SiteConfig = typeof site;

/** URL absolut untuk canonical/OG. Fallback ke domain Vercel saat env kosong. */
export function baseUrl(): string {
  const fromEnv =
    site.url ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return "http://localhost:3000";
}

export function absoluteUrl(path: string): string {
  return `${baseUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}