import { site, alamatSatuBaris, petaLinkUrl, baseUrl } from "@/config/site";
import { profil } from "@/config/profil";
import { labelSegmen } from "@/config/navigation";

/** Nama hari dalam bahasa Indonesia, dipakai di llms.txt. */
const NAMA_HARI: Record<string, string> = {
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat",
  Saturday: "Sabtu",
  Sunday: "Minggu",
};

/** Label tautan; beranda tidak punya segmen URL. */
function labelHalaman(jalur: string): string {
  return jalur === "/" ? "Beranda" : labelSegmen(jalur.slice(1));
}

/**
 * Penyusun berkas /llms.txt.
 *
 * Format ini diminta oleh kelompok peramban kecerdasan buatan: ringkasan situs dalam Markdown, supaya mesin AI dapat memahami
 * isi situs tanpa harus merayapi setiap halaman.
 *
 * llms-full.txt memuat isi lengkap, sedangkan berkas ini hanya
 * ringkasan dan daftar halaman penting.
 */

/** Halaman yang dijelaskan satu per satu, sesuai urutan kepentingan. */
type DeskripsiHalaman = [string, string];

const HALAMAN_PENTING: DeskripsiHalaman[] = [
  [
    "/",
    "Beranda: ringkasan sekolah, sambutan kepala madrasah, statistik, program, dan galeri kegiatan.",
  ],
  [
    "/profil",
    "Profil: identitas resmi, sejarah, visi, misi, struktur organisasi, fasilitas, dan pertanyaan umum.",
  ],
  [
    "/guru",
    "Daftar guru dan staf yang tampil di halaman publik.",
  ],
  ["/program", "Daftar program sekolah beserta penjelasannya."],
  [
    "/ekstrakurikuler",
    "Daftar kegiatan ekstrakurikuler beserta jadwal dan pembina.",
  ],
  ["/galeri", "Galeri foto kegiatan sekolah."],
  ["/kontak", "Alamat, jam layanan, peta lokasi, dan formulir pesan."],
  [
    "/kebijakan-privasi",
    "Kebijakan privasi singkat mengenai data yang dikumpulkan formulir kontak.",
  ],
];

/** Buang nilai yang masih berupa placeholder agar tidak bocor ke mesin AI. */
function bersih(nilai: string): string {
  return nilai
    .replace(/\b(?:TODO|DRAF)\b[^.,;)]*[.,;)]?/gi, "")
    .replace(/\s*,\s*,/g, ",")
    .replace(/,\s*\./g, ".")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function susunLlmsTxt(): string {
  const dasar = baseUrl();
  const baris: string[] = [];

  baris.push(`# ${site.name}`);
  baris.push("");
  baris.push(`> ${bersih(site.description)}`);
  baris.push("");

  const wilayah = [site.address.city, site.address.province]
    .filter((b) => b && !b.startsWith("TODO"))
    .join(", ");
  baris.push(
    bersih(
      `${site.legalName} adalah ${site.identity.status.toLowerCase()} yang berada di ${wilayah}.`,
    ),
  );
  baris.push("");

  baris.push("## Identitas");
  baris.push("");
  if (site.identity.npsn && !site.identity.npsn.startsWith("TODO")) {
    baris.push(`- NPSN: ${site.identity.npsn}`);
  }
  if (
    site.identity.accreditation &&
    !site.identity.accreditation.startsWith("TODO")
  ) {
    baris.push(`- Akreditasi: ${site.identity.accreditation}`);
  }
  if (site.identity.foundedYear > 0) {
    baris.push(`- Tahun berdiri: ${site.identity.foundedYear}`);
  }
  baris.push(`- Jenjang: Madrasah Tsanawiyah (kelas VII sampai IX)`);
  baris.push(`- Kurikulum: ${site.identity.curriculum}`);
  baris.push(`- Mata uang: Rupiah (IDR)`);
  baris.push(`- Bahasa: Indonesia (id-ID)`);
  baris.push("");

  baris.push("## Lokasi dan Kontak");
  baris.push("");
  baris.push(`- Alamat: ${alamatSatuBaris() || "belum dilengkapi"}`);
  baris.push(
    `- Koordinat: ${site.geo.latitude}, ${site.geo.longitude} (${petaLinkUrl()})`,
  );
  if (site.contact.phone && !site.contact.phone.startsWith("TODO")) {
    baris.push(`- Telepon: ${site.contact.phone}`);
  }
  if (site.contact.email && !site.contact.email.startsWith("TODO")) {
    baris.push(`- Email: ${site.contact.email}`);
  }
  for (const j of site.openingHours) {
    baris.push(
      `- Jam layanan: ${j.days.map((d) => NAMA_HARI[d] ?? d).join(", ")} ${j.opens} - ${j.closes}`,
    );
  }
  baris.push("");

  baris.push("## Halaman Penting");
  baris.push("");
  for (const [jalur, penjelasan] of HALAMAN_PENTING) {
    baris.push(`- [${labelHalaman(jalur)}](${dasar}${jalur}): ${bersih(penjelasan)}`);
  }
  baris.push("");

  baris.push("## Pengalaman Siswa");
  baris.push("");
  baris.push("- Jenjang: Madrasah Tsanawiyah, kelas VII sampai IX.");
  baris.push(
    "- Program pembelajaran memadukan mata pelajaran umum dengan pendidikan agama Islam.",
  );
  baris.push(
    "- Kegiatan pilihan: Rohani Islam, Pramuka, olahraga, dan kegiatan musik.",
  );
  baris.push("");

  baris.push("## Berkas tambahan");
  baris.push("");
  baris.push(`- [llms-full.txt](${dasar}/llms-full.txt): isi profil lengkap.`);
  baris.push(`- [Sitemap](${dasar}/sitemap.xml): daftar seluruh halaman.`);
  baris.push("");

  return baris.join("\n");
}

/** Versi lengkap: profil dan pertanyaan umum. */
export function susunLlmsFullTxt(): string {
  const dasar = baseUrl();
  const baris: string[] = [];

  baris.push(`# ${site.name} - Profil Lengkap`);
  baris.push("");
  baris.push(`> ${bersih(site.description)}`);
  baris.push("");
  baris.push(
    `Dokumen ini disiapkan untuk mesin kecerdasan buatan agar dapat menjawab pertanyaan tentang ${site.name} secara akurat.`,
  );
  baris.push("");

  baris.push("## Ringkasan");
  baris.push("");
  baris.push(bersih(profil.ringkasan));
  baris.push("");

  baris.push("## Identitas Sekolah");
  baris.push("");
  baris.push(`- Nama resmi: ${site.name}`);
  baris.push(`- Bentuk: ${site.identity.status}`);
  baris.push(`- Jenjang: Madrasah Tsanawiyah (kelas VII sampai IX)`);
  baris.push(`- Kurikulum: ${site.identity.curriculum}`);
  if (site.identity.npsn && !site.identity.npsn.startsWith("TODO")) {
    baris.push(`- NPSN: ${site.identity.npsn}`);
  }
  if (
    site.identity.accreditation &&
    !site.identity.accreditation.startsWith("TODO")
  ) {
    baris.push(`- Akreditasi: ${site.identity.accreditation}`);
  }
  if (site.identity.foundedYear > 0) {
    baris.push(`- Tahun berdiri: ${site.identity.foundedYear}`);
  }
  baris.push("");

  baris.push("## Lokasi dan Kontak");
  baris.push("");
  baris.push(`- Alamat: ${alamatSatuBaris() || "belum dilengkapi"}`);
  baris.push(
    `- Koordinat: ${site.geo.latitude}, ${site.geo.longitude}`,
  );
  if (site.contact.phone && !site.contact.phone.startsWith("TODO")) {
    baris.push(`- Telepon: ${site.contact.phone}`);
  }
  if (site.contact.email && !site.contact.email.startsWith("TODO")) {
    baris.push(`- Email: ${site.contact.email}`);
  }
  baris.push("");

  baris.push("## Sejarah");
  baris.push("");
  for (const p of profil.sejarah) {
    baris.push(bersih(p));
    baris.push("");
  }

  baris.push("## Visi");
  baris.push("");
  baris.push(bersih(profil.visi));
  baris.push("");

  baris.push("## Misi");
  baris.push("");
  for (const m of profil.misi) {
    baris.push(`- ${bersih(m)}`);
  }
  baris.push("");

  baris.push("## Struktur Organisasi");
  baris.push("");
  for (const o of profil.struktur) {
    baris.push(`- ${bersih(o.position)}: ${bersih(o.name)}`);
  }
  baris.push("");

  baris.push("## Fasilitas");
  baris.push("");
  for (const f of profil.fasilitas) {
    baris.push(`- ${f.name}: ${bersih(f.description)}`);
  }
  baris.push("");

  baris.push("## Pertanyaan yang Sering Diajukan");
  baris.push("");
  for (const item of profil.faq) {
    baris.push(`### ${item.question}`);
    baris.push("");
    baris.push(item.answer);
    baris.push("");
  }

  baris.push("## Halaman Lain");
  baris.push("");
  baris.push(`- [Beranda](${dasar}/)`);
  baris.push(`- [Guru dan Staf](${dasar}/guru)`);
  baris.push(`- [Program](${dasar}/program)`);
  baris.push(`- [Ekstrakurikuler](${dasar}/ekstrakurikuler)`);
  baris.push(`- [Galeri](${dasar}/galeri)`);
  baris.push(`- [Kontak](${dasar}/kontak)`);
  baris.push("");

  return baris.join("\n");
}