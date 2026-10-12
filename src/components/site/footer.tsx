import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { Container } from "@/components/site/container";
import { LogoSitus, NamaSitus } from "@/components/site/logo";
import { TahunBerjalan } from "@/components/site/tahun";
import { MENU_PUBLIK } from "@/config/navigation";
import { site, alamatSatuBaris, petaLinkUrl } from "@/config/site";

/**
 * Footer situs.
 *
 * Berisi NAP (nama, alamat, telepon) yang persis sama dengan yang
 * dipakai di header, JSON-LD, dan halaman kontak. Konsistensi NAP
 * penting karena mesin AI membandingkan beberapa sumber.
 *
 * Logo diteruskan dari layout publik, sama seperti di header, agar
 * keduanya menampilkan lambang yang sama begitu admin mengunggahnya.
 */
export function SiteFooter({ logoId }: { logoId: string | null }) {

  return (
    <footer className="mt-auto border-t bg-muted/40">
      <Container>
        <div className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:py-12">
          {/* Identitas */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <LogoSitus mediaId={logoId} ukuran={40} />
              <NamaSitus tampilkanSlogan />
            </Link>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {site.tagline}
            </p>
          </div>

          {/* NAP */}
          <div className="space-y-3">
            <p className="text-sm font-semibold">Kontak</p>
            <address className="space-y-2 text-sm not-italic text-muted-foreground">
              <p className="flex gap-2">
                <MapPin className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
                <span>
                  <a
                    href={petaLinkUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-foreground hover:underline"
                  >
                    {alamatSatuBaris() || "Alamat belum dilengkapi"}
                  </a>
                </span>
              </p>

              {site.contact.phone && !site.contact.phone.startsWith("TODO") ? (
                <p className="flex gap-2">
                  <Phone className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
                  <a
                    href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
                    className="hover:text-foreground hover:underline"
                  >
                    {site.contact.phone}
                  </a>
                </p>
              ) : null}

              {site.contact.email && !site.contact.email.startsWith("TODO") ? (
                <p className="flex gap-2">
                  <Mail className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
                  <a
                    href={`mailto:${site.contact.email}`}
                    className="break-all hover:text-foreground hover:underline"
                  >
                    {site.contact.email}
                  </a>
                </p>
              ) : null}

              <p className="flex gap-2">
                <Clock className="mt-0.5 size-4 shrink-0 opacity-70" aria-hidden />
                <span>
                  {site.openingHours
                    .map((j) => `${j.days[0]!.slice(0, 3)}-${j.days[j.days.length - 1]!.slice(0, 3)} ${j.opens}-${j.closes}`)
                    .join(" - ")}
                </span>
              </p>
            </address>
          </div>

          {/* Tautan halaman */}
          <nav aria-label="Tautan footer">
            <p className="mb-3 text-sm font-semibold">Halaman</p>
            <ul className="space-y-2 text-sm">
              {MENU_PUBLIK.filter((m) => m.href !== "/").map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/kebijakan-privasi"
                  className="text-muted-foreground transition-colors hover:text-foreground hover:underline"
                >
                  Kebijakan Privasi
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 border-t py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            Copyright <TahunBerjalan /> {site.name}. Seluruh hak cipta
            dilindungi.
          </p>
          <p>
            Dibangun dengan bantuan kecerdasan buatan, disunting dan
            diverifikasi pengelola sekolah.
          </p>
        </div>
      </Container>
    </footer>
  );
}