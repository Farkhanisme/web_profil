import Link from "next/link";
import { alamatSatuBaris, terisi, tahunTerisi } from "@/lib/konten";
import { HALAMAN_PUBLIK } from "@/config/navigation";
import type { IsiSitus } from "@/lib/konten";
import type { Staff } from "@/lib/db/types";
import { tahunSekarang } from "@/lib/tahun";
import { Kontainer } from "./dasar";
import { KontakBlok } from "./wa";

/**
 * Kartu guru.
 *
 * Untuk audiens anak kelas 6 dan orang tua, foto lebih cepat dipahami
 * daripada tabel: nama besar, jabatan kecil di bawahnya. initials
 * dipakai sebagai pengganti sementara sampai foto asli diunggah lewat
 * CMS.
 */
export function KartuGuru({ s }: { s: Staff }) {
  const inisial = s.name
    .split(/\s+/)
    .filter((b) => /^[\p{L}]/u.test(b))
    .slice(0, 2)
    .map((b) => b.charAt(0))
    .join("");

  return (
    <li className="overflow-hidden rounded-2xl border border-garis bg-putih">
      <div className="grid h-32 place-items-center bg-biru-muda">
        {s.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/media/${s.photo.id}?w=240`}
            alt={s.photo.alt || `Foto ${s.name}`}
            width={s.photo.width || 240}
            height={s.photo.height || 240}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <span className="font-judul text-3xl text-biru" aria-hidden="true">
            {inisial}
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="font-judul leading-tight font-bold">{s.name}</p>
        <p className="mt-1 text-sm text-tinta-3">{s.position}</p>
        {terisi(s.subject) && (
          <p className="mt-2 text-sm text-biru-tua">{s.subject}</p>
        )}
      </div>
    </li>
  );
}

/** Kartu program di blok jingga. */
export function KartuProgram({
  href,
  nama,
  ringkas,
}: {
  href: string;
  nama: string;
  ringkas: string;
}) {
  return (
    <li className="rounded-2xl border-2 border-jingga-terang bg-putih p-5 transition-transform hover:-translate-y-1">
      <Link href={href} className="block">
        <h3 className="font-judul text-lg leading-tight">{nama}</h3>
        {terisi(ringkas) && (
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-tinta-2">
            {ringkas}
          </p>
        )}
      </Link>
    </li>
  );
}

/**
 * Blok pendaftaran kuning.
 *
 * Kuning pekat `#ca8a04` hanya 3,3:1 terhadap teks putih, jadi tidak boleh
 * jadi latar teks. Karena itu blok ini memakai kuning muda dengan teks
 * coklat tua (8,07:1).
 */
export function BlokDaftar({ situs }: { situs: IsiSitus }) {
  return (
    <section id="daftar" className="scroll-mt-20 bg-kuning-muda">
      <Kontainer>
        <div className="py-14 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:gap-16">
            <div>
              <div
                className="h-1.5 w-14 rounded-full bg-kuning-terang"
                aria-hidden="true"
              />
              <p className="label-bagian mt-4 text-kuning-tua">Pendaftaran</p>
              <h2 className="mt-3 text-title text-kuning-tua">
                Pendaftaran siswa baru kelas VII
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-kuning-tua">
                Hubungi sekolah untuk jadwal, persyaratan, dan kunjungan
                kelas.
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

/**
 * Footer. NAP memakai `alamatSatuBaris` supaya sama persis dengan yang
 * muncul di JSON-LD dan llms.txt — mesin AI membandingkan beberapa
 * sumber sekaligus, jadi selisih satu kata saja bisa merusak konsistensi.
 */
export async function Footer({ situs }: { situs: IsiSitus }) {
  const tahun = await tahunSekarang();
  const alamat = alamatSatuBaris(situs);

  return (
    <footer className="mt-auto border-t border-garis bg-tinta py-12 text-putih">
      <Kontainer>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="font-judul font-bold">{situs.name}</p>
            <p className="mt-2 text-sm leading-relaxed text-putih/70">
              {situs.legalName}
            </p>
            {tahunTerisi(situs.identity.foundedYear) && (
              <p className="mt-1 text-sm text-putih/50 tabular-nums">
                Sejak {situs.identity.foundedYear}
              </p>
            )}
          </div>
          <div>
            <p className="label-bagian text-putih/50">Alamat</p>
            <p className="mt-2 text-sm leading-relaxed text-putih/80">
              {alamat}
            </p>
          </div>
          <div>
            <p className="label-bagian text-putih/50">Kontak</p>
            <div className="mt-2 space-y-1 text-sm leading-relaxed text-putih/80">
              {terisi(situs.contact.phone) && <p>{situs.contact.phone}</p>}
              {terisi(situs.contact.email) && (
                <p className="break-all">{situs.contact.email}</p>
              )}
              {!terisi(situs.contact.phone) &&
                !terisi(situs.contact.email) && (
                  <p className="text-putih/50">Belum diisi</p>
                )}
            </div>
          </div>
          <div>
            <p className="label-bagian text-putih/50">Halaman</p>
            <ul className="mt-2 space-y-1 text-sm">
              {HALAMAN_PUBLIK.map((h) => (
                <li key={h.href}>
                  <Link href={h.href} className="text-putih/80 hover:text-putih">
                    {h.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/#daftar" className="text-putih/80 hover:text-putih">
                  Pendaftaran
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <p className="mt-10 border-t border-putih/15 pt-6 text-sm text-putih/50">
          &copy; {tahun} {situs.legalName}
        </p>
      </Kontainer>
    </footer>
  );
}

/**
 * Kartu lompat ke bagian halaman. Di ponsel berupa tombol besar, bukan
 * daftar teks kecil yang mudah terlewat.
 */
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
            className={`flex min-h-14 items-center justify-between rounded-xl border px-4 font-semibold transition-transform hover:-translate-y-0.5 ${kelas}`}
          >
            {i.label}
            <span aria-hidden="true">&rarr;</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/** Judul bagian: garis warna + label berwarna + judul besar. */
export function JudulBagian({
  warna,
  label,
  judul,
  children,
}: {
  warna: "hijau" | "jingga" | "biru" | "kuning";
  label: string;
  judul: string;
  children?: React.ReactNode;
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
      {children && (
        <div className="mt-4 max-w-2xl text-tinta-2">{children}</div>
      )}
    </div>
  );
}