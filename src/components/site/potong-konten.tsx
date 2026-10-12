import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/site/container";
import { GambarMedia } from "@/components/site/gambar-media";
import { JudulBagian } from "@/components/site/page-header";
import type { Program, Extracurricular } from "@/lib/db/types";

interface Butir {
  id: string;
  slug: string;
  name: string;
  summary: string;
  image: { id: string; width: number; height: number; alt: string } | null;
  /** Untuk ekstrakurikuler. */
  schedule?: string;
}

/**
 * Potongan program atau ekstrakurikuler di beranda.
 *
 * Satu komponen untuk keduanya karena bentuk keduanya sama. Bila data
 * kosong, bagiannya disembunyikan sepenuhnya agar beranda tidak penuh
 * kotak kosong.
 */
export function PotongKonten({
  judul,
  deskripsi,
  slugPrefix,
  semua,
  tampilkanJadwal = false,
  batas = 3,
}: {
  judul: string;
  deskripsi: string;
  slugPrefix: string;
  semua: Array<Program | Extracurricular>;
  tampilkanJadwal?: boolean;
  batas?: number;
}) {
  if (semua.length === 0) return null;

  const butir: Butir[] = semua.slice(0, batas).map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    summary: p.summary,
    image: p.image,
    schedule: "schedule" in p ? p.schedule : undefined,
  }));

  return (
    <section className="border-b">
      <Container>
        <div className="py-12 sm:py-14">
          <JudulBagian
            judul={judul}
            deskripsi={deskripsi}
            aksi={
              <Link
                href={`/${slugPrefix}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
              >
                Lihat semua
                <ArrowRight className="size-3.5" aria-hidden />
              </Link>
            }
          />

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {butir.map((item, i) => (
              <li
                key={item.id}
                className="animate-fade-up overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <Link href={`/${slugPrefix}/${item.slug}`} className="block">
                  <div className="aspect-[4/3] w-full bg-muted">
                    {item.image ? (
                      <GambarMedia
                        id={item.image.id}
                        alt={item.image.alt || item.name}
                        width={item.image.width}
                        height={item.image.height}
                        lebar={480}
                        className="h-full w-full transition-transform duration-300 hover:scale-105"
                      />
                    ) : null}
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold leading-snug">{item.name}</h3>
                    {item.summary ? (
                      <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                        {item.summary}
                      </p>
                    ) : null}
                    {tampilkanJadwal && item.schedule ? (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Jadwal: {item.schedule}
                      </p>
                    ) : null}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}