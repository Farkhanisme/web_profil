import type { Metadata } from "next";
import { site, baseUrl } from "@/config/site";
import { pengaturanSitus } from "@/lib/queries/settings";

/**
 * Pembantu metadata untuk SEO.
 *
 * Aturan yang dijaga di sini:
 *   1. Judul maksimal 60 karakter, termasuk nama sekolah.
 *   2. Deskripsi 140 sampai 160 karakter.
 *   3. Setiap halaman punya canonical dan Open Graph yang lengkap.
 *   4. Gambar Open Graph memakai lebar yang diizinkan proxy media.
 */

export const JUDUL_MAKS = 60;
export const DESKRIPSI_MIN = 140;
export const DESKRIPSI_MAKS = 160;

/** Akhiran yang ditambahkan nama sekolah pada setiap judul halaman. */
const AKHIRAN = ` | ${site.name}`;

/**
 * Judul halaman TANPA nama sekolah.
 *
 * Nama sekolah ditambahkan otomatis oleh `title.template` di layout root.
 * Karena itu yang dikembalikan di sini hanya bagian pendeknya, agar
 * hasil akhir tidak melebihi 60 karakter dan nama sekolah tidak terulang.
 */
export function judulPendek(judulHalaman: string): string {
  const batas = JUDUL_MAKS - AKHIRAN.length;
  const teks = judulHalaman.trim();
  if (teks.length <= batas) return teks;
  return `${potongDiKata(teks, batas)}…`;
}

/** Judul lengkap untuk Open Graph dan Twitter, yang tidak memakai template. */
export function judulLengkap(judulHalaman: string): string {
  return `${judulPendek(judulHalaman)}${AKHIRAN}`;
}

/** Deskripsi bawaan untuk halaman tanpa deskripsi khusus. */
export const DESKRIPSI_UMUM = site.description;

/**
 * Pastikan deskripsi berada di rentang yang dibaca mesin pencari:
 * minimal 140 dan maksimal 160 karakter.
 *
 * Teks terlalu panjang dipangkas di batas kata. Teks terlalu pendek
 * dilengkapi kalimat pendukung satu per satu sampai cukup panjang.
 */
export function deskripsi(teks: string | undefined | null): string {
  const asal = (teks ?? "").trim() || DESKRIPSI_UMUM;

  // Buang fragmen placeholder lebih dulu. Tanpa ini, meta description
  // bisa memuat "TODO Kabupaten" yang terbaca mesin pencari.
  const bersih = asal
    .replace(/\b(?:TODO|DRAF)\b[^.,;)]*[.,;)]?/gi, "")
    .replace(/\s*,\s*,/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/\s+/g, " ")
    .replace(/^\s*[,.;:]\s*/, "")
    .trim();

  if (bersih.length >= DESKRIPSI_MIN && bersih.length <= DESKRIPSI_MAKS) {
    return bersih;
  }

  if (bersih.length > DESKRIPSI_MAKS) {
    return potongDiKata(bersih, DESKRIPSI_MAKS - 1);
  }

  // Terlalu pendek: tambahkan kalimat pendukung satu per satu.
  let hasil = bersih;
  for (const tambahan of kalimatPendukung()) {
    if (hasil.length >= DESKRIPSI_MIN) break;
    if (!hasil.endsWith(".")) hasil += ".";
    hasil += ` ${tambahan}`;
  }

  if (hasil.length > DESKRIPSI_MAKS) {
    return potongDiKata(hasil, DESKRIPSI_MAKS - 1);
  }

  return hasil;
}

/**
 * Kalimat pendukung untuk deskripsi yang terlalu pendek.
 *
 * Bagian yang masih berupa placeholder dilewati, sehingga kata "TODO"
 * tidak pernah bocor ke meta description yang dibaca mesin pencari.
 */
function kalimatPendukung(): string[] {
  const daftar: string[] = [];
  const wilayah = wilayahBersih();

  if (wilayah) daftar.push(`${site.name} berada di ${wilayah}.`);
  if (site.identity.status && !site.identity.status.startsWith("TODO")) {
    daftar.push(`${site.identity.status} dengan ${site.identity.curriculum}.`);
  }
  if (site.identity.foundedYear > 0) {
    daftar.push(`Berdiri sejak ${site.identity.foundedYear}.`);
  }

  daftar.push(
    "Pelajar dapat membaca profil sekolah, daftar guru, program, dan galeri kegiatan di situs ini.",
  );
  daftar.push(
    "Pengelola sekolah dihubungi lewat halaman kontak untuk informasi pendaftaran.",
  );

  return daftar;
}

/** Wilayah tanpa bagian yang masih berupa placeholder. */
function wilayahBersih(): string {
  const a = site.address;
  return [a.subdistrict, a.city, a.province]
    .filter((b) => b && !b.startsWith("TODO"))
    .join(", ");
}

/** Potong teks pada batas kata terdekat, tanpa memotong kata. */
function potongDiKata(teks: string, batas: number): string {
  if (teks.length <= batas) return teks;
  const potong = teks.slice(0, batas);
  const spasiTerakhir = potong.lastIndexOf(" ");
  const hasil = spasiTerakhir > batas * 0.6 ? potong.slice(0, spasiTerakhir) : potong;
  return hasil.replace(/[\s,.;:]+$/, "");
}

/** URL absolut gambar Open Graph dari id media. */
export function gambarOg(idMedia: string): string {
  return `${baseUrl()}/media/${idMedia}?w=1600`;
}

/** Metadata dasar yang dipakai semua halaman. */
export async function metadataDasar(
  judulHalaman: string,
  deskripsiHalaman: string | undefined,
  jalur: string,
  gambar?: { id: string; alt: string },
): Promise<Metadata> {
  // Tanpa gambar khusus, dipakai logo sekolah sebagai gambar bawaan.
  const gambarDipakai = gambar ?? (await gambarBawaan());
  const deskripsiFinal = deskripsi(deskripsiHalaman);
  // Disusun terpisah agar penyempitan tipe tetap dipahami TypeScript.
  const gambarOgList = gambarDipakai
    ? [
        {
          url: gambarOg(gambarDipakai.id),
          width: 1200,
          height: 630,
          alt: gambarDipakai.alt,
        },
      ]
    : undefined;

  return {
    // Nama sekolah ditambahkan oleh title.template di layout root.
    title: judulPendek(judulHalaman),
    description: deskripsiFinal,
    alternates: { canonical: jalur },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: jalur,
      siteName: site.name,
      title: judulLengkap(judulHalaman),
      description: deskripsiFinal,
      ...(gambarOgList ? { images: gambarOgList } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: judulLengkap(judulHalaman),
      description: deskripsiFinal,
      ...(gambarOgList ? { images: [gambarOgList[0].url] } : {}),
    },
  };
}

/**
 * Meta verifikasi mesin kari.
 *
 * Token diambil dari variabel lingkungan supaya tidak perlu mengubah
 * kode saat situs diganti. Contoh isi:
 *   NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=abc123...
 *   NEXT_PUBLIC_BING_SITE_VERIFICATION=xyz789...
 */
export function verifikasiPencari(): Record<string, string> {
  const hasil: Record<string, string> = {};

  const google = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  if (google) {
    hasil["google-site-verification"] = google;
  }

  const bing = process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION;
  if (bing) {
    hasil["msvalidate.01"] = bing;
  }

  return hasil;
}

/** Logo sekolah sebagai gambar Open Graph bawaan. */
async function gambarBawaan(): Promise<{ id: string; alt: string } | null> {
  const pengaturan = await pengaturanSitus();
  return pengaturan.logo
    ? { id: pengaturan.logo.id, alt: pengaturan.logo.alt || site.name }
    : null;
}

/** Halaman yang tidak boleh diindeks. */
export const TANPA_INDEKS = {
  index: false,
  follow: false,
  nocache: true,
} as const;