import type { ReactNode } from "react";

/** Lebar konten maksimum: 1180px, dengan padding yang comfort di HP. */
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

/** Label bagian: "PROFIL MADRASAH". */
export function Label({ children }: { children: ReactNode }) {
  return <p className="label-bagian">{children}</p>;
}

/**
 * Judul bagian dengan garis warna identitas di atasnya.
 * Warna lewat `warna`: "hijau" | "jingga" | "biru" | "kuning".
 */
export function JudulBagian({
  warna,
  label,
  judul,
  children,
}: {
  warna: "hijau" | "jingga" | "biru" | "kuning";
  label: string;
  judul: string;
  children?: ReactNode;
}) {
  const garis = {
    hijau: "bg-hijau",
    jingga: "bg-jingga",
    biru: "bg-biru",
    kuning: "bg-kuning-terang",
  }[warna];

  return (
    <div>
      <div className={`h-1.5 w-14 rounded-full ${garis}`} aria-hidden="true" />
      <Label>{label}</Label>
      <h2 className="mt-3 text-title">{judul}</h2>
      {children && (
        <div className="mt-4 max-w-2xl text-tinta-2">{children}</div>
      )}
    </div>
  );
}