import type { Metadata } from "next";
import { Sparkles } from "lucide-react";
import { BreadcrumbAtas } from "@/components/site/breadcrumb";
import { PageHeader } from "@/components/site/page-header";
import { DaftarDenganJudul } from "@/components/site/kosong";
import { KartuKonten } from "@/components/site/kartu";
import { ekstrakurikulerTerbit } from "@/lib/queries/konten";
import { JsonLd, jsonLdRemahRoti } from "@/lib/json-ld";
import { metadataDasar, verifikasiPencari } from "@/lib/seo";
import { site } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const daftar = await ekstrakurikulerTerbit();
  const deskripsi =
    daftar.length > 0
      ? `Daftar ekstrakurikuler MTs Ma'arif Tieng: ${daftar.map((e) => e.name).join(", ")}.`
      : `Kegiatan ekstrakurikuler MTs Ma'arif Tieng, ${site.address.city}, ${site.address.province}.`;

  return {
    ...(await metadataDasar("Ekstrakurikuler", deskripsi, "/ekstrakurikuler")),
    verification: verifikasiPencari(),
  };
}

export default async function HalamanEkstrakurikuler() {
  const daftar = await ekstrakurikulerTerbit();

  return (
    <>
      <JsonLd
        data={jsonLdRemahRoti([
          { label: "Beranda", href: "/" },
          { label: "Ekstrakurikuler", href: "/ekstrakurikuler" },
        ])}
      />

      <BreadcrumbAtas nama="Ekstrakurikuler" segmen="ekstrakurikuler" />

      <PageHeader
        eyebrow="Kegiatan Pilihan"
        judul="Ekstrakurikuler"
        deskripsi="Kegiatan pilihan di luar jam pelajaran untuk mengembangkan minat, bakat, dan kerja sama siswa."
      />

      <DaftarDenganJudul
        judul="Daftar Kegiatan"
        deskripsi="Klik kegiatan untuk melihat jadwal dan pembina."
        jumlah={daftar.length}
        kosong={{
          judul: "Belum ada kegiatan",
          pesan:
            "Pengelola sekolah sedang menyiapkan daftar ekstrakurikuler. Silakan kembali lagi nanti.",
          ikon: Sparkles,
        }}
      >
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {daftar.map((e) => (
            <KartuKonten
              key={e.id}
              item={e}
              slugPrefix="ekstrakurikuler"
              tampilkanJadwal
            />
          ))}
        </ul>
      </DaftarDenganJudul>
    </>
  );
}