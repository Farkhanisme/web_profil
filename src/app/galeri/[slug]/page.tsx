import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { albumSemua, albumBySlug, fotoAlbum } from "@/lib/queries/albums";
import { bacaSitus } from "@/lib/queries/profil";
import { metadataDasar } from "@/lib/seo";
import { JsonLd, jsonLdRemahRoti } from "@/lib/json-ld";
import { Kontainer } from "@/components/site/dasar";
import { KartuProgram, JudulBagian } from "@/components/site/blok";
import { Kerangka } from "@/components/site/kerangka";
import { RemahRoti } from "@/components/site/remah-roti";
import { ContactSheet } from "@/components/site/contact-sheet";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const album = await albumBySlug(slug);
  if (!album) return { title: "Tidak Ditemukan" };
  return metadataDasar(album.title, album.description, `/galeri/${slug}`);
}

export async function generateStaticParams() {
  const albums = await albumSemua();
  return albums.map((a) => ({ slug: a.slug }));
}

function AlbumLain({ albumId }: { albumId: string }) {
  return <AlbumLainAsync albumId={albumId} />;
}

async function AlbumLainAsync({ albumId }: { albumId: string }) {
  const albums = await albumSemua();
  const lain = albums.filter((a) => a.id !== albumId).slice(0, 3);

  if (lain.length === 0) return null;

  return (
    <>
      <hr className="my-14 border-garis" />
      <JudulBagian
        warna="biru"
        label="Album Lain"
        judul="Album lain yang mungkin Anda suka"
      />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lain.map((a) => (
          <KartuProgram
            key={a.id}
            href={`/galeri/${a.slug}`}
            nama={a.title}
            ringkas={`${a.photoCount} foto${a.description ? ` · ${a.description}` : ""}`}
          />
        ))}
      </ul>
    </>
  );
}

export default async function HalamanAlbumDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [album, situs] = await Promise.all([albumBySlug(slug), bacaSitus()]);

  if (!album) notFound();

  // Foto diambil lewat kueri album; medianya selalu ada karena kueri
  // memakai JOIN, jadi tidak perlu penyaringan tambahan di sini.
  const fotos = await fotoAlbum(album.id);

  // Data untuk contact sheet dan lightbox. `srcMini` dipakai untuk kisi
  // (bukan `src` yang 1600px), sehingga ponsel tidak mengunduh gambar
  // besar hanya untuk melihat thumbnail.
  const fotoGaleri = fotos.map((f) => ({
    id: f.id,
    src: `/media/${f.media.id}?w=1600`,
    srcMini: `/media/${f.media.id}?w=800`,
    caption: f.caption,
    width: f.media.width,
    height: f.media.height,
  }));

  return (
    <Kerangka situs={situs}>
      <JsonLd
        data={jsonLdRemahRoti([
          { label: "Beranda", href: "/" },
          { label: "Galeri Foto", href: "/galeri" },
          { label: album.title },
        ])}
      />
      {/* ============ JUDUL: blok biru ============ */}
      <section className="bg-biru text-white">
        <Kontainer>
          <div className="py-12 sm:py-16">
            <RemahRoti
              items={[
                { label: "Beranda", href: "/" },
                { label: "Galeri", href: "/galeri" },
                { label: album.title },
              ]}
            />
            <div
              className="mt-6 h-1.5 w-14 rounded-full bg-biru-terang"
              aria-hidden="true"
            />
            <p className="label-bagian mt-4 text-white">Galeri Foto</p>
            <h1 className="mt-3 max-w-3xl text-display">{album.title}</h1>
            {album.description && (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/95">
                {album.description}
              </p>
            )}
            <p className="mt-6 font-judul text-lg font-bold tabular-nums">
              {fotos.length} foto
            </p>
          </div>
        </Kontainer>
      </section>

      <section className="bg-putih">
        <Kontainer>
          <div className="py-14 lg:py-20">
            {/* ============ CONTACT SHEET ============ */}
            {fotos.length === 0 ? (
              <div className="text-center py-20">
                <p className="font-judul text-title text-biru-tua">
                  Album ini belum punya foto
                </p>
                <p className="mx-auto mt-3 max-w-lg text-tinta-2">
                  Foto dapat ditambahkan pengelola lewat menu Galeri.
                </p>
              </div>
            ) : (
              <ContactSheet
                albumTitle={album.title}
                photos={fotoGaleri}
              />
            )}
            <AlbumLain albumId={album.id} />
          </div>
        </Kontainer>
      </section>
    </Kerangka>
  );
}