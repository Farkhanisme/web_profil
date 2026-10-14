import type { Metadata } from "next";
import { staffTerbit } from "@/lib/queries/staff";
import { bacaSitus } from "@/lib/queries/profil";
import { metadataDasar } from "@/lib/seo";
import { JsonLd, jsonLdSekolah } from "@/lib/json-ld";
import { Kontainer } from "@/components/site/dasar";
import { KartuGuru, JudulBagian } from "@/components/site/blok";
import { Kerangka } from "@/components/site/kerangka";

export async function generateMetadata(): Promise<Metadata> {
  return metadataDasar(
    "Guru dan Staf",
    "Nama, jabatan, dan mata pelajaran yang diampu guru serta staf MTs Ma'arif Tieng.",
    "/guru",
  );
}

/** Jabatan yang masuk kelompok pimpinan, bukan guru pengajar. */
const JABATAN_PIMPINAN = [
  "Kepala Madrasah",
  "Sekretaris Madrasah",
  "Ketua Tata Usaha",
];

export default async function HalamanGuru() {
  const [staff, situs] = await Promise.all([staffTerbit(), bacaSitus()]);

  const pimpinan = staff.filter((s) => JABATAN_PIMPINAN.includes(s.position));
  const kepalaBagian = staff.filter((s) =>
    s.position.startsWith("Kepala Bagian"),
  );
  const guru = staff.filter(
    (s) =>
      !JABATAN_PIMPINAN.includes(s.position) &&
      !s.position.startsWith("Kepala Bagian"),
  );

  return (
    <Kerangka situs={situs}>
      <JsonLd data={jsonLdSekolah(situs)} />
      {/* ============ JUDUL: blok biru ============ */}
      <section className="bg-biru text-white">
        <Kontainer>
          <div className="py-12 sm:py-16">
            <div
              className="h-1.5 w-14 rounded-full bg-biru-terang"
              aria-hidden="true"
            />
            <p className="label-bagian mt-4 text-biru-terang">Guru dan Staf</p>
            <h1 className="mt-3 max-w-3xl text-display">
              Guru yang mendampingi anak
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
              Seluruh pengajar memiliki ijazah minimal S1 dan sertifikat
              kompetensi guru. Daftar diperbarui oleh pengelola sekolah.
            </p>
            {staff.length > 0 && (
              <p className="mt-6 font-judul text-lg font-bold tabular-nums">
                {staff.length} orang
              </p>
            )}
          </div>
        </Kontainer>
      </section>

      {staff.length === 0 ? (
        /* ============ BELUM ADA DATA ============ */
        <Kontainer>
          <div className="py-20 text-center">
            <p className="font-judul text-title text-biru-tua">
              Daftar guru belum diisi
            </p>
            <p className="mx-auto mt-3 max-w-lg text-tinta-2">
              Pengelola sekolah dapat menambah nama dan mata pelajaran lewat
              menu Guru dan Staf. Halaman ini akan terisi otomatis setelah
              data disimpan.
            </p>
          </div>
        </Kontainer>
      ) : (
        <div className="space-y-14 py-14 lg:space-y-16 lg:py-20">
          {pimpinan.length > 0 && (
            <Kontainer>
              <JudulBagian
                warna="biru"
                label="Pimpinan"
                judul="Pimpinan madrasah"
              />
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {pimpinan.map((s) => (
                  <KartuGuru key={s.id} s={s} />
                ))}
              </ul>
            </Kontainer>
          )}

          {kepalaBagian.length > 0 && (
            <div className="bg-biru-muda">
              <Kontainer>
                <section className="py-14 lg:py-16">
                  <JudulBagian
                    warna="biru"
                    label="Bidang"
                    judul="Kepala bagian"
                  />
                  <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {kepalaBagian.map((s) => (
                      <KartuGuru key={s.id} s={s} />
                    ))}
                  </ul>
                </section>
              </Kontainer>
            </div>
          )}

          {guru.length > 0 && (
            <Kontainer>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <JudulBagian
                  warna="biru"
                  label="Guru"
                  judul="Guru pengajar"
                />
                <p className="text-sm text-tinta-3 tabular-nums">
                  {guru.length} orang
                </p>
              </div>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {guru.map((s) => (
                  <KartuGuru key={s.id} s={s} />
                ))}
              </ul>
            </Kontainer>
          )}
        </div>
      )}
    </Kerangka>
  );
}