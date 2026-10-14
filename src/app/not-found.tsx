import type { Metadata } from "next";
import Link from "next/link";
import { bacaSitus } from "@/lib/queries/profil";
import { waLinkUrl } from "@/lib/konten";
import { HALAMAN_PUBLIK } from "@/config/navigation";
import { Kontainer } from "@/components/site/dasar";
import { Kerangka } from "@/components/site/kerangka";

/**
 * Halaman 404.
 *
 * Halaman ini tidak boleh masuk indeks, apa pun status HTTP yang
 * akhirnya dikirim. Ketika halaman dialirkan, Next.js memang menyuntik
 * tag `noindex`, tetapi menyebutkannya sendiri membuat kedua hal ini
 * tidak bergantung pada perilaku tersebut.
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

/**
 * Semua halaman publik, bukan hanya empat menu utama.
 *
 * Pengunjung yang salah ketik biasanya datang lewat tautan lama yang
 * sudah berubah atau pesan WhatsApp yang isinya sudah kedaluwarsa.
 * Karena itu halaman ini menawarkan jalan keluar lengkap, bukan sekadar
 * "kembali ke beranda" yang memaksa belajar lagi.
 */
const HALAMAN = [{ href: "/", label: "Beranda" }, ...HALAMAN_PUBLIK];

export default async function HalamanTidakDitemukan() {
  const situs = await bacaSitus();
  const wa = waLinkUrl(
    situs,
    "Halo, saya menemukan halaman yang rusak di situs madrasah.",
  );

  return (
    <Kerangka situs={situs}>
      <section className="bg-hijau-muda">
        <Kontainer>
          <div className="py-12 sm:py-16">
            <div className="h-1.5 w-14 rounded-full bg-hijau" aria-hidden="true" />
            <p className="label-bagian mt-4 text-hijau-tua">Halaman tidak ditemukan</p>
            <h1 className="mt-3 max-w-3xl text-display text-hijau-tua">
              Alamat ini sudah tidak ada
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-hijau-tua">
              Halaman yang Anda buka mungkin sudah dipindahkan, atau alamatnya
              salah ketik. Tidak apa-apa — pilih salah satu halaman di bawah
              ini, atau hubungi kami bila tetap kesulitan mencari.
            </p>
          </div>
        </Kontainer>
      </section>

      <section className="bg-putih">
        <Kontainer>
          <div className="py-12 sm:py-16">
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {HALAMAN.map((h) => (
                <li key={h.href}>
                  <Link
                    href={h.href}
                    className="flex min-h-16 items-center justify-between rounded-xl border-2 border-hijau-terang bg-hijau-muda px-4 font-judul font-semibold text-hijau-tua transition-transform hover:-translate-y-0.5"
                  >
                    {h.label}
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link href="/" className="tombol bg-hijau text-white hover:bg-hijau-tua">
                Kembali ke beranda
              </Link>
              {wa && (
                <a
                  href={wa}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="tombol border-2 border-hijau text-hijau-tua hover:bg-hijau-muda"
                >
                  Tanya lewat WhatsApp
                </a>
              )}
            </div>
          </div>
        </Kontainer>
      </section>
    </Kerangka>
  );
}