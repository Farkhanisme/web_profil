import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/container";
import { MENU_PUBLIK } from "@/config/navigation";

/**
 * Halaman 404 tidak boleh masuk indeks, apa pun status HTTP yang
 * akhirnya dikirim. Ketika halaman dialirkan, Next.js memang menyuntik
 * tag `noindex`, tetapi menyebutkannya sendiri membuat kedua hal ini
 * tidak bergantung pada perilaku tersebut.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Halaman 404.
 *
 * Selain memberi jalan keluar, halaman ini menawarkan semua menu utama
 * supaya pengunjung salah ketik tidak langsung pergi.
 */
export default function HalamanTidakDitemukan() {
  return (
    <div className="flex min-h-[60vh] items-center">
      <Container>
        <div className="mx-auto max-w-lg text-center">
          <p className="text-7xl font-extrabold tracking-tight text-primary sm:text-8xl">
            404
          </p>
          <h1 className="mt-4 text-2xl font-bold tracking-tight sm:text-3xl">
            Halaman tidak ditemukan
          </h1>
          <p className="mt-3 leading-relaxed text-muted-foreground">
            Alamat yang Anda buka tidak tersedia, mungkin sudah dipindahkan
            atau salah ketik. Silakan pilih halaman di bawah ini.
          </p>

          <ul className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
            {MENU_PUBLIK.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-block rounded-lg border bg-card px-3 py-2 text-sm font-medium transition-colors hover:bg-muted"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="mt-8 text-sm text-muted-foreground">
            Butuh bantuan?{" "}
            <Link href="/kontak" className="font-medium text-primary hover:underline">
              Hubungi pengelola sekolah
            </Link>
            .
          </p>
        </div>
      </Container>
    </div>
  );
}