import type { Metadata } from "next";
import { Users } from "lucide-react";
import { BreadcrumbAtas } from "@/components/site/breadcrumb";
import { PageHeader } from "@/components/site/page-header";
import { DaftarDenganJudul } from "@/components/site/kosong";
import { KartuStaff } from "@/components/site/kartu";
import { staffTerbit } from "@/lib/queries/staff";
import { JsonLd, jsonLdRemahRoti } from "@/lib/json-ld";
import { site } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const daftar = await staffTerbit();
  const deskripsi =
    daftar.length > 0
      ? `Daftar ${daftar.length} guru dan staf MTs Ma'arif Tieng, ${site.address.city}, ${site.address.province}.`
      : `Guru dan staf MTs Ma'arif Tieng, ${site.address.city}, ${site.address.province}.`;

  return {
    title: "Guru dan Staf",
    description: deskripsi,
    alternates: { canonical: "/guru" },
    openGraph: {
      title: `Guru dan Staf | ${site.name}`,
      description: deskripsi,
      url: "/guru",
    },
  };
}

export default async function HalamanGuru() {
  const daftar = await staffTerbit();

  return (
    <>
      <JsonLd
        data={jsonLdRemahRoti([
          { label: "Beranda", href: "/" },
          { label: "Guru dan Staf", href: "/guru" },
        ])}
      />

      <BreadcrumbAtas nama="Guru dan Staf" segmen="guru" />

      <PageHeader
        eyebrow="Tenaga Pendidik"
        judul="Guru dan Staf"
        deskripsi={`Guru, tenaga kependidikan, dan pengelola sekolah yang mendampingi setiap siswa ${site.name}.`}
      />

      <DaftarDenganJudul
        judul="Daftar Guru dan Staf"
        deskripsi="Urutan sesuai ketentuan sekolah."
        jumlah={daftar.length}
        kosong={{
          judul: "Daftar guru belum tersedia",
          pesan:
            "Pengelola sekolah sedang menyiapkan daftar guru dan staf. Silakan kembali lagi nanti.",
          ikon: Users,
        }}
      >
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {daftar.map((orang) => (
            <KartuStaff key={orang.id} orang={orang} />
          ))}
        </ul>
      </DaftarDenganJudul>
    </>
  );
}