import Link from "next/link";
import { CalendarDays, GraduationCap, Sparkles, Users } from "lucide-react";
import { formatAngka } from "@/lib/utils";

/**
 * Statistik singkat sekolah.
 *
 * Jumlah guru dan ekstrakurikuler diambil dari database sehingga selalu
 * sesuai dengan isi situs. Jumlah siswa dan tahun berdiri berasal dari
 * konfigurasi. Nilai yang belum diisi ditampilkan sebagai tanda hubung,
 * bukan angka nol, agar tidak menyesatkan pembaca.
 */

interface Angka {
  label: string;
  nilai: number | null;
  suffix?: string;
  ikon: typeof Users;
  target: string;
}

export function Statistik({
  siswa,
  guru,
  ekstrakurikuler,
  tahunBerdiri,
}: {
  siswa: number | null;
  guru: number | null;
  ekstrakurikuler: number | null;
  tahunBerdiri: number | null;
}) {
  const angka: Angka[] = [
    {
      label: "Siswa",
      nilai: siswa,
      suffix: "siswa",
      ikon: Users,
      target: "/profil",
    },
    {
      label: "Guru dan Staf",
      nilai: guru,
      suffix: "orang",
      ikon: GraduationCap,
      target: "/guru",
    },
    {
      label: "Ekstrakurikuler",
      nilai: ekstrakurikuler,
      suffix: "kegiatan",
      ikon: Sparkles,
      target: "/ekstrakurikuler",
    },
    {
      label: "Tahun Berdiri",
      nilai: tahunBerdiri,
      ikon: CalendarDays,
      target: "/profil",
    },
  ];

  return (
    <section aria-label="Statistik sekolah" className="border-b bg-background">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border bg-border sm:grid-cols-4">
          {angka.map((item) => (
            <div key={item.label} className="bg-card p-4 sm:p-5">
              <dt className="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
                <item.ikon className="size-4 shrink-0 opacity-70" aria-hidden />
                {item.label}
              </dt>
              <dd className="mt-1.5 text-2xl font-bold tracking-tight sm:text-3xl">
                {item.nilai && item.nilai > 0
                  ? item.label === "Tahun Berdiri"
                    ? String(item.nilai)
                    : formatAngka(item.nilai)
                  : "-"}
                {item.nilai && item.nilai > 0 && item.suffix ? (
                  <span className="ml-1 text-xs font-normal text-muted-foreground sm:text-sm">
                    {item.suffix}
                  </span>
                ) : null}
              </dd>
              {item.nilai && item.nilai > 0 ? (
                <Link
                  href={item.target}
                  className="mt-1 inline-block text-xs text-primary hover:underline"
                >
                  Lihat detail
                </Link>
              ) : (
                <span className="mt-1 inline-block text-xs text-muted-foreground">
                  Belum diisi
                </span>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}