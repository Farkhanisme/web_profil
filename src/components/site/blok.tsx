import Link from "next/link";
import type { IsiSitus } from "@/lib/konten";
import type { Staff } from "@/lib/db/types";
import { JudulBagian, Kontainer } from "./dasar";
import { KontakBlok } from "./wa";

/**
 * Kartu daftar guru.
 *
 * Berbeda dari tabel roster pada prototype sebelumnya: untuk audiens anak
 * kelas 6 dan orang tua, foto lebih_builderbx cepat dipahami daripada
 * tabel. Nama besar, jabatan kecil di bawahnya.
 */
export function KartuGuru({ s }: { s: Staff }) {
  return (
    <li className="overflow-hidden rounded-2xl border border-garis bg-putih">
      <div className="grid h-32 place-items-center bg-biru-muda">
        <span
          className="font-judul text-3xl text-biru"
          aria-hidden="true"
        >
          {s.name.charAt(0)}
        </span>
      </div>
      <div className="p-4">
        <p className="font-judul leading-tight font-bold">{s.name}</p>
        <p className="mt-1 text-sm text-tinta-3">{s.position}</p>
        <p className="mt-2 text-sm text-biru-tua">{s.subject}</p>
      </div>
    </li>
  );
}

/** Kartu program di blok jingga. */
export function KartuProgram({
  nama,
  ringkas,
}: {
  nama: string;
  ringkas: string;
}) {
  return (
    <li className="rounded-2xl border-2 border-jingga-terang bg-putih p-5">
      <h3 className="font-judul text-lg leading-tight">{nama}</h3>
      <p className="mt-2 text-[0.9375rem] leading-relaxed text-tinta-2">
        {ringkas}
      </p>
    </li>
  );
}

/**
 * Blok pendaftaran kuning.
 *
 * satu blok berwarna besar dengan warna identitas tersendiri, supaya
 * "daftar" terasa berbeda dari bagian informasi lain. Warna kuning dalam
 * bentuk pekat tidak dipakai di sini karena kontrasnya hanya 3,3:1 —
 * teks memakai coklat tua di atas kuning muda.
 */
export function BlokDaftar({ situs }: { situs: IsiSitus }) {
  return (
    <section id="daftar" className="scroll-mt-20 bg-kuning-muda">
      <Kontainer>
        <div className="py-14 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
            <div>
              <div className="h-1.5 w-14 rounded-full bg-kuning-terang" aria-hidden="true" />
              <p className="label-bagian mt-4 text-kuning-tua">
                Pendaftaran
              </p>
              <h2 className="mt-3 text-title text-kuning-tua">
                Pendaftaran siswa baru kelas VII
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-kuning-tua">
                Gelombang I dibuka setiap awal tahun pelajaran. Hubungi
                sekolah untuk info jadwal dan persyaratan.
              </p>
            </div>
            <div>
              <KontakBlok situs={situs} />
              <p className="mt-5 text-sm leading-relaxed text-kuning-tua">
                Jam layanan: Senin sampai Jumat 07.00-15.00, Sabtu
                07.00-12.00.
              </p>
            </div>
          </div>
        </div>
      </Kontainer>
    </section>
  );
}

/** Footer sederhana: NAP di atas putih, tanpa warna pekat. */
export function Footer({ situs }: { situs: IsiSitus }) {
  return (
    <footer className="mt-auto border-t border-garis bg-tinta py-12 text-putih">
      <Kontainer>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-judul font-bold">{situs.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-putih/70">
              {situs.legalName}
            </p>
          </div>
          <div>
            <p className="label-bagian text-putih/50">Alamat</p>
            <p className="mt-2 text-sm leading-relaxed text-putih/80">
              {situs.address.street}
              <br />
              {situs.address.village}, Kec. {situs.address.subdistrict}
              <br />
              {situs.address.city} {situs.address.postalCode}
            </p>
          </div>
          <div>
            <p className="label-bagian text-putih/50">Kontak</p>
            <p className="mt-2 text-sm leading-relaxed text-putih/80">
              {situs.contact.phone}
              <br />
              <span className="break-all">{situs.contact.email}</span>
            </p>
          </div>
          <div>
            <p className="label-bagian text-putih/50">Halaman</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li>
                <Link href="/profil" className="text-putih/80 hover:text-putih">
                  Profil Madrasah
                </Link>
              </li>
              <li>
                <Link href="/guru" className="text-putih/80 hover:text-putih">
                  Guru dan Staf
                </Link>
              </li>
              <li>
                <Link href="/#daftar" className="text-putih/80 hover:text-putih">
                  Pendaftaran
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </Kontainer>
    </footer>
  );
}

/** Daftar isi profil di ponsel: kartu 대신 daftar isi melayang. */
export function DaftarIsi({
  warna,
  items,
}: {
  warna: "hijau" | "jingga" | "biru" | "kuning";
  items: { href: string; label: string }[];
}) {
  const kelas = {
    hijau: "border-hijau-terang bg-hijau-muda text-hijau-tua",
    jingga: "border-jingga-terang bg-jingga-muda text-jingga-tua",
    biru: "border-biru-terang bg-biru-muda text-biru-tua",
    kuning: "border-kuning-terang bg-kuning-muda text-kuning-tua",
  }[warna];

  return (
    <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((i) => (
        <li key={i.href}>
          <a
            href={i.href}
            className={`flex min-h-14 items-center justify-between rounded-xl border px-4 font-semibold transition-transform hover:translate-y-[-2px] ${kelas}`}
          >
            {i.label}
            <span aria-hidden="true">&rarr;</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

export { JudulBagian };