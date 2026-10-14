import type { Metadata } from "next";
import { KepalaHalaman } from "@/components/admin/ui";
import { simpanProgram } from "../../actions/konten";
import { FormKonten } from "../../konten-form";

export const metadata: Metadata = { title: "Tambah Program" };

export default function TambahProgramPage() {
  return (
    <>
      <KepalaHalaman
        judul="Tambah Program"
        deskripsi="Slug URL dibuat otomatis dari nama bila dikosongkan."
        kembali="/admin/programs"
      />
      <FormKonten action={simpanProgram} kind="program" />
    </>
  );
}
