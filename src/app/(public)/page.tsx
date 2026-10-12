import { Hero } from "@/components/site/hero";
import { Statistik } from "@/components/site/statistik";
import { Sambutan } from "@/components/site/sambutan";
import { PotongKonten } from "@/components/site/potong-konten";
import { PotongGaleri } from "@/components/site/potong-galeri";
import { BlokKontak } from "@/components/site/blok-kontak";
import { pengaturanSitus } from "@/lib/queries/settings";
import {
  ekstrakurikulerTerbit,
  jumlahEkstrakurikuler,
  programTerbit,
} from "@/lib/queries/konten";
import { jumlahStaff } from "@/lib/queries/staff";
import { fotoTerbaru, jumlahAlbum } from "@/lib/queries/albums";
import { JsonLd, jsonLdSekolah, jsonLdSitus } from "@/lib/json-ld";
import { profil } from "@/config/profil";
import { site } from "@/config/site";

/**
 * Beranda.
 *
 * Seluruh isi diambil dari kueri bertag, sehingga halaman ini
 * di-prerender dan dilayani dari CDN. Begitu admin menyimpan data,
 * `updateTag()` membuat halaman ini diperbarui tanpa deploy ulang.
 */
export default async function Beranda() {
  const [pengaturan, program, ekstrakurikuler, guru, jmlEkstra, album, foto] =
    await Promise.all([
      pengaturanSitus(),
      programTerbit(),
      ekstrakurikulerTerbit(),
      jumlahStaff(),
      jumlahEkstrakurikuler(),
      jumlahAlbum(),
      fotoTerbaru(6),
    ]);

  return (
    <>
      {/*
        Data terstruktur untuk mesin pencari dan mesin AI.
        School dan WebSite adalah dua skema yang paling sering dibaca
        mesin AI saat menjawab pertanyaan tentang sebuah sekolah.
      */}
      <JsonLd data={[jsonLdSekolah(), jsonLdSitus()]} />

      <Hero logoId={pengaturan.logoMediaId} nama={site.name} />

      <div className="border-b bg-background">
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          <Statistik
            siswa={site.stats.students > 0 ? site.stats.students : null}
            guru={guru > 0 ? guru : null}
            ekstrakurikuler={jmlEkstra > 0 ? jmlEkstra : null}
            tahunBerdiri={
              site.identity.foundedYear > 0 ? site.identity.foundedYear : null
            }
          />
        </div>
      </div>

      <Sambutan
        nama={profil.sambutan.nama}
        jabatan={profil.sambutan.jabatan}
        teks={[...profil.sambutan.teks]}
      />

      <PotongKonten
        judul="Program Sekolah"
        deskripsi="Program pembelajaran di sekolah."
        slugPrefix="program"
        semua={program}
      />

      <PotongKonten
        judul="Ekstrakurikuler"
        deskripsi="Kegiatan pilihan untuk mengembangkan minat dan bakat siswa."
        slugPrefix="ekstrakurikuler"
        semua={ekstrakurikuler}
        tampilkanJadwal
      />

      <PotongGaleri
        foto={foto.map((f) => ({
          id: f.id,
          mediaId: f.mediaId,
          caption: f.caption,
          width: f.width,
          height: f.height,
          alt: f.alt,
        }))}
        adaAlbum={album > 0}
      />

      <BlokKontak />
    </>
  );
}