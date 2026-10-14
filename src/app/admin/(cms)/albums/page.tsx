import Link from "next/link";
import { Images, Plus } from "lucide-react";
import { albumSemua } from "@/lib/queries/albums";
import { hapusAlbum } from "../actions/albums";
import { KepalaHalaman, KeadaanKosong, Panel } from "@/components/admin/ui";
import { TombolHapus } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";

export const metadata = { title: "Galeri" };

export default async function HalamanAlbum({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [daftar, params] = await Promise.all([albumSemua(), searchParams]);

  return (
    <>
      <KepalaHalaman
        judul="Galeri"
        deskripsi={`${daftar.length} album. Buka album untuk menambah dan mengatur foto.`}
      >
        <Button asChild className="bg-primary hover:bg-primary-hover">
          <Link href="/admin/albums/baru">
            <Plus className="size-4" aria-hidden />
            Album baru
          </Link>
        </Button>
      </KepalaHalaman>

      {params.deleted === "1" ? (
        <div className="mb-4 rounded-lg border border-border bg-muted px-4 py-3 text-sm">
          Album dihapus. Foto di dalamnya ikut terhapus, berkas gambarnya
          tetap tersimpan.
        </div>
      ) : null}

      {daftar.length === 0 ? (
        <Panel>
          <KeadaanKosong
            judul="Belum ada album"
            pesan="Buat album untuk kegiatan belajar, Chavez, atau acara sekolah, lalu unggah fotonya."
            aksi={
              <Button asChild className="mt-1 bg-primary hover:bg-primary-hover">
                <Link href="/admin/albums/baru">
                  <Plus className="size-4" aria-hidden />
                  Buat album pertama
                </Link>
              </Button>
            }
          />
        </Panel>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {daftar.map((album) => (
            <Panel key={album.id} className="overflow-hidden">
              <Link
                href={`/admin/albums/${album.id}`}
                className="block transition-opacity hover:opacity-90"
              >
                <div className="aspect-[4/3] w-full bg-muted">
                  {album.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/media/${album.cover.id}?w=480`}
                      alt={album.cover.alt || album.title}
                      width={album.cover.width}
                      height={album.cover.height}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <Images className="size-8" aria-hidden />
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate font-medium">{album.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {album.photoCount} foto
                  </p>
                </div>
              </Link>
              <div className="flex justify-end border-t px-1 py-0.5">
                <TombolHapus
                  action={hapusAlbum}
                  id={album.id}
                  deskripsi={`Album "${album.title}" beserta ${album.photoCount} foto di dalamnya akan dihapus.`}
                />
              </div>
            </Panel>
          ))}
        </div>
      )}
    </>
  );
}
