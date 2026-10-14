import type { Metadata } from "next";
import { ekstrakurikulerSemua } from "@/lib/queries/konten";
import { DaftarKonten } from "../daftar-konten";
import { geserEkstrakurikuler, hapusEkstrakurikuler } from "../actions/konten";

export const metadata: Metadata = { title: "Ekstrakurikuler" };

export default async function HalamanEkstrakurikuler() {
  const daftar = await ekstrakurikulerSemua();

  return (
    <DaftarKonten
      judul="Ekstrakurikuler"
      deskripsi={`${daftar.length} kegiatan. Urutan di sini menentukan urutan tampil di halaman publik.`}
      basePath="/admin/extracurriculars"
      slugPrefix="ekstrakurikuler"
      baris={daftar.map((e) => ({
        id: e.id,
        slug: e.slug,
        name: e.name,
        summary: e.summary,
        image: e.image,
        isPublished: e.isPublished,        schedule: e.schedule,
      }))}
      aksiHapus={hapusEkstrakurikuler}
      actionGeser={geserEkstrakurikuler}
      pesanKosong="Tambahkan kegiatan ekstrakurikuler, lalu isi jadwal dan pembinanya. Nama saja sudah cukup untuk memulai."
    />
  );
}
