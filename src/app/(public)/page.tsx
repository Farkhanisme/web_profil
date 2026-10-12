import Link from "next/link";
import { Bagian, Container } from "@/components/site/container";
import { JudulBagian, PageHeader } from "@/components/site/page-header";
import { site } from "@/config/site";

/**
 * Beranda sementara.
 *
 * Isi lengkap dibangun pada T11. Yang penting sekarang: layout publik
 * (header, navigasi, footer) sudah tampil dan terbaca mesin.
 */
export default function Beranda() {
  return (
    <>
      <PageHeader
        judul={site.name}
        deskripsi={site.description}
        eyebrow="Sekolah"
      />

      <Container>
        <Bagian>
          <JudulBagian judul="Halaman yang sedang disiapkan" />
          <p className="max-w-2xl text-muted-foreground">
            Layout publik sudah aktif. Isi setiap halaman menyusul: profil
            sekolah, daftar guru, program, ekstrakurikuler, galeri, dan
            kontak.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/profil"
              className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary-hover"
            >
              Lihat profil
            </Link>
            <Link
              href="/kontak"
              className="rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors hover:bg-muted"
            >
              Hubungi kami
            </Link>
          </div>
        </Bagian>
      </Container>
    </>
  );
}