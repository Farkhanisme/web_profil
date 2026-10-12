import type { Metadata } from "next";
import Link from "next/link";
import { Images } from "lucide-react";
import { BreadcrumbAtas } from "@/components/site/breadcrumb";
import { PageHeader } from "@/components/site/page-header";
import { DaftarDenganJudul } from "@/components/site/kosong";
import { GambarMedia } from "@/components/site/gambar-media";
import { albumSemua } from "@/lib/queries/albums";
import { JsonLd, jsonLdRemahRoti } from "@/lib/json-ld";
import { site } from "@/config/site";

export async function generateMetadata(): Promise<Metadata> {
  const album = await albumSemua();
  const deskripsi =
    album.length > 0
      ? `Galeri foto kegiatan MTs Ma'arif Tieng: ${album.length} album, ${album.reduce((n, a) => n + a.photoCount, 0)} foto.`
      : `Galeri foto kegiatan MTs Ma'arif Tieng, ${site.address.city}, ${site.address.province}.`;

  return {
    title: "Galeri",
    description: deskripsi,
    alternates: { canonical: "/galeri" },
    openGraph: {
      title: `Galeri | ${site.name}`,
      description: deskripsi,
      url: "/galeri",
    },
  };
}

export default async function HalamanGaleri() {
  const album = await albumSemua();
  const totalFoto = album.reduce((n, a) => n + a.photoCount, 0);

  return (
    <>
      <JsonLd
        data={jsonLdRemahRoti([
          { label: "Beranda", href: "/" },
          { label: "Galeri", href: "/galeri" },
        ])}
      />

      <BreadcrumbAtas nama="Galeri" segmen="galeri" />

      <PageHeader
        eyebrow="Dokumentasi"
        judul="Galeri Kegiatan"
        deskripsi={
          totalFoto > 0
            ? `Foto kegiatan belajar, upacara, dan kegiatan sekolah. ${album.length} album, ${totalFoto} foto.`
            : "Foto kegiatan belajar, upacara, dan kegiatan sekolah."
        }
      />

      <DaftarDenganJudul
        judul="Album"
        deskripsi="Klik album untuk melihat seluruh foto di dalamnya."
        jumlah={album.length}
        kosong={{
          judul: "Belum ada album foto",
          pesan:
            "Pengelola sekolah sedang menyiapkan album foto kegiatan. Silakan kembali lagi nanti.",
          ikon: Images,
        }}
      >
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {album.map((a) => (
            <li
              key={a.id}
              className="animate-fade-up overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
            >
              <Link href={`/galeri/${a.slug}`} className="block">
                <div className="aspect-[4/3] w-full bg-muted">
                  {a.cover ? (
                    <GambarMedia
                      id={a.cover.id}
                      alt={a.cover.alt || a.title}
                      width={a.cover.width}
                      height={a.cover.height}
                      lebar={480}
                      className="h-full w-full transition-transform duration-300 hover:scale-105"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center">
                      <Images className="size-8 text-muted-foreground" aria-hidden />
                    </span>
                  )}
                </div>

                <div className="p-4">
                  <h3 className="font-semibold leading-snug">{a.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {a.photoCount} foto
                  </p>
                  {a.description ? (
                    <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {a.description}
                    </p>
                  ) : null}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </DaftarDenganJudul>
    </>
  );
}