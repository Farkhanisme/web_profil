import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { programSatu } from "@/lib/queries/konten";
import { KepalaHalaman } from "@/components/admin/ui";
import { simpanProgram } from "../../actions/konten";
import { FormKonten } from "../../konten-form";

export const metadata: Metadata = { title: "Ubah Program" };

export default async function UbahProgramPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await programSatu(id);
  if (!data) notFound();

  return (
    <>
      <KepalaHalaman
        judul="Ubah Program"
        deskripsi="Perubahan langsung terlihat di halaman publik setelah disimpan."
        kembali="/admin/programs"
      />
      <FormKonten
        id={data.id}
        action={simpanProgram}
        kind="program"
        awal={{
          name: data.name,
          slug: data.slug,
          summary: data.summary,
          description: data.description,
          image: data.image,
          isPublished: data.isPublished,
        }}
      />
    </>
  );
}
