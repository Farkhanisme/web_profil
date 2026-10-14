import type { FaqItem, IsiSitus, Sambutan } from "@/lib/konten";
import { baseUrl } from "@/config/site";
import { terisi } from "@/lib/konten";
import { formatTanggalISO } from "@/lib/utils";

/**
 * Data terstruktur JSON-LD.
 *
 * Sengaja dirender di server sebagai `<script type="application/ld+json">`,
 * bukan lewat pustaka, supaya tidak menambah JavaScript ke halaman.
 *
 * Semua fungsi menerima data hasil bacaan (`bacaSitus`, `bacaProfil`),
 * bukan konfigurasi statis. Kalau memakai konfigurasi statis, isi
 * JSON-LD akan tetap berupa data contoh padahal pengelola sudah
 * mengisinya lewat CMS — mesin pencari lalu mengindeks versi yang salah.
 */

/** URL absolut untuk item data terstruktur. */
function url(jalur: string): string {
  return `${baseUrl()}${jalur.startsWith("/") ? jalur : `/${jalur}`}`;
}

export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Array<Record<string, unknown> | null>;
}) {
  // Skema yang tidak ada isinya (mis. FAQ kosong) dikembalikan `null`.
  // JSON tidak punya nilai null yang sah di dalam daftar skema, jadi
  // entri seperti itu dibuang sebelum diserialkan.
  const isi = Array.isArray(data)
    ? data.filter((x): x is Record<string, unknown> => x !== null)
    : data;

  return (
    <script
      type="application/ld+json"
      // Data di bawah dibangun dari isi milik sekolah sendiri,
      // bukan dari masukan pengguna.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(isi) }}
    />
  );
}

/** Skema School / EducationalOrganization untuk beranda, profil, dan kontak. */
export function jsonLdSekolah(s: IsiSitus) {
  const alamat = {
    "@type": "PostalAddress",
    streetAddress: terisi(s.address.street) ? s.address.street : undefined,
    addressLocality: terisi(s.address.city) ? s.address.city : undefined,
    addressRegion: terisi(s.address.province) ? s.address.province : undefined,
    postalCode: terisi(s.address.postalCode) ? s.address.postalCode : undefined,
    addressCountry: s.address.country,
  };

  return {
    "@context": "https://schema.org",
    "@type": "School",
    "@id": `${url("/")}#sekolah`,
    name: s.name,
    legalName: terisi(s.legalName) ? s.legalName : undefined,
    alternateName: terisi(s.address.city)
      ? `${s.name} ${s.address.city}`
      : undefined,
    url: url("/"),
    description: s.description,
    address: alamat,
    geo: {
      "@type": "GeoCoordinates",
      latitude: s.geo.latitude,
      longitude: s.geo.longitude,
    },
    ...(terisi(s.identity.npsn) ? { identifier: s.identity.npsn } : {}),
    ...(terisi(s.identity.accreditation)
      ? { accreditation: s.identity.accreditation }
      : {}),
    ...(s.identity.foundedYear > 0
      ? { foundingDate: String(s.identity.foundedYear) }
      : {}),
    ...(terisi(s.contact.phone) ? { telephone: s.contact.phone } : {}),
    ...(terisi(s.contact.email) ? { email: s.contact.email } : {}),
    openingHoursSpecification: s.openingHours.map((j) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: j.days,
      opens: j.opens,
      closes: j.closes,
    })),
    ...(s.sameAs.some((u) => terisi(u))
      ? { sameAs: s.sameAs.filter((u) => terisi(u)) }
      : {}),
  };
}

/** Skema WebSite untuk beranda. */
export function jsonLdSitus(s: IsiSitus) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url("/")}#situs`,
    name: s.name,
    url: url("/"),
    inLanguage: "id-ID",
    publisher: { "@id": `${url("/")}#sekolah` },
  };
}

/** Skema FAQPage. Daftar kosong menghasilkan `null` agar tidak dicetak. */
export function jsonLdFaq(faq: FaqItem[]): Record<string, unknown> | null {
  const isi = faq.filter((f) => terisi(f.question) && terisi(f.answer));
  if (isi.length === 0) return null;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: isi.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Skema Person ringan untuk kepala madrasah (tanpa data pribadi sensitif). */
export function jsonLdKepalaMadrasah(sambutan: Sambutan) {
  if (!terisi(sambutan.nama)) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: sambutan.nama,
    jobTitle: terisi(sambutan.jabatan) ? sambutan.jabatan : undefined,
    worksFor: { "@id": `${url("/")}#sekolah` },
  };
}

/** Skema BreadcrumbList. Jalur relatif dipakai apa adanya agar hemat. */
export function jsonLdRemahRoti(
  daftar: Array<{ label: string; href?: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: daftar.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: url(item.href) } : {}),
    })),
  };
}

/** Tanggal pembaruan konten dalam format yang mudah dibaca mesin. */
export function tanggalPembaruan(updatedAt: string): string | null {
  const ms = Date.parse(`${updatedAt}T00:00:00Z`);
  if (!Number.isFinite(ms)) return null;
  return formatTanggalISO(ms / 1000);
}