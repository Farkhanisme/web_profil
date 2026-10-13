import type { Metadata } from "next";
import { site as BAWAAN, baseUrl } from "@/config/site";
import { pengaturanSitus } from "@/lib/queries/settings";
import { bacaSitus } from "@/lib/queries/profil";
import { terisi, type IsiSitus } from "@/lib/konten";

/**
 * Pembantu metadata untuk SEO.
 *
 * Aturan yang dijaga di sini:
 *   1. Judul maksimal 60 karakter, termasuk nama sekolah.
 *   2. Deskripsi 140 sampai 160 karakter.
 *   3. Setiap halaman punya canonical dan Open Graph yang lengkap.
 *   4. Gambar Open Graph memakai lebar yang diizinkan proxy media.
 *
 * Nama sekolah dan deskripsi diambil dari CMS lewat `bacaSitus()`. Nilai
 * bawaan di `config/site.ts` hanya dipakai bila belum diisi pengelola.
 */

export const JUDUL_MAKS = 60;
export const DESKRIPSI_MIN = 140;
export const DESKRIPSI_MAKS = 160;

/** Deskripsi bawaan (konfigurasi repo) sebagai jaring pengaman. */
export const DESKRIPSI_UMUM = BAWAAN.description;

/**
 * Judul halaman TANPA nama sekolah, dibatasi 60 karakter.
 *
 * Nama sekolah ditambahkan otomatis oleh `title.template` di layout root.
 * Karena itu yang dikembalikan di sini hanya bagian pendeknya, agar
 * hasil akhir tidak melebihi 60 karakter dan nama sekolah tidak terulang.
 */
export function judulPendek(
  judulHalaman: string,
  namaSekolah = BAWAAN.name,
): string {
  const batas = JUDUL_MAKS - (namaSekolah.length + 3);
  const teks = judulHalaman.trim();
  if (teks.length <= batas) return teks;
  return `${potongDiKata(teks, batas)}…`;
}

/** Judul lengkap untuk Open Graph dan Twitter, yang tidak memakai template. */
export function judulLengkap(
  judulHalaman: string,
  namaSekolah = BAWAAN.name,
): string {
  return `${judulPendek(judulHalaman, namaSekolah)} | ${namaSekolah}`;
}

/**
 * Pastikan deskripsi berada di rentang yang dibaca mesin pencari:
 * minimal 140 dan maksimal 160 karakter.
 *
 * Teks terlalu panjang dipangkas di batas kata. Teks terlalu pendek
 * dilengkapi kalimat pendukung satu per satu sampai cukup panjang.
 */
export async function deskripsi(
  teks: string | undefined | null,
): Promise<string> {
  const sumber = await bacaSitus();
  const asal = (teks ?? "").trim() || sumber.description || DESKRIPSI_UMUM;

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
  for (const tambahan of kalimatPendukung(sumber)) {
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
 * Bagian yang kosong dilewati, sehingga kata "TODO" tidak pernah bocor ke
 * meta description yang dibaca mesin pencari.
 */
function kalimatPendukung(s: IsiSitus): string[] {
  const daftar: string[] = [];
  const wilayah = wilayahBersih(s);

  if (wilayah) daftar.push(`${s.name} berada di ${wilayah}.`);
  if (terisi(s.identity.status) && terisi(s.identity.curriculum)) {
    daftar.push(`${s.identity.status} dengan ${s.identity.curriculum}.`);
  }
  if (s.identity.foundedYear > 0) {
    daftar.push(`Berdiri sejak ${s.identity.foundedYear}.`);
  }

  daftar.push(
    "Pelajar dapat membaca profil sekolah, daftar guru, program, dan galeri kegiatan di situs ini.",
  );
  daftar.push(
    "Pengelola sekolah dihubungi lewat halaman kontak untuk informasi pendaftaran.",
  );

  return daftar;
}

/** Wilayah tanpa bagian yang kosong. */
function wilayahBersih(s: IsiSitus): string {
  const a = s.address;
  return [a.subdistrict, a.city, a.province].filter((b) => terisi(b)).join(", ");
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
  const s = await bacaSitus();
  // Tanpa gambar khusus, dipakai logo sekolah sebagai gambar bawaan.
  const gambarDipakai = gambar ?? (await gambarBawaan(s.name));
  const deskripsiFinal = await deskripsi(deskripsiHalaman);
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
    title: judulPendek(judulHalaman, s.name),
    description: deskripsiFinal,
    alternates: { canonical: jalur },
    openGraph: {
      type: "website",
      locale: "id_ID",
      url: jalur,
      siteName: s.name,
      title: judulLengkap(judulHalaman, s.name),
      description: deskripsiFinal,
      ...(gambarOgList ? { images: gambarOgList } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: judulLengkap(judulHalaman, s.name),
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
async function gambarBawaan(namaSekolah: string): Promise<{ id: string; alt: string } | null> {
  const pengaturan = await pengaturanSitus();
  return pengaturan.logo
    ? { id: pengaturan.logo.id, alt: pengaturan.logo.alt || namaSekolah }
    : null;
}

/** Halaman yang tidak boleh diindeks. */
export const TANPA_INDEKS = {
  index: false,
  follow: false,
  nocache: true,
} as const;