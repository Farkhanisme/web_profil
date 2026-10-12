import type { Metadata } from "next";
import Link from "next/link";
import { Building2, Compass, Eye, Flag, History, Users } from "lucide-react";
import { BreadcrumbAtas } from "@/components/site/breadcrumb";
import { Container } from "@/components/site/container";
import { PageHeader, JudulBagian } from "@/components/site/page-header";
import { TabelIdentitas } from "@/components/site/tabel-identitas";
import { Faq } from "@/components/site/faq";
import {
  JsonLd,
  jsonLdFaq,
  jsonLdKepalaMadrasah,
  jsonLdRemahRoti,
} from "@/lib/json-ld";
import { profil } from "@/config/profil";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Profil Sekolah",
  description: profil.ringkasan,
  alternates: { canonical: "/profil" },
};

/** Bagian yang judulnya ditandai ikon. */
function SubBagian({
  ikon: Ikon,
  judul,
  children,
}: {
  ikon: typeof Eye;
  judul: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b">
      <Container>
        <div className="py-10 sm:py-12">
          <div className="mb-4 flex items-center gap-2.5">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft">
              <Ikon className="size-4.5 text-primary" aria-hidden />
            </span>
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl">
              {judul}
            </h2>
          </div>
          <div className="space-y-4 leading-relaxed text-foreground/85">
            {children}
          </div>
        </div>
      </Container>
    </section>
  );
}

export default function HalamanProfil() {
  return (
    <>
      <JsonLd
        data={[
          jsonLdRemahRoti([
            { label: "Beranda", href: "/" },
            { label: "Profil Sekolah", href: "/profil" },
          ]),
          jsonLdFaq(),
          jsonLdKepalaMadrasah(),
        ]}
      />

      <BreadcrumbAtas nama="Profil Sekolah" segmen="profil" />

      <PageHeader
        eyebrow="Tentang Kami"
        judul="Profil Sekolah"
        deskripsi={profil.ringkasan}
      >
        <p className="text-xs text-muted-foreground">
          Diperbarui: {formatTanggal()} &middot;{" "}
          {site.identity.foundedYear > 0
            ? `Berdiri sejak ${site.identity.foundedYear}`
            : "Tahun berdiri belum dilengkapi"}
        </p>
      </PageHeader>

      {/* Paragraf pembuka: fakta kunci agar mudah dikutip mesin AI */}
      <Container lebar="sempit">
        <div className="py-8 sm:py-10">
          <p className="text-lg leading-relaxed">{profil.ringkasan}</p>
        </div>
      </Container>

      <SubBagian ikon={Flag} judul="Identitas Sekolah">
        <TabelIdentitas />
      </SubBagian>

      <SubBagian ikon={History} judul="Sejarah">
        {profil.sejarah.map((paragraf, i) => (
          <p key={i}>{paragraf}</p>
        ))}
      </SubBagian>

      <SubBagian ikon={Eye} judul="Visi">
        <p className="font-medium text-foreground">{profil.visi}</p>
      </SubBagian>

      <SubBagian ikon={Compass} judul="Misi">
        <ol className="space-y-2.5">
          {profil.misi.map((butir, i) => (
            <li key={butir} className="flex gap-3">
              <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {i + 1}
              </span>
              <span>{butir}</span>
            </li>
          ))}
        </ol>
      </SubBagian>

      <SubBagian ikon={Users} judul="Struktur Organisasi">
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full border-collapse text-sm">
            <caption className="sr-only">
              Struktur organisasi MTs Ma&apos;arif Tieng
            </caption>
            <thead className="bg-muted/50">
              <tr>
                <th scope="col" className="px-4 py-3 text-left font-medium">
                  Nama
                </th>
                <th scope="col" className="px-4 py-3 text-left font-medium">
                  Jabatan
                </th>
              </tr>
            </thead>
            <tbody>
              {profil.struktur.map((orang, i) => (
                <tr key={`${orang.position}-${i}`} className="border-t">
                  <td className="px-4 py-3">{orang.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {orang.position}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SubBagian>

      <SubBagian ikon={Building2} judul="Fasilitas">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {profil.fasilitas.map((f) => (
            <li key={f.name} className="rounded-xl border bg-card p-4">
              <p className="font-medium">{f.name}</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {f.description}
              </p>
            </li>
          ))}
        </ul>
      </SubBagian>

      <section className="bg-muted/30">
        <Container lebar="sempit">
          <div className="py-10 sm:py-12">
            <JudulBagian
              judul="Pertanyaan yang Sering Diajukan"
              deskripsi="Jawaban singkat untuk membantu calon siswa dan orang tua."
            />
            <Faq />
          </div>
        </Container>
      </section>

      <Container>
        <div className="py-10 sm:py-12">
          <h2 className="mb-3 text-xl font-bold tracking-tight">
            Masih ada pertanyaan?
          </h2>
          <p className="max-w-2xl leading-relaxed text-muted-foreground">
            Pengelola sekolah siap membantu. Hubungi kami untuk menjadwalkan
            kunjungan, pendaftaran, atau informasi lain.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/kontak"
              className="inline-flex h-11 items-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Hubungi Kami
            </Link>
            <Link
              href="/guru"
              className="inline-flex h-11 items-center rounded-lg border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Lihat Guru dan Staf
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}

/** Tanggal pembaruan profil dalam bahasa Indonesia. */
function formatTanggal(): string {
  const tanggal = new Date(`${profil.updatedAt}T00:00:00Z`);
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(tanggal);
}