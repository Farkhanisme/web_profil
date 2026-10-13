import type { Metadata } from "next";
import { bacaProfil, bacaSitus } from "@/lib/queries/profil";
import { terisi, tahunTerisi } from "@/lib/konten";
import { metadataDasar } from "@/lib/seo";
import { Kontainer } from "@/components/site/dasar";
import { DaftarIsi, JudulBagian } from "@/components/site/blok";
import { Kerangka } from "@/components/site/kerangka";

export async function generateMetadata(): Promise<Metadata> {
  return metadataDasar("Profil Madrasah", undefined, "/profil");
}

export default async function HalamanProfil() {
  const [situs, profil] = await Promise.all([bacaSitus(), bacaProfil()]);

  /*
   * Bagian yang isinya belum diisi disembunyikan, bukan ditampilkan
   * sebagai placeholder. Pengunjung tidak boleh melihat teks draf;
   * halaman tetap utuh karena bagian lain masih punya isi.
   */
  const sejarahBersih = profil.sejarah.filter(terisi);
  const misiBersih = profil.misi.filter(terisi);
  const strukturBersih = profil.struktur.filter((s) => terisi(s.name) && terisi(s.position));
  const fasilitasBersih = profil.fasilitas.filter((f) => terisi(f.name));
  const faqBersih = profil.faq.filter((f) => terisi(f.question) && terisi(f.answer));

  const adaSejarah = sejarahBersih.length > 0;
  const adaVisi = terisi(profil.visi);
  const adaMisi = misiBersih.length > 0;
  const adaSambutan = terisi(profil.sambutan.nama);
  const adaStruktur = strukturBersih.length > 0;
  const adaFasilitas = fasilitasBersih.length > 0;
  const adaFaq = faqBersih.length > 0;

  // Kartu daftar isi dibangun dari bagian yang benar-benar ada.
  const daftar = [
    adaSejarah && { href: "#sejarah", label: "Sejarah" },
    (adaVisi || adaMisi) && { href: "#visi-misi", label: "Visi dan Misi" },
    adaSambutan && { href: "#sambutan", label: "Sambutan" },
    adaStruktur && { href: "#struktur", label: "Struktur" },
    adaFasilitas && { href: "#fasilitas", label: "Fasilitas" },
    adaFaq && { href: "#faq", label: "Pertanyaan Umum" },
  ].filter((x): x is { href: string; label: string } => Boolean(x));

  // Identitas: hanya tampilkan yang sudah diisi pengelola.
  const identitas = [
    ["Nama resmi", situs.name],
    terisi(situs.identity.status) && ["Bentuk", situs.identity.status],
    terisi(situs.identity.npsn) && ["NPSN", situs.identity.npsn],
    terisi(situs.identity.accreditation) && [
      "Akreditasi",
      `Peringkat ${situs.identity.accreditation}`,
    ],
    terisi(situs.identity.curriculum) && ["Kurikulum", situs.identity.curriculum],
    terisi(situs.identity.founder) && ["Pendiri", situs.identity.founder],
    tahunTerisi(situs.identity.foundedYear) && [
      "Tahun berdiri",
      String(situs.identity.foundedYear),
    ],
    ["Jenjang", "Kelas VII sampai IX"],
  ].filter((x): x is [string, string] => Boolean(x));

  return (
    <Kerangka situs={situs}>
      {/* ============ JUDUL: blok hijau muda ============ */}
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
      {daftar.length > 0 && (
        <section className="border-b border-garis bg-putih">
          <Kontainer>
            <div className="py-8">
              <p className="label-bagian mb-4 text-tinta-3">
                Isi halaman ini
              </p>
              <DaftarIsi warna="hijau" items={daftar} />
            </div>
          </Kontainer>
        </section>
      )}

      <div className="space-y-14 py-14 lg:space-y-20 lg:py-20">
        {/* --- Identitas: biru --- */}
        <Kontainer>
          <section id="identitas" className="scroll-mt-24">
            <JudulBagian
              warna="biru"
              label="Identitas"
              judul="Data resmi madrasah"
            />
            <dl className="mt-8 grid gap-x-10 gap-y-3 sm:grid-cols-2">
              {identitas.map(([k, v]) => (
                <div key={k} className="border-b border-garis pb-3">
                  <dt className="text-[0.9375rem] text-tinta-3">{k}</dt>
                  <dd className="mt-0.5 font-semibold">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </Kontainer>

        {/* --- Sejarah: hijau muda --- */}
        {adaSejarah && (
          <div className="bg-hijau-muda">
            <Kontainer>
              <section id="sejarah" className="scroll-mt-24 py-14 lg:py-16">
                <JudulBagian
                  warna="hijau"
                  label="Sejarah"
                  judul="Perjalanan madrasah"
                />
                <div className="mt-8 space-y-4">
                  {sejarahBersih.map((p) => (
                    <p
                      key={p}
                      className="max-w-3xl text-lg leading-relaxed text-hijau-tua"
                    >
                      {p}
                    </p>
                  ))}
                </div>
              </section>
            </Kontainer>
          </div>
        )}

        {/* --- Visi dan misi: kuning muda --- */}
        {(adaVisi || adaMisi) && (
          <div className="bg-kuning-muda">
            <Kontainer>
              <section id="visi-misi" className="scroll-mt-24 py-14 lg:py-16">
                <JudulBagian
                  warna="kuning"
                  label="Visi dan Misi"
                  judul="Arah pendidikan kami"
                />
                {adaVisi && (
                  <div className="mt-8 rounded-2xl bg-kuning-terang p-6">
                    <p className="label-bagian text-kuning-tua">Visi</p>
                    <p className="mt-2 font-judul text-xl leading-snug font-bold text-kuning-tua">
                      {profil.visi}
                    </p>
                  </div>
                )}
                {adaMisi && (
                  <>
                    <p className="label-bagian mt-8 text-kuning-tua">Misi</p>
                    <ol className="mt-3 grid gap-3 sm:grid-cols-2">
                      {misiBersih.map((m, i) => (
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
                  </>
                )}
              </section>
            </Kontainer>
          </div>
        )}

        {/* --- Sambutan --- */}
        {adaSambutan && (
          <Kontainer>
            <section id="sambutan" className="scroll-mt-24">
              <JudulBagian
                warna="hijau"
                label="Sambutan"
                judul="Salam dari kepala madrasah"
              />
              <p className="mt-6 font-judul text-xl font-bold">
                {profil.sambutan.nama}
              </p>
              <p className="mt-1 text-tinta-3">{profil.sambutan.jabatan}</p>
              <div className="mt-6 space-y-4">
                {profil.sambutan.teks.filter(terisi).map((t) => (
                  <p
                    key={t}
                    className="max-w-3xl text-lg leading-relaxed text-tinta-2"
                  >
                    {t}
                  </p>
                ))}
              </div>
            </section>
          </Kontainer>
        )}

        {/* --- Struktur: biru muda --- */}
        {adaStruktur && (
          <div className="bg-biru-muda">
            <Kontainer>
              <section id="struktur" className="scroll-mt-24 py-14 lg:py-16">
                <JudulBagian
                  warna="biru"
                  label="Struktur"
                  judul="Siapa mengelola madrasah"
                />
                <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                  {strukturBersih.map((s) => (
                    <li key={s.name} className="rounded-xl bg-putih p-4">
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
        )}

        {/* --- Fasilitas --- */}
        {adaFasilitas && (
          <Kontainer>
            <section id="fasilitas" className="scroll-mt-24">
              <JudulBagian
                warna="biru"
                label="Fasilitas"
                judul="Sarana yang tersedia"
              />
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {fasilitasBersih.map((f) => (
                  <li
                    key={f.name}
                    className="rounded-2xl border-2 border-biru-terang bg-putih p-5"
                  >
                    <h3 className="font-judul text-lg leading-tight font-bold text-biru-tua">
                      {f.name}
                    </h3>
                    {terisi(f.description) && (
                      <p className="mt-2 text-[0.9375rem] leading-relaxed text-tinta-2">
                        {f.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          </Kontainer>
        )}

        {/* --- FAQ: hijau muda --- */}
        {adaFaq && (
          <div className="bg-hijau-muda">
            <Kontainer>
              <section id="faq" className="scroll-mt-24 py-14 lg:py-16">
                <JudulBagian
                  warna="hijau"
                  label="Pertanyaan Umum"
                  judul="Yang sering ditanyakan"
                />
                <ul className="mt-8 space-y-3">
                  {faqBersih.map((f) => (
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
        )}
      </div>
    </Kerangka>
  );
}