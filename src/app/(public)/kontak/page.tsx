import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { BreadcrumbAtas } from "@/components/site/breadcrumb";
import { Container } from "@/components/site/container";
import { PageHeader, JudulBagian } from "@/components/site/page-header";
import { Panel } from "@/components/admin/ui";
import { JsonLd, jsonLdFaq, jsonLdRemahRoti, jsonLdSekolah } from "@/lib/json-ld";
import { metadataDasar, verifikasiPencari } from "@/lib/seo";
import { site, alamatSatuBaris, petaEmbedUrl, petaLinkUrl } from "@/config/site";
import { FormKontak } from "./kontak-form";

export async function generateMetadata(): Promise<Metadata> {
  return {
    ...(await metadataDasar(
      "Kontak",
      `Alamat, telepon, dan formulir kontak MTs Ma'arif Tieng di ${site.address.subdistrict}, ${site.address.city}, ${site.address.province}.`,
      "/kontak",
    )),
    verification: verifikasiPencari(),
  };
}

/** 08.00 menjadi "08.00" agar seragam di seluruh situs. */
const namaHari: Record<string, string> = {
  Monday: "Senin",
  Tuesday: "Selasa",
  Wednesday: "Rabu",
  Thursday: "Kamis",
  Friday: "Jumat",
  Saturday: "Sabtu",
  Sunday: "Minggu",
};

export default function HalamanKontak() {
  const adaTelepon =
    site.contact.phone && !site.contact.phone.startsWith("TODO");
  const adaEmail =
    site.contact.email && !site.contact.email.startsWith("TODO");

  return (
    <>
      <JsonLd
        data={[
          jsonLdSekolah(),
          jsonLdRemahRoti([
            { label: "Beranda", href: "/" },
            { label: "Kontak", href: "/kontak" },
          ]),
          jsonLdFaq(),
        ]}
      />

      <BreadcrumbAtas nama="Kontak" segmen="kontak" />

      <PageHeader
        eyebrow="Hubungi Kami"
        judul="Kontak"
        deskripsi="Pengelola sekolah siap membantu pertanyaan seputar pendaftaran, kegiatan, dan kunjungan."
      />

      <Container>
        <div className="grid gap-8 py-10 sm:py-12 lg:grid-cols-2 lg:gap-10">
          {/* Informasi kontak */}
          <div className="space-y-6">
            <section>
              <h2 className="mb-3 text-xl font-bold tracking-tight">
                Alamat dan Kontak
              </h2>

              <ul className="space-y-3">
                <li className="flex gap-3">
                  <MapPin
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <div>
                    <p className="text-sm font-medium">{site.name}</p>
                    <address className="text-sm not-italic leading-relaxed text-muted-foreground">
                      {alamatSatuBaris() || "Alamat belum dilengkapi"}
                    </address>
                    <a
                      href={petaLinkUrl()}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-block text-sm font-medium text-primary hover:underline"
                    >
                      Buka di Google Maps
                    </a>
                  </div>
                </li>

                {adaTelepon ? (
                  <li className="flex gap-3">
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
                  </li>
                ) : null}

                {adaEmail ? (
                  <li className="flex gap-3">
                    <Mail
                      className="mt-0.5 size-5 shrink-0 text-primary"
                      aria-hidden
                    />
                    <a
                      href={`mailto:${site.contact.email}`}
                      className="break-all text-sm hover:underline"
                    >
                      {site.contact.email}
                    </a>
                  </li>
                ) : null}

                <li className="flex gap-3">
                  <Clock
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <div className="text-sm">
                    <p className="font-medium">Jam layanan</p>
                    <ul className="mt-0.5 text-muted-foreground">
                      {site.openingHours.map((j) => (
                        <li key={j.days[0]}>
                          {j.days.map((d) => namaHari[d]).join(", ")}: {j.opens} -
                          {j.closes}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              </ul>

              {!adaTelepon || !adaEmail ? (
                <p className="mt-3 rounded-lg border border-dashed px-3 py-2 text-xs text-muted-foreground">
                  Nomor telepon dan email resmi belum dilengkapi. meantime,
                  gunakan formulir di samping.
                </p>
              ) : null}
            </section>

            {/* Peta */}
            <section>
              <h2 className="mb-3 text-xl font-bold tracking-tight">
                Peta Lokasi
              </h2>
              <div className="overflow-hidden rounded-xl border bg-muted">
                <iframe
                  src={petaEmbedUrl()}
                  title={`Peta lokasi ${site.name}`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-72 w-full border-0 sm:h-80"
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Peta ditampilkan oleh Google Maps dan memerlukan koneksi
                internet.
              </p>
            </section>
          </div>

          {/* Formulir */}
          <section>
            <h2 className="mb-3 text-xl font-bold tracking-tight">
              Kirim Pesan
            </h2>
            <Panel className="p-4 sm:p-6">
              <FormKontak />
            </Panel>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
              Pesan Anda disimpan oleh pengelola sekolah dan hanya dipakai
              untuk membalas pertanyaan Anda. Baca{" "}
              <Link
                href="/kebijakan-privasi"
                className="font-medium text-primary hover:underline"
              >
                kebijakan privasi
              </Link>{" "}
              untuk penjelasan lengkap.
            </p>
          </section>
        </div>
      </Container>

      {/* FAQ singkat agar mesin AI menemukan jawaban langsung */}
      <section className="border-t bg-muted/30">
        <Container lebar="sempit">
          <div className="py-10 sm:py-12">
            <JudulBagian
              judul="Pertanyaan Umum"
              deskripsi="Jawaban singkat sebelum Anda mengirim pesan."
            />
            <dl className="space-y-4">
              {kontakFaq.map((item) => (
                <div key={item.question}>
                  <dt className="font-medium">{item.question}</dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>
    </>
  );
}

/** FAQ yang dapat dijawab tanpa perlu menghubungi sekolah. */
const kontakFaq = [
  {
    question: "Di mana lokasi MTs Ma'arif Tieng?",
    answer: `Sekolah ini berada di ${site.address.subdistrict}, ${site.address.city}, ${site.address.province}. Peta lengkapnya tersedia di bagian Peta Lokasi di halaman ini.`,
  },
  {
    question: "Bagaimana cara menghubungi sekolah?",
    answer:
      "Gunakan formulir pesan pada halaman ini. Pengelola akan membalas melalui kontak yang Anda cantumkan.",
  },
  {
    question: "Apakah sekolah menerima kunjungan?",
    answer:
      "Kunjungan perlu dijadwalkan lebih dulu lewat formulir pesan agar pengelola dapat menyiapkan waktunya.",
  },
];