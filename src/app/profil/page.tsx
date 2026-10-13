import type { Metadata } from "next";
import { bacaSitus } from "@/lib/queries/profil";
import { PROFIL_CONTOH, SITUS_LENGKAP } from "@/lib/contoh";
import { metadataDasar } from "@/lib/seo";
import { Kontainer } from "@/components/site/dasar";
import { DaftarIsi } from "@/components/site/blok";
import { Kerangka } from "@/components/site/kerangka";

export async function generateMetadata(): Promise<Metadata> {
  return metadataDasar("Profil Madrasah", undefined, "/profil");
}

/** Kartu lompat; di ponsel berupa tombol besar, bukan daftar teks kecil. */
const DAFTAR = [
  { href: "#identitas", label: "Identitas" },
  { href: "#sejarah", label: "Sejarah" },
  { href: "#visi-misi", label: "Visi dan Misi" },
  { href: "#sambutan", label: "Sambutan" },
  { href: "#struktur", label: "Struktur" },
  { href: "#fasilitas", label: "Fasilitas" },
  { href: "#faq", label: "Pertanyaan Umum" },
];

export default async function HalamanProfil() {
  // Data contoh dipakai selama config/profil.ts masih berisi "DRAF".
  const situsDb = await bacaSitus();
  const situs = {
    ...situsDb,
    ...SITUS_LENGKAP,
    identity: { ...situsDb.identity, ...SITUS_LENGKAP.identity },
    address: { ...situsDb.address, ...SITUS_LENGKAP.address },
    contact: { ...situsDb.contact, ...SITUS_LENGKAP.contact },
  };
  const profil = PROFIL_CONTOH;

  return (
    <Kerangka situs={situs}>
      {/* ============ JUDUL ============ */}
      <section className="bg-hijau-muda">
        <Kontainer>
          <div className="py-12 sm:py-16">
            <div className="h-1.5 w-14 rounded-full bg-hijau" aria-hidden="true" />
            <p className="label-bagian mt-4 text-hijau-tua">Profil Madrasah</p>
            <h1 className="mt-3 max-w-3xl text-display text-hijau-tua">
              {situs.name}
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-hijau-tua">
              {situs.description}
            </p>
          </div>
        </Kontainer>
      </section>

      {/* ============ DAFTAR ISI ============ */}
      <section className="border-b border-garis bg-putih">
        <Kontainer>
          <div className="py-8">
            <p className="label-bagian mb-4 text-tinta-3">
              Isi halaman ini
            </p>
            <DaftarIsi warna="hijau" items={DAFTAR} />
          </div>
        </Kontainer>
      </section>

      {/* ============ ISI: tiap bagian punya warna sendiri ============ */}
      <div className="space-y-14 py-14 lg:space-y-20 lg:py-20">
        {/* --- Identitas: biru --- */}
        <Kontainer>
          <section id="identitas" className="scroll-mt-24">
            <Bagian
              warna="biru"
              label="Identitas"
              judul="Data resmi madrasah"
            />
            <dl className="mt-8 grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {[
                ["Nama resmi", situs.name],
                ["Bentuk", situs.identity.status],
                ["NPSN", situs.identity.npsn],
                ["Akreditasi", `Peringkat ${situs.identity.accreditation}`],
                ["Kurikulum", situs.identity.curriculum],
                ["Pendiri", situs.identity.founder],
                ["Tahun berdiri", String(situs.identity.foundedYear)],
                ["Jenjang", "Kelas VII sampai IX"],
              ].map(([k, v]) => (
                <div key={k} className="border-b border-garis pb-3">
                  <dt className="text-[0.9375rem] text-tinta-3">{k}</dt>
                  <dd className="mt-0.5 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </Kontainer>

        {/* --- Sejarah: hijau muda --- */}
        <div className="bg-hijau-muda">
          <Kontainer>
            <section id="sejarah" className="scroll-mt-24 py-14 lg:py-16">
              <Bagian
                warna="hijau"
                label="Sejarah"
                judul="Perjalanan madrasah"
              />
              <div className="mt-8 space-y-4">
                {profil.sejarah.map((p) => (
                  <p key={p} className="max-w-3xl text-lg leading-relaxed text-hijau-tua">
                    {p}
                  </p>
                ))}
              </div>
            </section>
          </Kontainer>
        </div>

        {/* --- Visi dan misi: kuning muda --- */}
        <div className="bg-kuning-muda">
          <Kontainer>
            <section id="visi-misi" className="scroll-mt-24 py-14 lg:py-16">
              <Bagian
                warna="kuning"
                label="Visi dan Misi"
                judul="Arah pendidikan kami"
              />
              <div className="mt-8 rounded-2xl bg-kuning-terang p-6">
                <p className="label-bagian text-kuning-tua">Visi</p>
                <p className="mt-2 font-judul text-xl leading-snug font-bold text-kuning-tua">
                  {profil.visi}
                </p>
              </div>
              <p className="label-bagian mt-8 text-kuning-tua">Misi</p>
              <ol className="mt-3 grid gap-3 sm:grid-cols-2">
                {profil.misi.map((m, i) => (
                  <li
                    key={m}
                    className="flex gap-3 rounded-xl bg-putih p-4"
                  >
                    <span
                      className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-kuning-terang font-judul text-sm font-bold text-kuning-tua"
                      aria-hidden="true"
                    >
                      {i + 1}
                    </span>
                    <span className="text-[0.9375rem] leading-relaxed text-kuning-tua">
                      {m}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </Kontainer>
        </div>

        {/* --- Sambutan: putih --- */}
        <Kontainer>
          <section id="sambutan" className="scroll-mt-24">
            <Bagian
              warna="hijau"
              label="Sambutan"
              judul="Salam dari kepala madrasah"
            />
            <p className="mt-6 font-judul text-xl font-bold">
              {profil.sambutan.nama}
            </p>
            <p className="mt-1 text-tinta-3">{profil.sambutan.jabatan}</p>
            <div className="mt-6 space-y-4">
              {profil.sambutan.teks.map((t) => (
                <p key={t} className="max-w-3xl text-lg leading-relaxed text-tinta-2">
                  {t}
                </p>
              ))}
            </div>
          </section>
        </Kontainer>

        {/* --- Struktur: biru muda --- */}
        <div className="bg-biru-muda">
          <Kontainer>
            <section id="struktur" className="scroll-mt-24 py-14 lg:py-16">
              <Bagian
                warna="biru"
                label="Struktur"
                judul="Siapa mengelola madrasah"
              />
              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {profil.struktur.map((s) => (
                  <li
                    key={s.name}
                    className="rounded-xl bg-putih p-4"
                  >
                    <p className="font-judul leading-snug font-bold text-biru-tua">
                      {s.name}
                    </p>
                    <p className="mt-1 text-sm text-tinta-3">{s.position}</p>
                  </li>
                ))}
              </ul>
            </section>
          </Kontainer>
        </div>

        {/* --- Fasilitas: putih --- */}
        <Kontainer>
          <section id="fasilitas" className="scroll-mt-24">
            <Bagian
              warna="biru"
              label="Fasilitas"
              judul="Sarana yang tersedia"
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {profil.fasilitas.map((f) => (
                <li
                  key={f.name}
                  className="rounded-2xl border-2 border-biru-terang bg-putih p-5"
                >
                  <h3 className="font-judul text-lg leading-tight font-bold text-biru-tua">
                    {f.name}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-relaxed text-tinta-2">
                    {f.description}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </Kontainer>

        {/* --- FAQ: hijau muda --- */}
        <div className="bg-hijau-muda">
          <Kontainer>
            <section id="faq" className="scroll-mt-24 py-14 lg:py-16">
              <Bagian
                warna="hijau"
                label="Pertanyaan Umum"
                judul="Yang sering ditanyakan"
              />
              <ul className="mt-8 space-y-3">
                {profil.faq.map((f) => (
                  <li key={f.question} className="rounded-2xl bg-putih p-5">
                    <h3 className="font-judul text-lg leading-snug font-bold text-hijau-tua">
                      {f.question}
                    </h3>
                    <p className="mt-2 max-w-3xl text-[0.9375rem] leading-relaxed text-tinta-2">
                      {f.answer}
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          </Kontainer>
        </div>
      </div>
    </Kerangka>
  );
}

/** Judul bagian: garis + label berwarna + judul besar. */
function Bagian({
  warna,
  label,
  judul,
}: {
  warna: "hijau" | "jingga" | "biru" | "kuning";
  label: string;
  judul: string;
}) {
  const garis = {
    hijau: "bg-hijau",
    jingga: "bg-jingga",
    biru: "bg-biru",
    kuning: "bg-kuning-terang",
  }[warna];
  const teks = {
    hijau: "text-hijau-tua",
    jingga: "text-jingga-tua",
    biru: "text-biru-tua",
    kuning: "text-kuning-tua",
  }[warna];

  return (
    <div>
      <div className={`h-1.5 w-14 rounded-full ${garis}`} aria-hidden="true" />
      <p className={`label-bagian mt-4 ${teks}`}>{label}</p>
      <h2 className="mt-3 text-title">{judul}</h2>
    </div>
  );
}