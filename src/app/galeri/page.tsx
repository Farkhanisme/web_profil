import type { Metadata } from "next";
import { albumTerbit } from "@/lib/queries/konten";
import { bacaSitus } from "@/lib/queries/profil";
import { metadataDasar } from "@/lib/seo";
import { Kontainer } from "@/components/site/dasar";
import { KartuProgram, JudulBagian } from "@/components/site/blok";
import { Kerangka } from "@/components/site/kerangka";

export async function generateMetadata(): Promise<Metadata> {
  return metadataDasar("Galeri Foto", undefined, "/galeri");
}

export default async function HalamanGaleri() {
  const [albums, situs] = await Promise.all([albumTerbit(), bacaSitus()]);

  return (
    <Kerangka situs={situs}>
      {/* ============ JUDUL: blok biru ============ */}
      <section className="bg-biru text-white">
        <Kontainer>
          <div className="py-12 sm:py-16">
            <div
              className="h-1.5 w-14 rounded-full bg-biru-terang"
              aria-hidden="true"
            />
            <p className="label-bagian mt-4 text-biru-terang">Galeri Foto</p>
            <h1 className="mt-3 max-w-3xl text-display">
              Kegiatan Madrasah
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
              Kenangan kegiatan belajar, ibadah, olahraga, dan acara
              madrasah yang tercatat kamera.
            </p>
            {albums.length > 0 && (
              <p className="mt-6 font-judul text-lg font-bold tabular-nums">
                {albums.length} album &middot; {albums.reduce((n, a) => n + a.photoCount, 0)} foto
              </p>
            )}
          </div>
        </Kontainer>
      </section>

      {albums.length === 0 ? (
        /* ============ BELUM ADA DATA ============ */
        <Kontainer>
          <div className="py-20 text-center">
            <p className="font-judul text-title text-biru-tua">
              Galeri belum diisi
            </p>
            <p className="mx-auto mt-3 max-w-lg text-tinta-2">
              Pengelola sekolah dapat membuat album dan mengunggah foto lewat
              menu Galeri. Halaman ini akan terisi otomatis setelah data
              disimpan.
            </p>
          </div>
        </Kontainer>
      ) : (
        <section className="bg-biru-muda">
          <Kontainer>
            <div className="py-14 lg:py-20">
              <JudulBagian
                warna="biru"
                label="Album Foto"
                judul="Album yang tersedia"
              />
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {albums.map((a) => (
                  <KartuProgram
                    key={a.id}
                    href={`/galeri/${a.slug}`}
                    nama={a.title}
                    ringkas={`${a.photoCount} foto${a.description ? ` &middot; ${a.description}` : ""}`}
                  />
                ))}
              </ul>
            </div>
          </Kontainer>
        </section>
      )}
    </Kerangka>
  );
}