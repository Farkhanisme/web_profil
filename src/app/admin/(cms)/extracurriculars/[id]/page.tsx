import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ekstrakurikulerSatu } from "@/lib/queries/konten";
import { KepalaHalaman } from "@/components/admin/ui";
import { simpanEkstrakurikuler } from "../../actions/konten";
import { FormKonten } from "../../konten-form";

export const metadata: Metadata = { title: "Ubah Ekstrakurikuler" };

export default async function UbahEkstrakurikulerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await ekstrakurikulerSatu(id);
  if (!data) notFound();

  return (
    <>
      <KepalaHalaman
        judul="Ubah Ekstrakurikuler"
        deskripsi="Perubahan langsung terlihat di halaman publik setelah disimpan."
        kembali="/admin/extracurriculars"
      />
      <FormKonten
        id={data.id}
        action={simpanEkstrakurikuler}
        kind="ekstrakurikuler"
        awal={{
          name: data.name,
          slug: data.slug,
          summary: data.summary,
          description: data.description,
          image: data.image,
          isPublished: data.isPublished,
          schedule: data.schedule,
          coach: data.coach,
        }}
      />
    </>
  );
}
