/**
 * Konfigurasi identitas & data tetap sekolah.
 *
 * Semua nilai di sini dipakai bersama oleh: halaman publik, footer NAP,
 * metadata SEO, JSON-LD, sitemap, dan /llms.txt. Pastikan NAP (nama, alamat,
 * telepon) konsisten di mana pun — mesin AI mengutip dari beberapa sumber.
 *
 * TODO(SEKOLAH): ganti seluruh nilai bertanda TODO dengan data resmi sekolah.
 */

export const site = {
  /** Nama resmi, persis sama dengan di NPSN/EMIS */
  name: "MTs Ma'arif Tieng",
  /** Nama untuk judul tab dan navigasi */
  shortName: "MTs Ma'arif Tieng",
  /** Bentuk deklaratif agar mudah dikutip mesin AI */
  legalName: "Madrasah Tsanawiyah Ma'arif Tieng",
  tagline: "Berakhlak, Berilmu, Berprestasi",
  description:
    "MTs Ma'arif Tieng adalah madrasah tsanawiyah swasta di Secangkang, Kabupaten Sik, Kalimantan Timur. Menyediakan pendidikan Islam terpadu yang menggabungkan ilmu agama dan ilmu pengetahuan umum.",

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
    village: "TODO Kelurahan",
    subdistrict: "Secangkang",
    city: "TODO Kabupaten",
    province: "Kalimantan Timur",
    postalCode: "TODO Kode pos",
    country: "ID",
  },

  /** Koordinat desimal untuk peta dan JSON-LD `geo` */
  geo: {
    latitude: Number(-0.4905),
    longitude: Number(117.3702),
  },

  contact: {
    phone: "TODO nomor telepon",
    /** Email resmi sekolah */
    email: "TODO email sekolah",
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
  ] as const,

  /** Tautan resmi sekolah di luar situs ini (JSON-LD `sameAs`) */
  sameAs: [
    "TODO URL Facebook resmi sekolah",
    "TODO URL YouTube resmi sekolah",
    "TODO URL Instagram resmi sekolah",
  ],

  /** Statistik beranda — boleh diperbarui tiap tahun oleh admin */
  stats: {
    students: 0, // TODO
    teachers: 0, // TODO
    extracurriculars: 0, // TODO
    foundedYear: 0, // TODO
  },
} as const;

export type SiteConfig = typeof site;

/** Nama environmentally: "Secangkang, Kabupaten Sik" (dipakai di GEO & JSON-LD) */
export function wilayahSingkat(): string {
  const a = site.address;
  return [a.subdistrict, a.city, a.province].filter(Boolean).join(", ");
}

/** Alamat satu baris, sama persis dengan yang muncul di footer & JSON-LD */
export function alamatSatuBaris(): string {
  const a = site.address;
  return [a.street, a.village, a.subdistrict, a.city, a.province]
    .filter((part) => part && !String(part).startsWith("TODO"))
    .join(", ");
}

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

/** Tautan embed Google Maps tanpa API key */
export function petaEmbedUrl(): string {
  const { latitude, longitude } = site.geo;
  return `https://www.google.com/maps?q=${latitude},${longitude}&hl=id&z=15&output=embed`;
}

/** Tautan "Buka di Google Maps" */
export function petaLinkUrl(): string {
  const { latitude, longitude } = site.geo;
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
