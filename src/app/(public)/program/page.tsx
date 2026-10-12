import type { Metadata } from "next";
import { GraduationCap } from "lucide-react";
import { BreadcrumbAtas } from "@/components/site/breadcrumb";
import { PageHeader } from "@/components/site/page-header";
import { DaftarDenganJudul } from "@/components/site/kosong";
import { KartuKonten } from "@/components/site/kartu";
import { programTerbit } from "@/lib/queries/konten";
import { JsonLd, jsonLdRemahRoti } from "@/lib/json-ld";
import { site } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const daftar = await programTerbit();
  const deskripsi =
    daftar.length > 0
      ? `Daftar program sekolah MTs Ma'arif Tieng: ${daftar.map((p) => p.name).join(", ")}.`
      : `Program sekolah MTs Ma'arif Tieng, ${site.address.city}, ${site.address.province}.`;

  return {
    title: "Program Sekolah",
    description: deskripsi,
    alternates: { canonical: "/program" },
    openGraph: {
      title: `Program Sekolah | ${site.name}`,
      description: deskripsi,
      url: "/program",
    },
  };
}

export default async function HalamanProgram() {
  const daftar = await programTerbit();

  return (
    <>
      <JsonLd
        data={jsonLdRemahRoti([
          { label: "Beranda", href: "/" },
          { label: "Program", href: "/program" },
        ])}
      />

      <BreadcrumbAtas nama="Program" segmen="program" />

      <PageHeader
        eyebrow="Lembaga"
        judul="Program Sekolah"
        deskripsi="Program pembelajaran dan kegiatan sekolah yang mendukung tumbuh kembang siswa."
      />

      <DaftarDenganJudul
        judul="Daftar Program"
        deskripsi="Klik program untuk membaca penjelasan lengkap."
        jumlah={daftar.length}
        kosong={{
          judul: "Belum ada program",
          pesan:
            "Pengelola sekolah sedang menyiapkan daftar program. Silakan kembali lagi nanti.",
          ikon: GraduationCap,
        }}
      >
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {daftar.map((p) => (
            <KartuKonten key={p.id} item={p} slugPrefix="program" />
          ))}
        </ul>
      </DaftarDenganJudul>
    </>
  );
}