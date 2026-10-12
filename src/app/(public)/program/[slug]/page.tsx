import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BreadcrumbAtas } from "@/components/site/breadcrumb";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";
import { GambarMedia } from "@/components/site/gambar-media";
import { Paragraf } from "@/components/site/kartu";
import { programBySlug, semuaSlugProgram } from "@/lib/queries/konten";
import { JsonLd, jsonLdRemahRoti } from "@/lib/json-ld";
import { formatTanggal } from "@/lib/utils";
import { site } from "@/config/site";

/** Semua slug di-prerender saat build. Detail lain tetap bisa diakses
 *  lewat ISR, sehingga program yang baru ditambahkan tetap muncul. */
export async function generateStaticParams() {
  const slug = await semuaSlugProgram();
  return slug.map((s) => ({ slug: s }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const program = await programBySlug(slug);

  // Metadata tetap dibaca lengkap supaya mesin pencari tidak melihat
  // judul generik, walaupun halamannya memang 404 bagi pengunjung.
  if (!program) {
    return {
      title: "Program tidak ditemukan",
      robots: { index: false, follow: false },
    };
  }

  const deskripsi = program.summary || site.description;

  return {
    title: program.name,
    description: deskripsi,
    alternates: { canonical: `/program/${program.slug}` },
    openGraph: {
      type: "article",
      title: `${program.name} | ${site.name}`,
      description: deskripsi,
      url: `/program/${program.slug}`,
      modifiedTime: new Date(program.updatedAt * 1000).toISOString(),
      ...(program.image
        ? {
            images: [
              {
                url: `/media/${program.image.id}?w=1600`,
                width: 1200,
                height: 630,
                alt: program.image.alt || program.name,
              },
            ],
          }
        : {}),
    },
  };
}

export default async function DetailProgram({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const program = await programBySlug(slug);

  // Slug yang tidak ada harus menghasilkan 404, bukan halaman kosong.
  if (!program) notFound();

  return (
    <>
      <JsonLd
        data={jsonLdRemahRoti([
          { label: "Beranda", href: "/" },
          { label: "Program", href: "/program" },
          { label: program.name, href: `/program/${program.slug}` },
        ])}
      />

      <BreadcrumbAtas
        butir={[
          { label: "Beranda", href: "/" },
          { label: "Program", href: "/program" },
          { label: program.name, href: "" },
        ]}
      />

      <PageHeader
        eyebrow="Program Sekolah"
        judul={program.name}
        deskripsi={program.summary || undefined}
      >
        <p className="text-xs text-muted-foreground">
          Diperbarui: {formatTanggal(program.updatedAt)}
        </p>
      </PageHeader>

      <Container lebar="sempit">
        <article className="py-10 sm:py-12">
          {program.image ? (
            <GambarMedia
              id={program.image.id}
              alt={program.image.alt || program.name}
              width={program.image.width}
              height={program.image.height}
              lebar={1600}
              className="mb-8 w-full rounded-xl"
            />
          ) : null}

          {program.description ? (
            <Paragraf teks={program.description} />
          ) : (
            <p className="leading-relaxed text-muted-foreground">
              Penjelasan lengkap program ini sedang disiapkan pengelola
              sekolah.
            </p>
          )}

          <div className="mt-10 border-t pt-6">
            <Link
              href="/program"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="size-4" aria-hidden />
              Kembali ke daftar program
            </Link>
          </div>
        </article>
      </Container>
    </>
  );
}