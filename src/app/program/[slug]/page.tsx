import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { programBySlug, programTerbit } from "@/lib/queries/konten";
import { bacaSitus } from "@/lib/queries/profil";
import { terisi } from "@/lib/konten";
import { metadataDasar } from "@/lib/seo";
import { JsonLd, jsonLdRemahRoti } from "@/lib/json-ld";
import { Kontainer } from "@/components/site/dasar";
import { KartuProgram, JudulBagian } from "@/components/site/blok";
import { Kerangka } from "@/components/site/kerangka";
import { RemahRoti } from "@/components/site/remah-roti";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const program = await programBySlug(slug);
  if (!program) return { title: "Tidak Ditemukan" };
  return metadataDasar(program.name, program.summary, `/program/${slug}`);
}

export async function generateStaticParams() {
  const program = await programTerbit();
  return program.map((p) => ({ slug: p.slug }));
}

function ProgramLain({ programId }: { programId: string }) {
  return <ProgramLainAsync programId={programId} />;
}

async function ProgramLainAsync({ programId }: { programId: string }) {
  const programLain = await programTerbit();
  const lain = programLain.filter((p) => p.id !== programId).slice(0, 3);

  if (lain.length === 0) return null;

  return (
    <>
      <hr className="my-14 border-garis" />
      <JudulBagian
        warna="jingga"
        label="Program Lain"
        judul="Mungkin Anda juga tertarik"
      />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lain.map((p) => (
          <KartuProgram
            key={p.id}
            href={`/program/${p.slug}`}
            nama={p.name}
            ringkas={p.summary}
          />
        ))}
      </ul>
    </>
  );
}

export default async function HalamanProgramDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [program, situs] = await Promise.all([programBySlug(slug), bacaSitus()]);

  if (!program) notFound();

  return (
    <Kerangka situs={situs}>
      <JsonLd
        data={jsonLdRemahRoti([
          { label: "Beranda", href: "/" },
          { label: "Program Pendidikan", href: "/program" },
          { label: program.name },
        ])}
      />
      {/* ============ JUDUL: blok jingga ============ */}
      <section className="bg-jingga text-white">
        <Kontainer>
          <div className="py-12 sm:py-16">
            <RemahRoti
              items={[
                { label: "Beranda", href: "/" },
                { label: "Program", href: "/program" },
                { label: program.name },
              ]}
            />
            <div
              className="mt-6 h-1.5 w-14 rounded-full bg-jingga-terang"
              aria-hidden="true"
            />
            <p className="label-bagian mt-4 text-jingga-terang">Program</p>
            <h1 className="mt-3 max-w-3xl text-display">{program.name}</h1>
            {terisi(program.summary) && (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
                {program.summary}
              </p>
            )}
          </div>
        </Kontainer>
      </section>

      <section className="bg-putih">
        <Kontainer>
          <div className="py-14 lg:py-20">
            {program.image && (
              <div className="rounded-2xl overflow-hidden mb-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/media/${program.image.id}?w=1200`}
                  alt={program.image.alt || program.name}
                  width={program.image.width || 1200}
                  height={program.image.height || 675}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <article className="max-w-3xl space-y-6 text-lg leading-relaxed text-tinta-2">
              <div className="prose prose-slate max-w-none">
                {program.description.split("\n\n").map((paragraf, i) => (
                  <p key={i}>{paragraf}</p>
                ))}
              </div>
            </article>

            <ProgramLain programId={program.id} />
          </div>
        </Kontainer>
      </section>
    </Kerangka>
  );
}