import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Images } from "lucide-react";
import { BreadcrumbAtas } from "@/components/site/breadcrumb";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { KeadaanKosongPublik } from "@/components/site/kosong";
import { GaleriFoto } from "@/components/site/galeri-foto";
import { albumBySlug, semuaSlugAlbum, fotoAlbum } from "@/lib/queries/albums";
import { JsonLd, jsonLdRemahRoti } from "@/lib/json-ld";
import { formatTanggal } from "@/lib/utils";
import { site } from "@/config/site";

export async function generateStaticParams() {
  const slug = await semuaSlugAlbum();
  return slug.map((s) => ({ slug: s }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const album = await albumBySlug(slug);

  if (!album) {
    return {
      title: "Album tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const deskripsi =
    album.description ||
    `Foto ${album.title} di MTs Ma'arif Tieng, ${site.address.city}, ${site.address.province}.`;

  return {
    title: album.title,
    description: deskripsi,
    alternates: { canonical: `/galeri/${album.slug}` },
    openGraph: {
      title: `${album.title} | ${site.name}`,
      description: deskripsi,
      url: `/galeri/${album.slug}`,
      ...(album.cover
        ? {
            images: [
              {
                url: `/media/${album.cover.id}?w=1600`,
                width: 1200,
                height: 630,
                alt: album.cover.alt || album.title,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function HalamanAlbum({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const album = await albumBySlug(slug);

  // Album yang tidak ada harus menghasilkan 404.
  if (!album) notFound();

  const foto = await fotoAlbum(album.id);

  return (
    <>
      <JsonLd
        data={[
          jsonLdRemahRoti([
            { label: "Beranda", href: "/" },
            { label: "Galeri", href: "/galeri" },
            { label: album.title, href: `/galeri/${album.slug}` },
          ]),
          {
            "@context": "https://schema.org",
            "@type": "ImageGallery",
            name: album.title,
            ...(album.description ? { description: album.description } : {}),
            numberOfItems: foto.length,
            image: foto.map((f) => ({
              "@type": "ImageObject",
              contentUrl: `/media/${f.media.id}?w=1600`,
              width: f.media.width,
              height: f.media.height,
              ...(f.caption ? { caption: f.caption } : {}),
            })),
          },
        ]}
      />

      <BreadcrumbAtas
        butir={[
          { label: "Beranda", href: "/" },
          { label: "Galeri", href: "/galeri" },
          { label: album.title, href: "" },
        ]}
      />

      <PageHeader
        eyebrow="Galeri"
        judul={album.title}
        deskripsi={album.description || undefined}
      >
        <p className="text-xs text-muted-foreground">
          {foto.length} foto &middot; Diperbarui: {formatTanggal(album.updatedAt)}
        </p>
      </PageHeader>

      <Container>
        <div className="py-10 sm:py-12">
          {foto.length === 0 ? (
            <KeadaanKosongPublik
              judul="Album ini belum berisi foto"
              pesan="Pengelola sekolah sedang menyiapkan foto untuk album ini. Silakan kembali lagi nanti."
              ikon={Images}
            />
          ) : (
            <GaleriFoto
              foto={foto.map((f) => ({
                id: f.id,
                mediaId: f.media.id,
                caption: f.caption,
                width: f.media.width,
                height: f.media.height,
                alt: f.media.alt,
              }))}
            />
          )}

          <div className="mt-10 border-t pt-6">
            <Link
              href="/galeri"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Kembali ke daftar album
            </Link>
          </div>
        </div>
      </Container>
    </>
  );
}