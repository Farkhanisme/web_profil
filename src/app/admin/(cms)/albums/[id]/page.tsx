import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { albumSatu, fotoAlbum } from "@/lib/queries/albums";
import { KepalaHalaman, Panel } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";
import { KelolaFoto } from "./kelola-foto";

export const metadata: Metadata = { title: "Kelola Album" };

export default async function AlbumDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const [album, foto, query] = await Promise.all([
    albumSatu(id),
    fotoAlbum(id),
    searchParams,
  ]);

  if (!album) notFound();

  return (
    <>
      <KepalaHalaman
        judul={album.title}
        deskripsi={`${album.photoCount} foto - ${album.photoCount === 1 ? "1 foto" : "foto tersimpan"}`}
        kembali="/admin/albums"
      >
        <Button asChild variant="outline">
          <Link href={`/admin/albums/${album.id}/ubah`}>Ubah album</Link>
        </Button>
      </KepalaHalaman>

      {query.created === "1" ? (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-primary">
          Album dibuat. Silakan unggah fotonya di bawah ini.
        </div>
      ) : null}
      {query.saved === "1" ? (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-primary">
          Perubahan album tersimpan.
        </div>
      ) : null}

      {album.description ? (
        <p className="mb-5 max-w-2xl text-sm text-muted-foreground">
          {album.description}
        </p>
      ) : null}

      <Panel className="p-4 sm:p-5">
        <KelolaFoto
          albumId={album.id}
          coverAwal={album.cover?.id ?? null}
          fotoAwal={foto.map((f) => ({
            id: f.id,
            caption: f.caption,
            media: {
              id: f.media.id,
              width: f.media.width,
              height: f.media.height,
              alt: f.media.alt,
            },
          }))}
        />
      </Panel>
    </>
  );
}
