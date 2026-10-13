/**
 * Bentuk data "isi situs" dan profil.
 *
 * Originally ada di `src/config/site.ts` dan `src/config/profil.ts` sebagai
 * konstanta. Sekarang keduanya diperluas dari CMS, sehingga bentuk datanya
 * dideklarasikan di sini sebagai interface agar bisa dipakai bersama oleh:
 *   - nilai bawaan (konfigurasi di dalam repo),
 *   - hasil penggabungan dari database,
 *   - helper alamat/peta yang menerima datanya sebagai argumen.
 *
 * Helper di sini sengaja menerima `situs` sebagai parameter (bukan
 * membaca konstanta global) supaya pemanggil yang sudah punya data dari
 * database tidak perlu melakukan penggabungan dua kali.
 */

export interface IsiSitus {
  name: string;
  shortName: string;
  legalName: string;
  tagline: string;
  description: string;
  /** URL dasar dari env; tidak diubah lewat CMS. */
  url: string;
  identity: {
    npsn: string;
    accreditation: string;
    status: string;
    /** 0 berarti belum diisi — disembunyikan dari halaman & JSON-LD. */
    foundedYear: number;
    curriculum: string;
    founder: string;
  };
  address: {
    street: string;
    village: string;
    subdistrict: string;
    city: string;
    province: string;
    postalCode: string;
    country: string;
  };
  geo: {
    latitude: number;
    longitude: number;
  };
  contact: {
    phone: string;
    email: string;
    whatsapp: string;
  };
  /** Jam layanan. Tetap di kode karena jarang berubah dan bentuknya tetap. */
  openingHours: JamLayanan[];
  /** Tautan resmi di luar situs ini (JSON-LD `sameAs`). Tetap di kode. */
  sameAs: string[];
  stats: {
    students: number;
  };
}

export interface JamLayanan {
  days: string[];
  opens: string;
  closes: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface OrgMember {
  name: string;
  position: string;
}

export interface FasilitasItem {
  name: string;
  description: string;
}

export interface Sambutan {
  nama: string;
  jabatan: string;
  /** Satu elemen = satu paragraf. */
  teks: string[];
}

export interface IsiProfil {
  ringkasan: string;
  sejarah: string[];
  visi: string;
  misi: string[];
  sambutan: Sambutan;
  struktur: OrgMember[];
  fasilitas: FasilitasItem[];
  faq: FaqItem[];
  /** Tanggal ISO (YYYY-MM-DD) untuk "diperbarui terakhir". */
  updatedAt: string;
}

/* ------------------------------------------------------------------ */
/* Helper                                                              */
/* ------------------------------------------------------------------ */

/**
 * "True" bila nilai masih berupa placeholder bawaan repo.
 * Nilai seperti ini tidak pernah ditampilkan ke pengunjung.
 */
export function masihPlaceholder(nilai: string): boolean {
  const n = nilai.trim();
  return !n || n.startsWith("TODO") || n.startsWith("DRAF");
}

/**
 * True bila nilai sudah terisi di CMS (tidak kosong dan bukan placeholder).
 * Dipakai halaman publik agar hanya menampilkan yang memang diisi pengelola.
 */
export function terisi(nilai: string | null | undefined): nilai is string {
  return typeof nilai === "string" && !masihPlaceholder(nilai.trim());
}

/**true bila tahun berdiri sudah diisi (> 0). */
export function tahunTerisi(tahun: number): boolean {
  return Number.isFinite(tahun) && tahun > 0;
}

/** True bila ada nomor telepon yang layak ditampilkan. */
export function teleponTerisi(contact: IsiSitus["contact"]): boolean {
  return terisi(contact.phone);
}

/** True bila ada nomor WhatsApp yang layak. */
export function whatsappTerisi(contact: IsiSitus["contact"]): boolean {
  return terisi(contact.whatsapp) && /\d{8,}/.test(contact.whatsapp);
}

/**
 * Wilayah singkat, mis. "Kejajar, Kabupaten Wonosobo, Jawa Tengah".
 *
 * Bagian yang masih berupa placeholder dilewati, sehingga teks "TODO"
 * tidak pernah muncul di halaman publik.
 */
export function wilayahSingkat(s: IsiSitus): string {
  const a = s.address;
  return [a.subdistrict, a.city, a.province]
    .filter((b) => terisi(b))
    .join(", ");
}

/**
 * Alamat satu baris, sama persis dengan yang muncul di footer, JSON-LD,
 * dan llms.txt. Konsistensi NAP penting karena mesin AI membandingkan
 * beberapa sumber sekaligus.
 */
export function alamatSatuBaris(s: IsiSitus): string {
  const a = s.address;
  return [a.street, a.village, a.subdistrict, a.city, a.province]
    .filter((bagian) => bagian && !bagian.startsWith("TODO"))
    .join(", ");
}

/** Tautan "Buka di Google Maps". */
export function petaLinkUrl(s: IsiSitus): string {
  const { latitude, longitude } = s.geo;
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}

/** Tautan embed Google Maps tanpa API key (dipakai di <iframe>). */
export function petaEmbedUrl(s: IsiSitus): string {
  const { latitude, longitude } = s.geo;
  return `https://www.google.com/maps?q=${latitude},${longitude}&hl=id&z=15&output=embed`;
}

/**
 * Tautan chat WhatsApp (wa.me).
 *
 * Nomor harus berformat internasional tanpa tanda "+". Bila nomor belum
 * diisi, mengembalikan null supaya pemanggil menyembunyikan tombolnya
 * alih-alih menautkan ke halaman yang rusak.
 */
export function waLinkUrl(
  s: IsiSitus,
  pesan = "Assalamu'alaikum, saya ingin bertanya tentang MTs Ma'arif Tieng.",
): string | null {
  if (!whatsappTerisi(s.contact)) return null;
  const nomor = s.contact.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${nomor}?${new URLSearchParams({ text: pesan })}`;
}

/** Nomor telepon tanpa spasi, untuk atribut href="tel:". */
export function teleponHref(s: IsiSitus): string {
  return `tel:${s.contact.phone.replace(/\s/g, "")}`;
}