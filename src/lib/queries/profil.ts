import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/lib/db";
import { site as BAWAAN_SITUS } from "@/config/site";
import { profil as BAWAAN_PROFIL } from "@/config/profil";
import { TAG } from "./cache-tags";
import {
  terisi,
  type FaqItem,
  type FasilitasItem,
  type IsiProfil,
  type IsiSitus,
  type OrgMember,
  type Sambutan,
} from "@/lib/konten";

/**
 * Pembacaan isi profil & identitas sekolah.
 *
 * Sumber nilai ada dua, dan kolom kosong di database selalu jatuh ke
 * konfigurasi bawaan di dalam repo (`config/site.ts`, `config/profil.ts`).
 * Konsekuensinya:
 *   - Admin yang belum pernah menyimpan apa pun tetap melihat tampilan
 *     persis seperti sebelum fitur ini ada.
 *   - Tidak ada konten lama yang hilang saat migrasi dijalankan.
 *
 * Hasil fungsi ini di-cache dengan tag `profil`, sehingga Server Action
 * cukup memanggil `updateTag(TAG.profil)` supaya seluruh halaman publik
 * ikut berubah tanpa deploy ulang.
 */

interface BarisProfil {
  name: string;
  short_name: string;
  legal_name: string;
  tagline: string;
  description: string;
  identity_status: string;
  npsn: string;
  accreditation: string;
  founded_year: number;
  curriculum: string;
  founder: string;
  street: string;
  village: string;
  subdistrict: string;
  city: string;
  province: string;
  postal_code: string;
  geo_lat: number | null;
  geo_lng: number | null;
  phone: string;
  email: string;
  whatsapp: string;
  students: number;
  ringkasan: string;
  sejarah: string;
  visi: string;
  misi: string;
  struktur_organisasi: string;
  fasilitas: string;
  sambutan_nama: string;
  sambutan_jabatan: string;
  sambutan_teks: string;
  faq: string;
  updated_at: number;
}

const KOLOM = [
  "name",
  "short_name",
  "legal_name",
  "tagline",
  "description",
  "identity_status",
  "npsn",
  "accreditation",
  "founded_year",
  "curriculum",
  "founder",
  "street",
  "village",
  "subdistrict",
  "city",
  "province",
  "postal_code",
  "geo_lat",
  "geo_lng",
  "phone",
  "email",
  "whatsapp",
  "students",
  "ringkasan",
  "sejarah",
  "visi",
  "misi",
  "struktur_organisasi",
  "fasilitas",
  "sambutan_nama",
  "sambutan_jabatan",
  "sambutan_teks",
  "faq",
  "updated_at",
].join(", ");

/* ------------------------------------------------------------------ */
/* Parser JSON defensif                                                */
/* ------------------------------------------------------------------ */

/**
 * Baca JSON dari database dengan selalu mengembalikan array.
 *
 * Nilai rusak (misalnya diedit manual di luar CMS) tidak boleh menjatuhkan
 * seluruh halaman; isinya diabaikan dan pembaca memakai nilai bawaan.
 */
function bacaJsonArray(teks: string): unknown[] {
  if (!teks) return [];
  try {
    const hasil: unknown = JSON.parse(teks);
    return Array.isArray(hasil) ? hasil : [];
  } catch {
    return [];
  }
}

/** Ambil teks dari setiap entri array, buang yang bukan teks. */
function keTeks(daftar: unknown[]): string[] {
  return daftar
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter((x) => x.length > 0);
}

/** Ambil pasangan {name, ...} dari array, buang yang tidak lengkap. */
function keObjek(
  daftar: unknown[],
  kunciLain: string,
): Array<{ name: string; [kunciLain]: string }> {
  const hasil: Array<{ name: string; [kunciLain]: string }> = [];
  for (const x of daftar) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const name = typeof o.name === "string" ? o.name.trim() : "";
    const lain =
      typeof o[kunciLain] === "string" ? (o[kunciLain] as string).trim() : "";
    if (name) hasil.push({ name, [kunciLain]: lain } as { name: string; [kunciLain]: string });
  }
  return hasil;
}

/**
 * Ambil pasangan dua field bebas dari array (dipakai FAQ: question/answer).
 * Hanya entri dengan kedua field terisi yang dipertahankan.
 */
function kePasangan(
  daftar: unknown[],
  kunciA: string,
  kunciB: string,
): Array<Record<string, string>> {
  const hasil: Array<Record<string, string>> = [];
  for (const x of daftar) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const a = typeof o[kunciA] === "string" ? (o[kunciA] as string).trim() : "";
    const b = typeof o[kunciB] === "string" ? (o[kunciB] as string).trim() : "";
    if (a && b) hasil.push({ [kunciA]: a, [kunciB]: b });
  }
  return hasil;
}

/* ------------------------------------------------------------------ */
/* Penggabungan                                                         */
/* ------------------------------------------------------------------ */

/** Teks dari DB bila sudah diisi, jika tidak pakai bawaan. */
function teks(dariDb: string, bawaan: string): string {
  return dariDb && dariDb.trim() ? dariDb.trim() : bawaan;
}

/** Angka bulat dari DB bila > 0, jika tidak pakai bawaan. */
function angka(dariDb: number, bawaan: number): number {
  return Number.isFinite(dariDb) && dariDb > 0 ? dariDb : bawaan;
}

/**
 * Identitas & kontak sekolah: konfigurasi + hasil CMS.
 *
 * `url`, `openingHours`, `sameAs`, dan `country` tetap dari konfigurasi
 * karena berisi nilai teknis (URL, jam layanan, tautan sosial) yang tidak
 * merupakan teks profil yang diedit pengelola.
 */
export async function bacaSitus(): Promise<IsiSitus> {
  "use cache";
  cacheTag(TAG.profil);
  cacheLife("max");

  const baris = await query<BarisProfil>(
    `SELECT ${KOLOM} FROM profil_content WHERE id = 1`,
  );
  const b = baris[0];

  const bawaan = BAWAAN_SITUS;

  if (!b) {
    return {
      ...bawaan,
      openingHours: [...bawaan.openingHours],
      sameAs: [...bawaan.sameAs],
    } as IsiSitus;
  }

  return {
    name: teks(b.name, bawaan.name),
    shortName: teks(b.short_name, bawaan.shortName),
    legalName: teks(b.legal_name, bawaan.legalName),
    tagline: teks(b.tagline, bawaan.tagline),
    description: teks(b.description, bawaan.description),
    url: bawaan.url,
    identity: {
      status: teks(b.identity_status, bawaan.identity.status),
      npsn: teks(b.npsn, bawaan.identity.npsn),
      accreditation: teks(b.accreditation, bawaan.identity.accreditation),
      foundedYear: angka(b.founded_year, bawaan.identity.foundedYear),
      curriculum: teks(b.curriculum, bawaan.identity.curriculum),
      founder: teks(b.founder, bawaan.identity.founder),
    },
    address: {
      street: teks(b.street, bawaan.address.street),
      village: teks(b.village, bawaan.address.village),
      subdistrict: teks(b.subdistrict, bawaan.address.subdistrict),
      city: teks(b.city, bawaan.address.city),
      province: teks(b.province, bawaan.address.province),
      postalCode: teks(b.postal_code, bawaan.address.postalCode),
      country: bawaan.address.country,
    },
    geo: {
      latitude:
        typeof b.geo_lat === "number" && Number.isFinite(b.geo_lat)
          ? b.geo_lat
          : bawaan.geo.latitude,
      longitude:
        typeof b.geo_lng === "number" && Number.isFinite(b.geo_lng)
          ? b.geo_lng
          : bawaan.geo.longitude,
    },
    contact: {
      phone: teks(b.phone, bawaan.contact.phone),
      email: teks(b.email, bawaan.contact.email),
      whatsapp: teks(b.whatsapp, bawaan.contact.whatsapp),
    },
    openingHours: [...bawaan.openingHours],
    sameAs: [...bawaan.sameAs],
    stats: {
      students: angka(b.students, bawaan.stats.students),
    },
  };
}

/**
 * Isi halaman profil: ringkasan, sejarah, visi, misi, struktur, fasilitas,
 * sambutan, dan FAQ.
 */
export async function bacaProfil(): Promise<IsiProfil> {
  "use cache";
  cacheTag(TAG.profil);
  cacheLife("max");

  const baris = await query<BarisProfil>(
    `SELECT ${KOLOM} FROM profil_content WHERE id = 1`,
  );
  const b = baris[0];
  const bawaan = BAWAAN_PROFIL;

  if (!b) {
    return {
      ringkasan: bawaan.ringkasan,
      sejarah: [...bawaan.sejarah],
      visi: bawaan.visi,
      misi: [...bawaan.misi],
      sambutan: {
        nama: bawaan.sambutan.nama,
        jabatan: bawaan.sambutan.jabatan,
        teks: [...bawaan.sambutan.teks],
      },
      struktur: [...bawaan.struktur],
      fasilitas: [...bawaan.fasilitas],
      faq: [...bawaan.faq],
      updatedAt: bawaan.updatedAt,
    } as IsiProfil;
  }

  const sejarah = keTeks(bacaJsonArray(b.sejarah));
  const misi = keTeks(bacaJsonArray(b.misi));
  const teksSambutan = keTeks(bacaJsonArray(b.sambutan_teks));

  const struktur = keObjek(bacaJsonArray(b.struktur_organisasi), "position")
    .map((x) => ({ name: x.name, position: x.position }))
    .filter((x): x is OrgMember => x.name.length > 0);

  const fasilitas = keObjek(bacaJsonArray(b.fasilitas), "description")
    .map((x) => ({ name: x.name, description: x.description }))
    .filter((x): x is FasilitasItem => x.name.length > 0);

  const faq = kePasangan(bacaJsonArray(b.faq), "question", "answer").map(
    (x): FaqItem => ({ question: x.question!, answer: x.answer! }),
  );

  const sambutan: Sambutan = {
    nama: teks(b.sambutan_nama, bawaan.sambutan.nama),
    jabatan: teks(b.sambutan_jabatan, bawaan.sambutan.jabatan),
    teks: teksSambutan.length > 0 ? teksSambutan : [...bawaan.sambutan.teks],
  };

  return {
    ringkasan: teks(b.ringkasan, bawaan.ringkasan),
    sejarah: sejarah.length > 0 ? sejarah : [...bawaan.sejarah],
    visi: teks(b.visi, bawaan.visi),
    misi: misi.length > 0 ? misi : [...bawaan.misi],
    sambutan,
    struktur: struktur.length > 0 ? struktur : [...bawaan.struktur],
    fasilitas: fasilitas.length > 0 ? fasilitas : [...bawaan.fasilitas],
    faq: faq.length > 0 ? faq : [...bawaan.faq],
    updatedAt:
      b.updated_at > 0 ? baruKeTanggalISO(b.updated_at) : bawaan.updatedAt,
  };
}

/* ------------------------------------------------------------------ */
/* Helper kecil                                                        */
/* ------------------------------------------------------------------ */

/** Epoch detik -> "YYYY-MM-DD" untuk label "diperbarui". */
function baruKeTanggalISO(epochDetik: number): string {
  return new Date(epochDetik * 1000).toISOString().slice(0, 10);
}

/** True bila isi profil masih memakai draf bawaan repo. */
export async function profilMasihDraf(): Promise<boolean> {
  const isi = await bacaProfil();
  return (
    isi.ringkasan.includes("DRAF:") ||
    isi.visi.includes("DRAF:") ||
    isi.sejarah.some((p) => p.includes("DRAF:")) ||
    isi.sambutan.nama.includes("DRAF:")
  );
}

/** True bila identitas/kontak penting belum diisi pengelola. */
export async function identitasBelumLengkap(s: IsiSitus): Promise<boolean> {
  return (
    !terisi(s.contact.phone) ||
    !terisi(s.identity.npsn) ||
    !terisi(s.address.street)
  );
}