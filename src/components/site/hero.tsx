import Link from "next/link";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { LogoSitus } from "@/components/site/logo";
import {alamatSatuBaris, petaLinkUrl, site, wilayahSingkat } from "@/config/site";

/**
 * Bagian pembuka beranda.
 *
 * Logo dimuat dengan prioritas tinggi (fetchpriority="high") karena
 * adalah elemen terbesar yang tampil di layar pertama, dan itulah yang
 * menentukan skor LCP.
 */
export function Hero({
  logoId,
  nama,
}: {
  logoId: string | null;
  nama: string;
}) {
  return (
    <section className="border-b bg-gradient-to-b from-primary-soft/60 to-background">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:gap-8">
          <LogoSitus
            mediaId={logoId}
            ukuran={96}
            prioritas
            className="animate-fade-in rounded-2xl shadow-sm"
          />

          <div className="min-w-0">
            <p className="mb-2 text-sm font-medium text-primary sm:text-base">
              {site.identity.status}
              {site.identity.foundedYear > 0
                ? ` - sejak ${site.identity.foundedYear}`
                : ""}
            </p>

            <h1 className="text-3xl font-extrabold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {nama}
            </h1>

            <p className="mt-2 text-lg font-medium text-foreground/80 sm:text-xl">
              {site.tagline}
            </p>

            <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
              {site.description}
            </p>

            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:items-center">
              <Link
                href="/kontak"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
              >
                Hubungi Kami
                <ArrowRight className="size-4" aria-hidden />
              </Link>

              <Link
                href="/profil"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border bg-background px-5 text-sm font-medium transition-colors hover:bg-muted"
              >
                Profil Sekolah
              </Link>

              <p className="flex items-center gap-1.5 text-sm text-muted-foreground sm:ml-2">
                <MapPin className="size-4 shrink-0 opacity-70" aria-hidden />
                {wilayahSingkat()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Baris kontak singkat, dipakai di bawah hero dan di bagian bawah. */
export function BarisKontakSingkat() {
  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
      <p className="flex items-center gap-2">
        <MapPin className="size-4 shrink-0 opacity-70" aria-hidden />
        <a
          href={petaLinkUrl()}
          target="_blank"
          rel="noreferrer"
          className="hover:text-foreground hover:underline"
        >
          {alamatSatuBaris() || "Alamat belum dilengkapi"}
        </a>
      </p>

      {site.contact.phone && !site.contact.phone.startsWith("TODO") ? (
        <p className="flex items-center gap-2">
          <Phone className="size-4 shrink-0 opacity-70" aria-hidden />
          <a
            href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
            className="hover:text-foreground hover:underline"
          >
            {site.contact.phone}
          </a>
        </p>
      ) : null}
    </div>
  );
}