import type { Metadata } from "next";
import { KepalaHalaman } from "@/components/admin/ui";
import { simpanEkstrakurikuler } from "../../actions/konten";
import { FormKonten } from "../../konten-form";

export const metadata: Metadata = { title: "Tambah Ekstrakurikuler" };

export default function TambahEkstrakurikulerPage() {
  return (
    <>
      <KepalaHalaman
        judul="Tambah Ekstrakurikuler"
        deskripsi="Jadwal dan pembina boleh diisi nanti."
        kembali="/admin/extracurriculars"
      />
      <FormKonten action={simpanEkstrakurikuler} kind="ekstrakurikuler" />
    </>
  );
}
