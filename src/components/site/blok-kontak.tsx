import Link from "next/link";
import { ArrowRight, MapPin, Navigation, Phone } from "lucide-react";
import { Container } from "@/components/site/container";
import { site, alamatSatuBaris, petaEmbedUrl, petaLinkUrl } from "@/config/site";

/**
 * Blok alamat dan peta ringkas di ujung beranda.
 *
 * Peta memakai iframe `output=embed` dari Google Maps yang tidak
 * memerlukan API key, dimuat dengan `loading="lazy"` supaya tidak
 * menahan elemen lain.
 */
export function BlokKontak() {
  return (
    <section className="bg-muted/30">
      <Container>
        <div className="grid gap-6 py-12 sm:py-14 lg:grid-cols-2 lg:gap-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">
              Lokasi dan Kontak
            </h2>
            <p className="mt-2 max-w-prose leading-relaxed text-muted-foreground">
              Kami terbuka untuk kunjungan dan pertanyaan. Hubungi pengelola
              sekolah lebih dulu agar waktu kunjungan Anda lebih terarah.
            </p>

            <address className="mt-6 space-y-3 not-italic">
              <p className="flex gap-3">
                <MapPin
                  className="mt-0.5 size-5 shrink-0 text-primary"
                  aria-hidden
                />
                <span className="text-sm leading-relaxed">
                  <span className="block font-medium">
                    {site.address.street.startsWith("TODO")
                      ? "Alamat lengkap belum dilengkapi"
                      : site.address.street}
                  </span>
                  {alamatSatuBaris() ? (
                    <span className="block text-muted-foreground">
                      {alamatSatuBaris()}
                    </span>
                  ) : null}
                </span>
              </p>

              {site.contact.phone && !site.contact.phone.startsWith("TODO") ? (
                <p className="flex gap-3">
                  <Phone
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <a
                    href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                    className="text-sm hover:underline"
                  >
                    {site.contact.phone}
                  </a>
                </p>
              ) : null}
            </address>

            <div className="mt-6 flex flex-wrap gap-2.5">
              <Link
                href="/kontak"
                className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Hubungi Kami
                <ArrowRight className="size-4" aria-hidden />
              </Link>

              <a
                href={petaLinkUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center gap-2 rounded-lg border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                <Navigation className="size-4" aria-hidden />
                Buka di Google Maps
              </a>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border bg-muted">
            <iframe
              src={petaEmbedUrl()}
              title={`Peta lokasi ${site.name}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="h-full min-h-72 w-full border-0"
              style={{ aspectRatio: "4 / 3" }}
            />
          </div>
        </div>
      </Container>
    </section>
  );
}