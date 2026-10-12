import Link from "next/link";
import { ArrowRight, Quote } from "lucide-react";
import { Container } from "@/components/site/container";
import { JudulBagian } from "@/components/site/page-header";

/**
 * Sambutan kepala madrasah.
 *
 * Setiap elemen array adalah satu paragraf. Teks ditampilkan apa adanya
 * tanpa pemformatan tambahan, persis seperti yang ditulis pengelola.
 */
export function Sambutan({
  nama,
  jabatan,
  teks,
}: {
  nama: string;
  jabatan: string;
  teks: string[];
}) {
  return (
    <section className="border-b bg-muted/30">
      <Container>
        <div className="py-12 sm:py-16">
          <JudulBagian
            judul="Sambutan Kepala Madrasah"
            deskripsi={`${jabatan}: ${nama}`}
          />

          <div className="grid gap-6 lg:grid-cols-[auto_1fr] lg:gap-10">
            <Quote
              className="size-8 shrink-0 text-primary/40 lg:size-10"
              aria-hidden
            />

            <div className="space-y-4 leading-relaxed text-foreground/90">
              {teks.map((paragraf, i) => (
                <p key={i}>{paragraf}</p>
              ))}

              <div className="pt-2">
                <p className="font-semibold">{nama}</p>
                <p className="text-sm text-muted-foreground">{jabatan}</p>

                <Link
                  href="/profil"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  Baca profil lengkap
                  <ArrowRight className="size-3.5" aria-hidden />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}