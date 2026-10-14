import type { Metadata } from "next";
import { programSemua } from "@/lib/queries/konten";
import { DaftarKonten } from "../daftar-konten";
import { geserProgram, hapusProgram } from "../actions/konten";

export const metadata: Metadata = { title: "Program" };

export default async function HalamanProgram() {
  const daftar = await programSemua();

  return (
    <DaftarKonten
      judul="Program"
      deskripsi={`${daftar.length} program. Urutan di sini menentukan urutan tampil di halaman publik.`}
      basePath="/admin/programs"
      slugPrefix="program"
      baris={daftar.map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        summary: p.summary,
        image: p.image,
        isPublished: p.isPublished,      }))}
      aksiHapus={hapusProgram}
      actionGeser={geserProgram}
      pesanKosong="Tambahkan program sekolah seperti pembelajaran tematik, literasi, atau الطلاب. Nama dan ringkasan saja sudah cukup untuk memulai."
    />
  );
}
