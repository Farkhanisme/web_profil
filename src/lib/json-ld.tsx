import { profil } from "@/config/profil";
import { site } from "@/config/site";
import { formatTanggalISO } from "@/lib/utils";

/**
 * Data terstruktur JSON-LD.
 *
 * Sengaja dibuat sebagai <script type="application/ld+json"> yang
 * dirender di server, bukan lewat pustaka, supaya tidak menambah
 * JavaScript ke halaman.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Array<Record<string, unknown>> }) {
  return (
    <script
      type="application/ld+json"
      // Data di bawah dibangun dari konfigurasi milik sekolah sendiri,
      // bukan dari masukan pengguna.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Skema School / EducationalOrganization untuk beranda dan kontak. */
export function jsonLdSekolah() {
  const alamat = {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.province,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  };

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "School",
    "@id": `${site.url || ""}/#sekolah`,
    name: site.name,
    legalName: site.legalName,
    alternateName: `${site.name} ${site.address.city}`,
    url: site.url || undefined,
    description: site.description,
    address: alamat,
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.latitude,
      longitude: site.geo.longitude,
    },
    ...(site.identity.npsn && !site.identity.npsn.startsWith("TODO")
      ? { identifier: site.identity.npsn }
      : {}),
    ...(site.identity.accreditation && !site.identity.accreditation.startsWith("TODO")
      ? { accreditation: site.identity.accreditation }
      : {}),
    ...(site.identity.foundedYear > 0
      ? { foundingDate: String(site.identity.foundedYear) }
      : {}),
    ...(site.contact.phone && !site.contact.phone.startsWith("TODO")
      ? { telephone: site.contact.phone }
      : {}),
    ...(site.contact.email && !site.contact.email.startsWith("TODO")
      ? { email: site.contact.email }
      : {}),
    openingHoursSpecification: site.openingHours.map((j) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: j.days,
      opens: j.opens,
      closes: j.closes,
    })),
    ...(site.sameAs.some((u) => !u.startsWith("TODO")) ? { sameAs: site.sameAs.filter((u) => !u.startsWith("TODO")) } : {}),
  };

  return data;
}

/** Skema WebSite untuk beranda. */
export function jsonLdSitus() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${site.url || ""}/#situs`,
    name: site.name,
    url: site.url || undefined,
    inLanguage: "id-ID",
    publisher: { "@id": `${site.url || ""}/#sekolah` },
  };
}

/** Skema FAQPage dari daftar pertanyaan di profil.ts. */
export function jsonLdFaq() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: profil.faq.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/** Skema Person ringan untuk kepala madrasah (tanpa data pribadi sensitif). */
export function jsonLdKepalaMadrasah() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profil.sambutan.nama,
    jobTitle: profil.sambutan.jabatan,
    worksFor: { "@id": `${site.url || ""}/#sekolah` },
  };
}

/** Skema BreadcrumbList. */
export function jsonLdRemahRoti(
  daftar: Array<{ label: string; href: string }>,
): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: daftar.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      item: item.href || undefined,
    })),
  };
}

/** Tanggal pembaruan konten dalam format yang mudah dibaca mesin. */
export function tanggalPembaruan(): string {
  return formatTanggalISO(Date.parse(`${profil.updatedAt}T00:00:00Z`) / 1000);
}