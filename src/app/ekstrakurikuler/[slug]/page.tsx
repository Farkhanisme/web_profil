import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ekstrakurikulerBySlug, ekstrakurikulerTerbit } from "@/lib/queries/konten";
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
  const ekstra = await ekstrakurikulerBySlug(slug);
  if (!ekstra) return { title: "Tidak Ditemukan" };
  return metadataDasar(ekstra.name, ekstra.summary, `/ekstrakurikuler/${slug}`);
}

export async function generateStaticParams() {
  const ekstra = await ekstrakurikulerTerbit();
  return ekstra.map((e) => ({ slug: e.slug }));
}

function EkstraLain({ ekstraId }: { ekstraId: string }) {
  return <EkstraLainAsync ekstraId={ekstraId} />;
}

async function EkstraLainAsync({ ekstraId }: { ekstraId: string }) {
  const ekstraLain = await ekstrakurikulerTerbit();
  const lain = ekstraLain.filter((e) => e.id !== ekstraId).slice(0, 3);

  if (lain.length === 0) return null;

  return (
    <>
      <hr className="my-14 border-garis" />
      <JudulBagian
        warna="jingga"
        label="Ekstrakurikuler Lain"
        judul="Mungkin Anda juga tertarik"
      />
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lain.map((e) => (
          <KartuProgram
            key={e.id}
            href={`/ekstrakurikuler/${e.slug}`}
            nama={e.name}
            ringkas={e.summary}
          />
        ))}
      </ul>
    </>
  );
}

export default async function HalamanEkstrakurikulerDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [ekstra, situs] = await Promise.all([
    ekstrakurikulerBySlug(slug),
    bacaSitus(),
  ]);

  if (!ekstra) notFound();

  return (
    <Kerangka situs={situs}>
      <JsonLd
        data={jsonLdRemahRoti([
          { label: "Beranda", href: "/" },
          { label: "Ekstrakurikuler", href: "/ekstrakurikuler" },
          { label: ekstra.name },
        ])}
      />
      {/* ============ JUDUL: blok jingga ============ */}
      <section className="bg-jingga text-white">
        <Kontainer>
          <div className="py-12 sm:py-16">
            <RemahRoti
              items={[
                { label: "Beranda", href: "/" },
                { label: "Ekstrakurikuler", href: "/ekstrakurikuler" },
                { label: ekstra.name },
              ]}
            />
            <div
              className="mt-6 h-1.5 w-14 rounded-full bg-jingga-terang"
              aria-hidden="true"
            />
            <p className="label-bagian mt-4 text-white">
              Ekstrakurikuler
            </p>
            <h1 className="mt-3 max-w-3xl text-display">{ekstra.name}</h1>
            {terisi(ekstra.summary) && (
              <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/95">
                {ekstra.summary}
              </p>
            )}
          </div>
        </Kontainer>
      </section>

      <section className="bg-putih">
        <Kontainer>
          <div className="py-14 lg:py-20">
            {ekstra.image && (
              <div className="rounded-2xl overflow-hidden mb-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`/media/${ekstra.image.id}?w=1200`}
                  alt={ekstra.image.alt || ekstra.name}
                  width={ekstra.image.width || 1200}
                  height={ekstra.image.height || 675}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            <article className="max-w-3xl space-y-6 text-lg leading-relaxed text-tinta-2">
              <div>
                {ekstra.description.split("\n\n").map((paragraf, i) => (
                  <p key={i}>{paragraf}</p>
                ))}
              </div>
            </article>

            {/* --- Info jadwal & pembina --- */}
            {(terisi(ekstra.schedule) || terisi(ekstra.coach)) && (
              <div className="mt-12 rounded-xl bg-jingga-muda p-6">
                <p className="label-bagian text-jingga-tua">Informasi</p>
                <dl className="mt-4 grid gap-2 sm:grid-cols-2">
                  {terisi(ekstra.schedule) && (
                    <>
                      <dt className="text-tinta-3">Jadwal</dt>
                      <dd className="font-semibold">{ekstra.schedule}</dd>
                    </>
                  )}
                  {terisi(ekstra.coach) && (
                    <>
                      <dt className="text-tinta-3">Pembina</dt>
                      <dd className="font-semibold">{ekstra.coach}</dd>
                    </>
                  )}
                </dl>
              </div>
            )}

            <EkstraLain ekstraId={ekstra.id} />
          </div>
        </Kontainer>
      </section>
    </Kerangka>
  );
}