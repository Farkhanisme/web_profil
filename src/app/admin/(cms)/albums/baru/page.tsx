import type { Metadata } from "next";
import { KepalaHalaman } from "@/components/admin/ui";
import { FormAlbum } from "../album-form";

export const metadata: Metadata = { title: "Buat Album" };

export default function AlbumBaruPage() {
  return (
    <>
      <KepalaHalaman
        judul="Buat Album"
        deskripsi="Setelah album dibuat, Anda bisa langsung mengunggah fotonya."
        kembali="/admin/albums"
      />
      <FormAlbum />
    </>
  );
}
