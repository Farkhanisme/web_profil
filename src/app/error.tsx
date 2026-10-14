"use client";

import Link from "next/link";
import { useEffect } from "react";

/**
 * Batas galat untuk seluruh halaman di bawah layout root.
 *
 * Berkas ini wajib client component karena Next.js mewajibkan `error`
 * menerima `reset`. Bergaya Blok Warna Madrasah dan berbahasa Indonesia:
 * pesan bawaan Next.js berbahasa Inggris tidak pernah dibaca orang tua,
 * dan halaman yang mereka tuju justru hilang begitu galat muncul.
 *
 * Layout root (termasuk navigasi) tetap tergambar di atas halaman ini.
 */
export default function HalamanGalat({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Tetap dicatat di log server supaya pengelola bisa menelusuri.
    console.error(error);
  }, [error]);

  return (
    <section className="bg-jingga-muda">
      <div className="mx-auto w-full max-w-[1180px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="h-1.5 w-14 rounded-full bg-jingga" aria-hidden="true" />
        <p className="label-bagian mt-4 text-jingga-tua">
          Halaman belum dapat ditampilkan
        </p>
        <h1 className="mt-3 max-w-3xl text-display text-jingga-tua">
          Ada yang bermasalah di sisi kami
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-jingga-tua">
          Halaman ini gagal dimuat, bukan salah Anda. Coba muat sekali lagi,
          atau hubungi kami lewat WhatsApp bila masalahnya berlanjut.
        </p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="tombol bg-jingga text-white hover:bg-jingga-tua"
          >
            Coba lagi
          </button>
          <Link
            href="/"
            className="tombol border-2 border-jingga text-jingga-tua hover:bg-jingga-terang"
          >
            Kembali ke beranda
          </Link>
        </div>

        {error.digest && (
          <p className="mt-6 text-sm text-jingga-tua/80">
            Kode kesalahan: {error.digest}
          </p>
        )}
      </div>
    </section>
  );
}