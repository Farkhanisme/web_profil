import type { Metadata } from "next";
import { staffTerbit } from "@/lib/queries/staff";
import { SITUS_LENGKAP, STAFF_CONTOH } from "@/lib/contoh";
import { bacaSitus } from "@/lib/queries/profil";
import { metadataDasar } from "@/lib/seo";
import { Kontainer } from "@/components/site/dasar";
import { KartuGuru } from "@/components/site/blok";
import { Kerangka } from "@/components/site/kerangka";

export async function generateMetadata(): Promise<Metadata> {
  return metadataDasar("Guru dan Staf", undefined, "/guru");
}

export default async function HalamanGuru() {
  const [staffDb, situsDb] = await Promise.all([staffTerbit(), bacaSitus()]);
  // Data contoh dipakai selama tabel staff masih kosong.
  const staff = staffDb.length > 0 ? staffDb : STAFF_CONTOH;
  const situs = {
    ...situsDb,
    ...SITUS_LENGKAP,
    identity: { ...situsDb.identity, ...SITUS_LENGKAP.identity },
    address: { ...situsDb.address, ...SITUS_LENGKAP.address },
    contact: { ...situsDb.contact, ...SITUS_LENGKAP.contact },
  };

  const pimpinan = staff.filter((s) =>
    ["Kepala Madrasah", "Sekretaris Madrasah", "Ketua Tata Usaha"].includes(
      s.position,
    ),
  );
  const kepalaBagian = staff.filter((s) =>
    s.position.startsWith("Kepala Bagian"),
  );
  const guru = staff.filter(
    (s) =>
      !["Kepala Madrasah", "Sekretaris Madrasah", "Ketua Tata Usaha"].includes(
        s.position,
      ) && !s.position.startsWith("Kepala Bagian"),
  );

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
            <p className="label-bagian mt-4 text-biru-terang">Guru dan Staf</p>
            <h1 className="mt-3 max-w-3xl text-display">
              Guru yang mendampingi anak
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
              Seluruh pengajar memiliki ijazah minimal S1 dan sertifikat
              kompetensi guru. Daftar diperbarui oleh pengelola sekolah.
            </p>
            <p className="mt-6 font-judul text-lg font-bold">
              {staff.length} orang
            </p>
          </div>
        </Kontainer>
      </section>

      <div className="space-y-14 py-14 lg:space-y-16 lg:py-20">
        {pimpinan.length > 0 && (
          <Kontainer>
            <Bagian label="Pimpinan" judul="Pimpinan madrasah" />
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
                <Bagian label="Bidang" judul="Kepala bagian" />
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
            <Bagian label="Guru" judul={`${guru.length} guru pengajar`} />
            <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {guru.map((s) => (
                <KartuGuru key={s.id} s={s} />
              ))}
            </ul>
          </Kontainer>
        )}
      </div>
    </Kerangka>
  );
}

function Bagian({ label, judul }: { label: string; judul: string }) {
  return (
    <div>
      <div className="h-1.5 w-14 rounded-full bg-biru" aria-hidden="true" />
      <p className="label-bagian mt-4 text-biru-tua">{label}</p>
      <h2 className="mt-3 text-title">{judul}</h2>
    </div>
  );
}