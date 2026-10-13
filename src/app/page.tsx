import Link from "next/link";
import { bacaProfil, bacaSitus } from "@/lib/queries/profil";
import { staffTerbit } from "@/lib/queries/staff";
import {
  ekstrakurikulerTerbit,
  programTerbit,
} from "@/lib/queries/konten";
import { terisi, tahunTerisi, wilayahSingkat } from "@/lib/konten";
import { Kontainer } from "@/components/site/dasar";
import { KartuGuru, KartuProgram, BlokDaftar } from "@/components/site/blok";
import { Kerangka } from "@/components/site/kerangka";

export default async function Beranda() {
  const [situs, profil, staff, program, ekstra] = await Promise.all([
    bacaSitus(),
    bacaProfil(),
    staffTerbit(),
    programTerbit(),
    ekstrakurikulerTerbit(),
  ]);

  const wilayah = wilayahSingkat(situs);

  return (
    <Kerangka situs={situs}>
      {/* ============ HERO: blok hijau, aksi langsung ============ */}
      <section className="bg-hijau text-white">
        <Kontainer>
          <div className="grid gap-10 py-12 sm:py-16 lg:grid-cols-[1.25fr_1fr] lg:items-center lg:gap-16 lg:py-20">
            <div>
              <p className="label-bagian text-hijau-terang">
                PPDB 2026/2027 &middot; Kelas VII
              </p>
              <h1 className="mt-4 text-display">Madrasah untuk anak Anda</h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/90">
                Pendidikan Islam terpadu di Desa Tieng, Kecamatan Kejajar.
                Anak belajar agama dan ilmu pengetahuan bersama guru yang
                sabar.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <a
                  href="#daftar"
                  className="tombol bg-kuning-terang text-kuning-tua hover:bg-white"
                >
                  Daftar Sekarang
                </a>
                <Link
                  href="/profil"
                  className="tombol border-2 border-white/40 text-white hover:border-white"
                >
                  Lihat Profil
                </Link>
              </div>
            </div>

            {/* Angka kunci: yang pertama dicari orang tua */}
            <dl className="grid grid-cols-2 gap-3">
              {[
                tahunTerisi(situs.identity.foundedYear) && {
                  n: String(situs.identity.foundedYear),
                  l: "Tahun berdiri",
                },
                { n: "VII-IX", l: "Jenjang kelas" },
                staff.length > 0 && { n: String(staff.length), l: "Guru dan staf" },
                terisi(situs.identity.accreditation) && {
                  n: situs.identity.accreditation,
                  l: "Akreditasi",
                },
                program.length > 0 && { n: String(program.length), l: "Program" },
              ]
                .filter((x): x is { n: string; l: string } => Boolean(x))
                .map((s) => (
                  <div
                    key={s.l}
                    className="rounded-2xl bg-hijau-tua/60 p-4 ring-1 ring-white/15"
                  >
                    <dt className="font-judul text-2xl font-extrabold">{s.n}</dt>
                    <dd className="mt-1 text-sm text-white/80">{s.l}</dd>
                  </div>
                ))}
            </dl>
          </div>
        </Kontainer>
      </section>

      {/* ============ PROFIL ============ */}
      <section className="bg-putih">
        <Kontainer>
          <div className="grid gap-8 py-14 lg:grid-cols-[1fr_1.2fr] lg:gap-14 lg:py-20">
            <div>
              <div className="h-1.5 w-14 rounded-full bg-hijau" aria-hidden="true" />
              <p className="label-bagian mt-4 text-hijau-tua">Profil Madrasah</p>
              <h2 className="mt-3 text-title">
                Kenali kami sebelum mendaftar
              </h2>
              {wilayah && <p className="mt-3 text-tinta-2">{wilayah}</p>}
              <Link
                href="/profil"
                className="tombol mt-6 border-2 border-hijau text-hijau-tua hover:bg-hijau-muda"
              >
                Baca profil lengkap
              </Link>
            </div>
            <div>
              <p className="text-lg leading-relaxed text-tinta-2">
                {profil.ringkasan}
              </p>
              <dl className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2">
                {[
                  terisi(situs.identity.status) && ["Bentuk", situs.identity.status],
                  terisi(situs.identity.npsn) && ["NPSN", situs.identity.npsn],
                  terisi(situs.identity.curriculum) && ["Kurikulum", situs.identity.curriculum],
                  terisi(situs.identity.founder) && ["Pendiri", situs.identity.founder],
                ]
                  .filter((x): x is [string, string] => Boolean(x))
                  .map(([k, v]) => (
                    <div
                      key={k}
                      className="border-b border-garis pb-2 text-[0.9375rem]"
                    >
                      <dt className="text-tinta-3">{k}</dt>
                      <dd className="mt-0.5 font-semibold">{v}</dd>
                    </div>
                  ))}
              </dl>
            </div>
          </div>
        </Kontainer>
      </section>

      {/* ============ PROGRAM: blok jingga muda ============ */}
      {program.length > 0 && (
        <section className="bg-jingga-muda">
          <Kontainer>
            <div className="py-14 lg:py-20">
              <div className="h-1.5 w-14 rounded-full bg-jingga" aria-hidden="true" />
              <p className="label-bagian mt-4 text-jingga-tua">Program</p>
              <h2 className="mt-3 max-w-2xl text-title">
                Yang dipelajari anak setiap hari
              </h2>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2">
                {program.slice(0, 4).map((p) => (
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

      {/* ============ EKSTRAKURIKULER ============ */}
      {ekstra.length > 0 && (
        <section className="bg-jingga">
          <Kontainer>
            <div className="py-14 lg:py-20">
              <div
                className="h-1.5 w-14 rounded-full bg-jingga-terang"
                aria-hidden="true"
              />
              <p className="label-bagian mt-4 text-jingga-terang">
                Ekstrakurikuler
              </p>
              <h2 className="mt-3 max-w-2xl text-title text-white">
                Kegiatan di luar kelas
              </h2>
              <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {ekstra.slice(0, 4).map((e) => (
                  <li key={e.id} className="rounded-xl bg-jingga-tua p-4">
                    <Link href={`/ekstrakurikuler/${e.slug}`} className="block">
                      <p className="font-judul font-bold text-white">{e.name}</p>
                      {terisi(e.schedule) && (
                        <p className="mt-1 text-sm text-white/85">{e.schedule}</p>
                      )}
                      {terisi(e.coach) && (
                        <p className="mt-0.5 text-sm text-white/70">{e.coach}</p>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </Kontainer>
        </section>
      )}

      {/* ============ GURU: blok biru muda ============ */}
      {staff.length > 0 && (
        <section className="bg-biru-muda">
          <Kontainer>
            <div className="py-14 lg:py-20">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <div
                    className="h-1.5 w-14 rounded-full bg-biru"
                    aria-hidden="true"
                  />
                  <p className="label-bagian mt-4 text-biru-tua">Guru dan Staf</p>
                  <h2 className="mt-3 text-title">Guru yang mendampingi anak</h2>
                </div>
                <Link
                  href="/guru"
                  className="tombol border-2 border-biru bg-putih text-biru-tua hover:bg-biru hover:text-white"
                >
                  Lihat semua {staff.length} orang
                </Link>
              </div>
              <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {staff.slice(0, 4).map((s) => (
                  <KartuGuru key={s.id} s={s} />
                ))}
              </ul>
            </div>
          </Kontainer>
        </section>
      )}

      {/* ============ SAMBUTAN ============ */}
      {terisi(profil.sambutan.nama) && (
        <section className="bg-putih">
          <Kontainer>
            <div className="grid gap-8 py-14 lg:grid-cols-[1fr_1.4fr] lg:gap-14 lg:py-20">
              <div>
                <div
                  className="h-1.5 w-14 rounded-full bg-hijau"
                  aria-hidden="true"
                />
                <p className="label-bagian mt-4 text-hijau-tua">
                  Sambutan Kepala Madrasah
                </p>
                <p className="mt-4 font-judul text-xl leading-snug font-bold">
                  {profil.sambutan.nama}
                </p>
                <p className="mt-1 text-tinta-3">{profil.sambutan.jabatan}</p>
              </div>
              <blockquote className="space-y-4 text-lg leading-relaxed text-tinta-2">
                {profil.sambutan.teks.slice(0, 2).map((t) => (
                  <p key={t}>{t}</p>
                ))}
              </blockquote>
            </div>
          </Kontainer>
        </section>
      )}

      <BlokDaftar situs={situs} />
    </Kerangka>
  );
}