import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, User } from "lucide-react";
import { BreadcrumbAtas } from "@/components/site/breadcrumb";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { GambarMedia } from "@/components/site/gambar-media";
import { KotakInfo, Paragraf } from "@/components/site/kartu";
import {
  ekstrakurikulerBySlug,
  semuaSlugEkstrakurikuler,
} from "@/lib/queries/konten";
import { JsonLd, jsonLdRemahRoti } from "@/lib/json-ld";
import { formatTanggal } from "@/lib/utils";
import { site } from "@/config/site";

/** Semua kegiatan di-prerender saat build. Kegiatan yang baru ditambahkan
 *  tetap muncul lewat cache halaman. */
export async function generateStaticParams() {
  const slug = await semuaSlugEkstrakurikuler();
  return slug.map((s) => ({ slug: s }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const kegiatan = await ekstrakurikulerBySlug(slug);

  if (!kegiatan) {
    return {
      title: "Kegiatan tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const deskripsi = kegiatan.summary || site.description;

  return {
    title: kegiatan.name,
    description: deskripsi,
    alternates: { canonical: `/ekstrakurikuler/${kegiatan.slug}` },
    openGraph: {
      type: "article",
      title: `${kegiatan.name} | ${site.name}`,
      description: deskripsi,
      url: `/ekstrakurikuler/${kegiatan.slug}`,
      modifiedTime: new Date(kegiatan.updatedAt * 1000).toISOString(),
      ...(kegiatan.image
        ? {
            images: [
              {
                url: `/media/${kegiatan.image.id}?w=1600`,
                width: 1200,
                height: 630,
                alt: kegiatan.image.alt || kegiatan.name,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function DetailEkstrakurikuler({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const kegiatan = await ekstrakurikulerBySlug(slug);

  // Slug yang tidak ada harus menghasilkan 404.
  if (!kegiatan) notFound();

  return (
    <>
      <JsonLd
        data={jsonLdRemahRoti([
          { label: "Beranda", href: "/" },
          { label: "Ekstrakurikuler", href: "/ekstrakurikuler" },
          { label: kegiatan.name, href: `/ekstrakurikuler/${kegiatan.slug}` },
        ])}
      />

      <BreadcrumbAtas
        butir={[
          { label: "Beranda", href: "/" },
          { label: "Ekstrakurikuler", href: "/ekstrakurikuler" },
          { label: kegiatan.name, href: "" },
        ]}
      />

      <PageHeader
        eyebrow="Ekstrakurikuler"
        judul={kegiatan.name}
        deskripsi={kegiatan.summary || undefined}
      >
        <p className="text-xs text-muted-foreground">
          Diperbarui: {formatTanggal(kegiatan.updatedAt)}
        </p>
      </PageHeader>

      <Container lebar="sempit">
        <article className="py-10 sm:py-12">
          {(kegiatan.schedule || kegiatan.coach) && (
            <div className="mb-8 grid gap-3 sm:grid-cols-2">
              <KotakInfo
                label="Jadwal"
                nilai={kegiatan.schedule}
                ikon={Clock}
              />
              <KotakInfo
                label="Pembina"
                nilai={kegiatan.coach}
                ikon={User}
              />
            </div>
          )}

          {kegiatan.image ? (
            <GambarMedia
              id={kegiatan.image.id}
              alt={kegiatan.image.alt || kegiatan.name}
              width={kegiatan.image.width}
              height={kegiatan.image.height}
              lebar={1600}
              className="mb-8 w-full rounded-xl"
            />
          ) : null}

          {kegiatan.description ? (
            <Paragraf teks={kegiatan.description} />
          ) : (
            <p className="leading-relaxed text-muted-foreground">
              Penjelasan lengkap kegiatan ini sedang disiapkan pengelola
              sekolah.
            </p>
          )}

          <div className="mt-10 border-t pt-6">
            <Link
              href="/ekstrakurikuler"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Kembali ke daftar ekstrakurikuler
            </Link>
          </div>
        </article>
      </Container>
    </>
  );
}