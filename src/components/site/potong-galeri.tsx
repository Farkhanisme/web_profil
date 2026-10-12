import Link from "next/link";
import { ArrowRight, Images } from "lucide-react";
import { Container } from "@/components/site/container";
import { GambarMedia } from "@/components/site/gambar-media";
import { JudulBagian } from "@/components/site/page-header";

export interface FotoRingkas {
  id: string;
  mediaId: string;
  caption: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Cuplikan galeri: enam foto terbaru.
 *
 * Thumbnail 480 px agar ringan di jaringan seluler. Semua gambar punya
 * dimensi tetap sehingga tidak ada pergeseran tata letak saat dimuat.
 */
export function PotongGaleri({
  foto,
  adaAlbum,
}: {
  foto: FotoRingkas[];
  adaAlbum: boolean;
}) {
  if (foto.length === 0) return null;

  return (
    <section className="border-b">
      <Container>
        <div className="py-12 sm:py-14">
          <JudulBagian
            judul="Galeri Kegiatan"
            deskripsi="Cuplikan kegiatan dan fasilitas sekolah."
            aksi={
              adaAlbum ? (
                <Link
                  href="/galeri"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Lihat galeri
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              ) : undefined
            }
          />

          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {foto.map((item, i) => (
              <li
                key={item.id}
                className="animate-fade-up overflow-hidden rounded-lg bg-muted"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <Link
                  href="/galeri"
                  className="block aspect-square w-full"
                  aria-label={item.caption || "Foto kegiatan sekolah"}
                >
                  <GambarMedia
                    id={item.mediaId}
                    alt={item.alt || item.caption || "Foto kegiatan sekolah"}
                    width={item.width}
                    height={item.height}
                    lebar={240}
                    className="h-full w-full transition-transform duration-300 hover:scale-105"
                  />
                </Link>
              </li>
            ))}
          </ul>

          {!adaAlbum ? (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Images className="size-4 opacity-70" aria-hidden />
              Album foto sedang disiapkan pengelola sekolah.
            </p>
          ) : null}
        </div>
      </Container>
    </section>
  );
}