import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { staffSatu } from "@/lib/queries/staff";
import { KepalaHalaman } from "@/components/admin/ui";
import { FormStaff } from "../staff-form";

export const metadata: Metadata = { title: "Ubah Guru atau Staf" };

export default async function UbahStaffPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await staffSatu(id);
  if (!data) notFound();

  return (
    <>
      <KepalaHalaman
        judul="Ubah Data"
        deskripsi="Perubahan langsung terlihat di halaman publik setelah disimpan."
        kembali="/admin/staff"
      />
      <FormStaff
        id={data.id}
        awal={{
          name: data.name,
          position: data.position,
          subject: data.subject,
          photo: data.photo,
          isPublished: data.isPublished,
        }}
      />
    </>
  );
}
