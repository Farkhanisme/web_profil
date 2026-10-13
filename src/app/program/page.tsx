import type { Metadata } from "next";
import { programTerbit } from "@/lib/queries/konten";
import { bacaSitus } from "@/lib/queries/profil";
import { metadataDasar } from "@/lib/seo";
import { Kontainer } from "@/components/site/dasar";
import { KartuProgram, JudulBagian } from "@/components/site/blok";
import { Kerangka } from "@/components/site/kerangka";

export async function generateMetadata(): Promise<Metadata> {
  return metadataDasar("Program Pendidikan", undefined, "/program");
}

export default async function HalamanProgram() {
  const [program, situs] = await Promise.all([programTerbit(), bacaSitus()]);

  return (
    <Kerangka situs={situs}>
      {/* ============ JUDUL: blok jingga ============ */}
      <section className="bg-jingga text-white">
        <Kontainer>
          <div className="py-12 sm:py-16">
            <div
              className="h-1.5 w-14 rounded-full bg-jingga-terang"
              aria-hidden="true"
            />
            <p className="label-bagian mt-4 text-jingga-terang">Program</p>
            <h1 className="mt-3 max-w-3xl text-display">
              Program Pendidikan
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
              Program terstruktur yang menggabungkan ilmu agama dan ilmu
              pengetahuan umum, disesuaikan dengan Kurikulum Merdeka
              Madrasah.
            </p>
            {program.length > 0 && (
              <p className="mt-6 font-judul text-lg font-bold tabular-nums">
                {program.length} program tersedia
              </p>
            )}
          </div>
        </Kontainer>
      </section>

      {program.length === 0 ? (
        /* ============ BELUM ADA DATA ============ */
        <Kontainer>
          <div className="py-20 text-center">
            <p className="font-judul text-title text-jingga-tua">
              Program belum diisi
            </p>
            <p className="mx-auto mt-3 max-w-lg text-tinta-2">
              Pengelola sekolah dapat menambah program lewat menu Program.
              Halaman ini akan terisi otomatis setelah data disimpan.
            </p>
          </div>
        </Kontainer>
      ) : (
        <section className="bg-jingga-muda">
          <Kontainer>
            <div className="py-14 lg:py-20">
              <JudulBagian
                warna="jingga"
                label="Daftar Program"
                judul="Program yang tersedia"
              />
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {program.map((p) => (
                  <KartuProgram
                    key={p.id}
                    href={`/program/${p.slug}`}
                    nama={p.name}
                    ringkas={p.summary}
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