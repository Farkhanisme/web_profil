import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { albumSatu } from "@/lib/queries/albums";
import { KepalaHalaman } from "@/components/admin/ui";
import { FormAlbum } from "../../album-form";

export const metadata: Metadata = { title: "Ubah Album" };

export default async function UbahAlbumPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const album = await albumSatu(id);
  if (!album) notFound();

  return (
    <>
      <KepalaHalaman
        judul="Ubah Album"
        deskripsi="Sampul juga bisa diganti dari halaman album."
        kembali={`/admin/albums/${album.id}`}
      />
      <FormAlbum
        id={album.id}
        awal={{
          title: album.title,
          slug: album.slug,
          description: album.description,
          cover: album.cover,
        }}
      />
    </>
  );
}
