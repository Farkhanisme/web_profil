"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { nowSeconds } from "@/lib/db/client";
import { TAG } from "@/lib/queries/cache-tags";
import {
  identitasSchema,
  faqSchema,
  fasilitasSchema,
  galatPerField,
  profilTeksSchema,
  strukturSchema,
} from "@/lib/schemas/profil";

/**
 * Server Action modul Profil Madrasah.
 *
 * Semua modul menulis ke satu baris tabel `profil_content` (id = 1),
 * tetapi setiap modul hanya menyentuh kolomnya sendiri. Kolom yang tidak
 * dikirim tidak ikut ditulis, sehingga pengelola bisa mengisi identitas
 * di hari Senin dan sejarah di hari Rabu tanpa menimpa satu sama lain.
 *
 * Kolom berbentuk daftar disimpan sebagai JSON. Pembacanya ada di
 * `lib/queries/profil.ts` dan bersifat defensif: JSON rusak diabaikan,
 * bukan membuat halaman publik error.
 */

export type ProfilState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;

/** Ambil semua teks dari field bernama sama pada FormData. */
function semua(formData: FormData, nama: string): string[] {
  return formData
    .getAll(nama)
    .map((v) => String(v).trim())
    .filter((v) => v.length > 0);
}

/** Satu teks, atau string kosong bila field tidak ada. */
function satu(formData: FormData, nama: string): string {
  return String(formData.get(nama) ?? "").trim();
}

/**
 * Pastikan baris `profil_content` ada. CMS bisa dibuka sebelum pengelola
 * pernah menyimpan apa pun, sedangkan pembacaan situs memakai
 * `COALESCE`-gaya fallback ke nilai bawaan repo.
 */
async function siapkanBaris(): Promise<void> {
  await db.execute({
    sql: `INSERT INTO profil_content (id, updated_at)
          VALUES (1, ?1)
          ON CONFLICT(id) DO NOTHING`,
    args: [nowSeconds()],
  });
}

/** Jalankan pembaruan kolom lalu segarkan cache halaman publik. */
async function perbarui(
  sql: string,
  args: Array<string | number | null>,
): Promise<void> {
  await siapkanBaris();
  await db.execute({ sql, args });
  updateTag(TAG.profil);
}

/* ------------------------------------------------------------------ */
/* Identitas, alamat, dan kontak                                       */
/* ------------------------------------------------------------------ */

export async function simpanIdentitas(
  _state: ProfilState,
  formData: FormData,
): Promise<ProfilState> {
  await assertAdmin();

  const hasil = identitasSchema.safeParse({
    name: satu(formData, "name"),
    short_name: satu(formData, "short_name"),
    legal_name: satu(formData, "legal_name"),
    tagline: satu(formData, "tagline"),
    description: satu(formData, "description"),
    identity_status: satu(formData, "identity_status"),
    npsn: satu(formData, "npsn"),
    accreditation: satu(formData, "accreditation"),
    founded_year: satu(formData, "founded_year"),
    curriculum: satu(formData, "curriculum"),
    founder: satu(formData, "founder"),
    street: satu(formData, "street"),
    village: satu(formData, "village"),
    subdistrict: satu(formData, "subdistrict"),
    city: satu(formData, "city"),
    province: satu(formData, "province"),
    postal_code: satu(formData, "postal_code"),
    geo_lat: satu(formData, "geo_lat"),
    geo_lng: satu(formData, "geo_lng"),
    phone: satu(formData, "phone"),
    email: satu(formData, "email"),
    whatsapp: satu(formData, "whatsapp"),
    students: satu(formData, "students"),
  });

  if (!hasil.success) {
    return {
      error: "Periksa kembali data yang diisi.",
      fieldErrors: galatPerField(hasil.error),
    };
  }

  const d = hasil.data;
  // Tahun berdiri dan jumlah siswa disimpan sebagai INTEGER. Nilai kosong
  // menjadi 0, yang berarti "belum diisi" bagi pembacaan situs.
  const tahun = d.founded_year === "" ? 0 : Number(d.founded_year);
  const siswa = d.students === "" ? 0 : Number(d.students);
  // Koordinat kosong berarti "biarkan nilai bawaan repo yang dipakai".
  const lat = d.geo_lat === "" ? null : Number(d.geo_lat);
  const lng = d.geo_lng === "" ? null : Number(d.geo_lng);

  await perbarui(
    `UPDATE profil_content SET
       name = ?1, short_name = ?2, legal_name = ?3, tagline = ?4, description = ?5,
       identity_status = ?6, npsn = ?7, accreditation = ?8, founded_year = ?9,
       curriculum = ?10, founder = ?11,
       street = ?12, village = ?13, subdistrict = ?14, city = ?15,
       province = ?16, postal_code = ?17,
       geo_lat = ?18, geo_lng = ?19,
       phone = ?20, email = ?21, whatsapp = ?22, students = ?23,
       updated_at = ?24
     WHERE id = 1`,
    [
      d.name,
      d.short_name,
      d.legal_name,
      d.tagline,
      d.description,
      d.identity_status,
      d.npsn,
      d.accreditation,
      tahun,
      d.curriculum,
      d.founder,
      d.street,
      d.village,
      d.subdistrict,
      d.city,
      d.province,
      d.postal_code,
      lat,
      lng,
      d.phone,
      d.email,
      d.whatsapp,
      siswa,
      nowSeconds(),
    ],
  );

  redirect("/admin/identitas?saved=1");
}

/* ------------------------------------------------------------------ */
/* Teks profil: ringkasan, sejarah, visi, misi, sambutan               */
/* ------------------------------------------------------------------ */

export async function simpanProfilTeks(
  _state: ProfilState,
  formData: FormData,
): Promise<ProfilState> {
  await assertAdmin();

  const hasil = profilTeksSchema.safeParse({
    ringkasan: satu(formData, "ringkasan"),
    sejarah: semua(formData, "sejarah"),
    visi: satu(formData, "visi"),
    misi: semua(formData, "misi"),
    sambutan_nama: satu(formData, "sambutan_nama"),
    jabatan: satu(formData, "jabatan"),
    sambutan_teks: semua(formData, "sambutan_teks"),
  });

  if (!hasil.success) {
    return {
      error: "Periksa kembali data yang diisi.",
      fieldErrors: galatPerField(hasil.error),
    };
  }

  const d = hasil.data;

  await perbarui(
    `UPDATE profil_content SET
       ringkasan = ?1, sejarah = ?2, visi = ?3, misi = ?4,
       sambutan_nama = ?5, sambutan_jabatan = ?6, sambutan_teks = ?7, updated_at = ?8
     WHERE id = 1`,
    [
      d.ringkasan,
      JSON.stringify(d.sejarah),
      d.visi,
      JSON.stringify(d.misi),
      d.sambutan_nama,
      d.jabatan ?? "",
      JSON.stringify(d.sambutan_teks),
      nowSeconds(),
    ],
  );

  redirect("/admin/profil?saved=1");
}

/* ------------------------------------------------------------------ */
/* Daftar berulang                                                    */
/* ------------------------------------------------------------------ */

/**
 * Daftar dua kolom (nama + keterangan), dipakai bersama oleh struktur
 * organisasi dan fasilitas. Bedanya hanya nama field di database.
 */
function barisDuaKolom(
  formData: FormData,
  nama: string,
  keterangan: string,
): { nama: string; keterangan: string }[] {
  const namaList = formData.getAll(nama);
  const ketList = formData.getAll(keterangan);

  const hasil: { nama: string; keterangan: string }[] = [];
  for (let i = 0; i < namaList.length; i += 1) {
    const n = String(namaList[i] ?? "").trim();
    const k = String(ketList[i] ?? "").trim();
    // Baris kosong dibuang: jangan pernah tersimpan sebagai elemen JSON
    // kosong karena pembacaan halaman publik akan menghitungnya.
    if (n.length === 0 && k.length === 0) continue;
    hasil.push({ nama: n, keterangan: k });
  }
  return hasil;
}

export async function simpanStruktur(
  _state: ProfilState,
  formData: FormData,
): Promise<ProfilState> {
  await assertAdmin();

  const isi = barisDuaKolom(formData, "nama", "posisi");
  const json = JSON.stringify(isi.map((b) => ({ name: b.nama, position: b.keterangan })));

  const hasil = strukturSchema.safeParse({ struktur_json: json });
  if (!hasil.success) {
    return {
      error: "Daftar struktur terlalu panjang untuk disimpan.",
      fieldErrors: galatPerField(hasil.error),
    };
  }

  await perbarui(
    "UPDATE profil_content SET struktur_organisasi = ?1, updated_at = ?2 WHERE id = 1",
    [hasil.data.struktur_json ?? json, nowSeconds()],
  );

  redirect("/admin/profil/struktur?saved=1");
}

export async function simpanFasilitas(
  _state: ProfilState,
  formData: FormData,
): Promise<ProfilState> {
  await assertAdmin();

  const isi = barisDuaKolom(formData, "nama", "keterangan");
  const json = JSON.stringify(
    isi.map((b) => ({ name: b.nama, description: b.keterangan })),
  );

  const hasil = fasilitasSchema.safeParse({ fasilitas_json: json });
  if (!hasil.success) {
    return {
      error: "Daftar fasilitas terlalu panjang untuk disimpan.",
      fieldErrors: galatPerField(hasil.error),
    };
  }

  await perbarui(
    "UPDATE profil_content SET fasilitas = ?1, updated_at = ?2 WHERE id = 1",
    [hasil.data.fasilitas_json ?? json, nowSeconds()],
  );

  redirect("/admin/profil/fasilitas?saved=1");
}

export async function simpanFaq(
  _state: ProfilState,
  formData: FormData,
): Promise<ProfilState> {
  await assertAdmin();

  const pertanyaan = formData.getAll("pertanyaan");
  const jawaban = formData.getAll("jawaban");

  const hasil: { question: string; answer: string }[] = [];
  for (let i = 0; i < pertanyaan.length; i += 1) {
    const q = String(pertanyaan[i] ?? "").trim();
    const a = String(jawaban[i] ?? "").trim();
    if (q.length === 0 && a.length === 0) continue;
    hasil.push({ question: q, answer: a });
  }

  const json = JSON.stringify(hasil);

  const cek = faqSchema.safeParse({ faq_json: json });
  if (!cek.success) {
    return {
      error: "Daftar pertanyaan terlalu panjang untuk disimpan.",
      fieldErrors: galatPerField(cek.error),
    };
  }

  await perbarui(
    "UPDATE profil_content SET faq = ?1, updated_at = ?2 WHERE id = 1",
    [cek.data.faq_json ?? json, nowSeconds()],
  );

  redirect("/admin/profil/faq?saved=1");
}