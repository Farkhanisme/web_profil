import type { Metadata } from "next";
import { bacaSitus } from "@/lib/queries/profil";
import { terisi, waLinkUrl, petaEmbedUrl, petaLinkUrl, alamatSatuBaris, teleponHref } from "@/lib/konten";
import { metadataDasar } from "@/lib/seo";
import { Kontainer } from "@/components/site/dasar";
import { Kerangka } from "@/components/site/kerangka";
import { FormKontak } from "@/components/site/form-kontak";

export async function generateMetadata(): Promise<Metadata> {
  return metadataDasar("Kontak", undefined, "/kontak");
}

export default async function HalamanKontak() {
  const situs = await bacaSitus();
  const wa = waLinkUrl(situs);

  return (
    <Kerangka situs={situs}>
      <section className="bg-jingga text-white">
        <Kontainer>
          <div className="py-12 sm:py-16">
            <div
              className="h-1.5 w-14 rounded-full bg-kuning-terang"
              aria-hidden="true"
            />
            <p className="label-bagian mt-4 text-kuning-terang">Kontak</p>
            <h1 className="mt-3 max-w-3xl text-display">
              Hubungi madrasah
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
              Tanyakan pendaftaran, jadwal, atau kunjungan kelas. Kami balas secepatnya.
            </p>
          </div>
        </Kontainer>
      </section>

      <section className="bg-putih">
        <Kontainer>
          <div className="grid gap-10 py-14 lg:grid-cols-[1fr_1fr] lg:py-20">
            <div>
              <div className="space-y-6">
                {terisi(alamatSatuBaris(situs)) && (
                  <div>
                    <p className="label-bagian text-tinta-3">Alamat</p>
                    <p className="mt-2 text-lg leading-relaxed">{alamatSatuBaris(situs)}</p>
                  </div>
                )}

                {situs.openingHours && situs.openingHours.length > 0 && (
                  <div>
                    <p className="label-bagian text-tinta-3">Jam layanan</p>
                    <ul className="mt-2 space-y-1 text-lg">
                      {situs.openingHours.map((o, i) => (
                        <li key={i}>
                          {o.days.join(", ")}: {o.opens}-{o.closes}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <p className="label-bagian text-tinta-3">Telepon &amp; email</p>
                  <div className="mt-2 space-y-1 text-lg">
                    {terisi(situs.contact.phone) ? (
                      <a href={teleponHref(situs)} className="block hover:underline">
                        {situs.contact.phone}
                      </a>
                    ) : (
                      <span className="text-tinta-3">Belum diisi</span>
                    )}
                    {terisi(situs.contact.email) && (
                      <a href={`mailto:${situs.contact.email}`} className="block break-all hover:underline">
                        {situs.contact.email}
                      </a>
                    )}
                  </div>
                </div>

                {wa && (
                  <div>
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex min-h-12 items-center rounded-full bg-jingga px-6 py-3 font-judul font-bold text-white hover:bg-jingga-tua"
                    >
                      Chat WhatsApp
                    </a>
                  </div>
                )}

                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-garis bg-biru-muda">
                  <iframe
                    src={petaEmbedUrl(situs)}
                    title="Peta lokasi madrasah"
                    loading="lazy"
                    className="h-full w-full border-0"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <a
                  href={petaLinkUrl(situs)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold text-biru-tua hover:underline"
                >
                  Buka di Google Maps
                </a>
              </div>
            </div>

            <div>
              <h2 className="font-judul text-title text-jingga-tua">
                Kirim pesan
              </h2>
              <p className="mt-2 text-tinta-2">
                Isi formulir; pengelola madrasah akan membalas melalui telepon/email yang Anda tuliskan.
              </p>
              <div className="mt-6">
                <FormKontak />
              </div>
            </div>
          </div>
        </Kontainer>
      </section>
    </Kerangka>
  );
}
