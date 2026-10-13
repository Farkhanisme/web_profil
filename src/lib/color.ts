/**
 * Utilitas warna: kontras WCAG, penurunan warna turunan, dan preset.
 *
 * Semua perhitungan dilakukan di server (dan di peramban untuk pratinjau)
 * memakai rumus yang sama agar hasil akhirnya tidak berbeda.
 */

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const POLA_HEX = /^#[0-9a-fA-F]{6}$/;

/** Hanya menerima hex 6 digit, misalnya #047857. */
export function hexValid(hex: string): boolean {
  return POLA_HEX.test(hex.trim());
}

/** Ubah #RRGGBB menjadi komponen 0..255. Null bila format salah. */
export function hexKeRgb(hex: string): Rgb | null {
  const bersih = hex.trim().replace(/^#/, "");
  if (!POLA_HEX.test(`#${bersih}`)) return null;
  return {
    r: parseInt(bersih.slice(0, 2), 16),
    g: parseInt(bersih.slice(2, 4), 16),
    b: parseInt(bersih.slice(4, 6), 16),
  };
}

function keHex(nilai: number): string {
  const n = Math.max(0, Math.min(255, Math.round(nilai)));
  return n.toString(16).padStart(2, "0");
}

export function rgbKeHex({ r, g, b }: Rgb): string {
  return `#${keHex(r)}${keHex(g)}${keHex(b)}`;
}

/** Normalisasi ke bentuk #RRGGBB huruf kecil. */
export function normalisasiHex(hex: string): string {
  const rgb = hexKeRgb(hex);
  return rgb ? rgbKeHex(rgb) : hex.trim().toLowerCase();
}

/* ------------------------------- Kontras ------------------------------ */

/** Kecerahan relatif menurut WCAG 2.1. */
export function kecerahanRelatif({ r, g, b }: Rgb): number {
  const komponen = (nilai: number): number => {
    const c = nilai / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * komponen(r) + 0.7152 * komponen(g) + 0.0722 * komponen(b);
}

/** Rasio kontras antara dua warna (1 sampai 21). */
export function rasioKontras(a: Rgb, b: Rgb): number {
  const la = kecerahanRelatif(a);
  const lb = kecerahanRelatif(b);
  const terang = Math.max(la, lb);
  const gelap = Math.min(la, lb);
  return (terang + 0.05) / (gelap + 0.05);
}

/** Rasio kontras warna teks di atas latar. */
export function kontrasDenganPutih(hex: string): number {
  const rgb = hexKeRgb(hex);
  if (!rgb) return 0;
  return rasioKontras(rgb, { r: 255, g: 255, b: 255 });
}

/** Rasio kontras warna teks di atas latar gelap. */
export function kontrasDenganGelap(hex: string): number {
  const rgb = hexKeRgb(hex);
  if (!rgb) return 0;
  return rasioKontras(rgb, { r: 17, g: 17, b: 17 });
}

/* ---------------------------- Warna turunan --------------------------- */

/** Campur warna dengan putih (rasio 0..1, 1 = putih penuh). */
export function campurDenganPutih(hex: string, rasio: number): string {
  const rgb = hexKeRgb(hex);
  if (!rgb) return hex;
  return rgbKeHex({
    r: rgb.r + (255 - rgb.r) * rasio,
    g: rgb.g + (255 - rgb.g) * rasio,
    b: rgb.b + (255 - rgb.b) * rasio,
  });
}

/** Gelapkan warna dengan mencampurkan hitam (rasio 0..1). */
export function gelapkan(hex: string, rasio: number): string {
  const rgb = hexKeRgb(hex);
  if (!rgb) return hex;
  return rgbKeHex({
    r: rgb.r * (1 - rasio),
    g: rgb.g * (1 - rasio),
    b: rgb.b * (1 - rasio),
  });
}

/**
 * Warna teks yang layak di atas warna latar.
 * Dipakai agar tombol tetap terbaca dengan warna merek apa pun.
 */
export function warnaTeksDiAtas(hex: string): string {
  const denganPutih = kontrasDenganPutih(hex);
  const denganGelap = kontrasDenganGelap(hex);
  return denganPutih >= denganGelap ? "#ffffff" : "#111111";
}

/**
 * Kontras terbaik antara teks putih dan teks gelap di atas sebuah warna.
 *
 * Berbeda dengan `kontrasDenganPutih`, fungsi ini membolehkan warna terang
 * dengan teks gelap. Dipakai untuk warna ketiga yang bisa dipakai sebagai
 * latar blok penuh.
 */
export function kontrasTerbaik(hex: string): number {
  return Math.max(kontrasDenganPutih(hex), kontrasDenganGelap(hex));
}

/** Warna latar Empuk: versi sangat tipis dari warna merek. */
export function warnaEmpuk(hex: string): string {
  return campurDenganPutih(hex, 0.92);
}

/* ------------------------------- Tema --------------------------------- */

export interface VariabelTema {
  primary: string;
  primaryHover: string;
  primarySoft: string;
  onPrimary: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  /** Warna ketiga: untuk blok warna penuh dan sorotan tambahan. */
  alt: string;
  altSoft: string;
  onAlt: string;
}

/**
 * Hitung seluruh turunan dari tiga warna yang dipilih admin.
 *
 * `alt` boleh dikosongkan oleh pemanggil lama; saat itu dipakai warna
 * bawaan agar tidak pernah ada blok tanpa warna.
 */
export function hitungTema(
  primary: string,
  accent: string,
  alt?: string,
): VariabelTema {
  const altHex = alt ? normalisasiHex(alt) : BAWAAN.alt;
  return {
    primary: normalisasiHex(primary),
    primaryHover: gelapkan(normalisasiHex(primary), 0.16),
    primarySoft: warnaEmpuk(primary),
    onPrimary: warnaTeksDiAtas(primary),
    accent: normalisasiHex(accent),
    accentSoft: warnaEmpuk(accent),
    onAccent: warnaTeksDiAtas(accent),
    alt: altHex,
    altSoft: warnaEmpuk(altHex),
    onAlt: warnaTeksDiAtas(altHex),
  };
}

/** Nilai bawaan, sama dengan yang dipakai migrasi 0001_init.sql. */
export const BAWAAN = {
  primary: "#047857",
  accent: "#b45309",
  alt: "#9d174d",
} as const;

/**
 * Preset palet untuk admin non-teknis.
 * Hanya memuat warna yang lolos uji kontras 4,5:1 (dicek di
 * scripts/uji-warna.ts).
 */
export const PRESET = [
  { nama: "Hijau", primary: "#047857", accent: "#b45309" },
  { nama: "Teal", primary: "#0f766e", accent: "#b45309" },
  { nama: "Biru", primary: "#1d4ed8", accent: "#b45309" },
  { nama: "Maroon", primary: "#9f1239", accent: "#c2410c" },
  { nama: "Ungu", primary: "#6d28d9", accent: "#c2410c" },
  { nama: "Hijau tua", primary: "#166534", accent: "#a16207" },
] as const;

/**
 * Pilihan untuk warna ketiga.
 *
 * Hue-nya sengaja jauh dari hijau merek dan dari emas aksen, supaya blok
 * berwarna ketiga benar-benar menambah warna, bukan mengulang yang sudah ada.
 */
export const PRESET_KETIGA = [
  { nama: "Marong", alt: "#9d174d" },
  { nama: "Biru", alt: "#1e40af" },
  { nama: "Terakota", alt: "#9a3412" },
  { nama: "Ungu", alt: "#5b21b6" },
] as const;

/** Batas kontras minimum untuk warna utama. */
export const KONTRAS_MINIMUM = 4.5;

/** Pesan galat yang bisa langsung ditampilkan ke admin. */
export function periksaWarnaUtama(hex: string): string | null {
  if (!hexValid(hex)) return "Format warna harus seperti #047857 (6 digit heksadesimal).";
  if (kontrasDenganPutih(hex) < KONTRAS_MINIMUM) {
    return `Kontras ${kontrasDenganPutih(hex).toFixed(2)}:1 terlalu rendah. Warna utama perlu minimal ${KONTRAS_MINIMUM}:1 terhadap teks putih.`;
  }
  return null;
}

export function periksaWarnaAksen(hex: string): string | null {
  if (!hexValid(hex)) return "Format warna harus seperti #b45309 (6 digit heksadesimal).";
  return null;
}

/**
 * Warna ketiga.
 *
 * boleh terang dengan teks gelap, jadi yang diperiksa adalah kontras
 * terbaik terhadap putih atau gelap. Kalau tidak lolos, warna itu akan
 * dipakai sebagai latar blok dan teksnya jadi sulit dibaca.
 */
export function periksaWarnaKetiga(hex: string): string | null {
  if (!hexValid(hex)) return "Format warna harus seperti #9d174d (6 digit heksadesimal).";
  const kontras = kontrasTerbaik(hex);
  if (kontras < KONTRAS_MINIMUM) {
    return `Kontras ${kontras.toFixed(2)}:1 terlalu rendah. Warna ketiga dipakai sebagai latar blok, jadi perlu minimal ${KONTRAS_MINIMUM}:1 terhadap teks terang atau gelap.`;
  }
  return null;
}