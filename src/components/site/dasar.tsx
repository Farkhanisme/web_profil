import type { ReactNode } from "react";

/**
 * Komponen dasar kerangka halaman.
 *
 * Hanya `Kontainer` yang tersisa di sini. `JudulBagian` pernah ada dua
 * kali (di sini dan di `blok.tsx`) dengan gaya berbeda, sehingga mudah
 * salah import dan membuat halaman kehilangan garis warna bagiannya.
 * Sekarang hanya ada satu, di `blok.tsx`.
 *
 * Lebar konten maksimum: 1180px, dengan padding yang nyaman di HP.
 */
export function Kontainer({
  children,
  kelas = "",
}: {
  children: ReactNode;
  kelas?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-[1180px] px-4 sm:px-6 lg:px-8 ${kelas}`}>
      {children}
    </div>
  );
}
