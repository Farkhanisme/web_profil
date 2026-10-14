import type { Metadata } from "next";
import { ekstrakurikulerTerbit } from "@/lib/queries/konten";
import { bacaSitus } from "@/lib/queries/profil";
import { metadataDasar } from "@/lib/seo";
import { JsonLd, jsonLdRemahRoti } from "@/lib/json-ld";
import { Kontainer } from "@/components/site/dasar";
import { KartuProgram, JudulBagian } from "@/components/site/blok";
import { Kerangka } from "@/components/site/kerangka";

export async function generateMetadata(): Promise<Metadata> {
  return metadataDasar(
    "Ekstrakurikuler",
    "Kegiatan di luar kelas di MTs Ma'arif Tieng, lengkap dengan jadwal, pembina, dan deskripsi singkat.",
    "/ekstrakurikuler",
  );
}

export default async function HalamanEkstrakurikuler() {
  const [ekstra, situs] = await Promise.all([
    ekstrakurikulerTerbit(),
    bacaSitus(),
  ]);

  return (
    <Kerangka situs={situs}>
      <JsonLd
        data={jsonLdRemahRoti([
          { label: "Beranda", href: "/" },
          { label: "Ekstrakurikuler" },
        ])}
      />
      {/* ============ JUDUL: blok jingga ============ */}
      <section className="bg-jingga text-white">
        <Kontainer>
          <div className="py-12 sm:py-16">
            <div
              className="h-1.5 w-14 rounded-full bg-jingga-terang"
              aria-hidden="true"
            />
            <p className="label-bagian mt-4 text-jingga-terang">
              Ekstrakurikuler
            </p>
            <h1 className="mt-3 max-w-3xl text-display">
              Kegiatan di Luar Kelas
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
              Anak menemukan bakat, belajar kerja sama, dan mengembangkan
              karakter lewat kegiatan yang dibina guru.
            </p>
            {ekstra.length > 0 && (
              <p className="mt-6 font-judul text-lg font-bold tabular-nums">
                {ekstra.length} kegiatan tersedia
              </p>
            )}
          </div>
        </Kontainer>
      </section>

      {ekstra.length === 0 ? (
        /* ============ BELUM ADA DATA ============ */
        <Kontainer>
          <div className="py-20 text-center">
            <p className="font-judul text-title text-jingga-tua">
              Ekstrakurikuler belum diisi
            </p>
            <p className="mx-auto mt-3 max-w-lg text-tinta-2">
              Pengelola sekolah dapat menambah kegiatan lewat menu
              Ekstrakurikuler. Halaman ini akan terisi otomatis setelah
              data disimpan.
            </p>
          </div>
        </Kontainer>
      ) : (
        <section className="bg-jingga-muda">
          <Kontainer>
            <div className="py-14 lg:py-20">
              <JudulBagian
                warna="jingga"
                label="Daftar Ekstrakurikuler"
                judul="Kegiatan yang tersedia"
              />
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ekstra.map((e) => (
                  <KartuProgram
                    key={e.id}
                    href={`/ekstrakurikuler/${e.slug}`}
                    nama={e.name}
                    ringkas={e.summary}
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