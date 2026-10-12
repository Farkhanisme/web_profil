import type { Metadata } from "next";
import { KepalaHalaman } from "@/components/admin/ui";
import { FormStaff } from "../staff-form";

export const metadata: Metadata = { title: "Tambah Guru atau Staf" };

export default function TambahStaffPage() {
  return (
    <>
      <KepalaHalaman
        judul="Tambah Guru atau Staf"
        deskripsi="Isi nama dan jabatan. Foto bersifat opsional."
        kembali="/admin/staff"
      />
      <FormStaff />
    </>
  );
}
