import Link from "next/link";
import { Clock, User, type LucideIcon } from "lucide-react";
import { GambarMedia } from "@/components/site/gambar-media";
import type { Extracurricular, Program, Staff } from "@/lib/db/types";

/** Kartu guru atau staf. */
export function KartuStaff({ orang }: { orang: Staff }) {
  return (
    <li className="animate-fade-up overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <article className="flex h-full flex-col">
        <div className="aspect-[3/4] w-full bg-muted">
          {orang.photo ? (
            <GambarMedia
              id={orang.photo.id}
              alt={orang.photo.alt || orang.name}
              width={orang.photo.width}
              height={orang.photo.height}
              lebar={480}
              className="h-full w-full"
            />
          ) : (
            <span
              className="flex h-full items-center justify-center bg-primary-soft text-4xl font-bold text-primary"
              aria-hidden
            >
              {orang.name.slice(0, 1).toUpperCase()}
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <h3 className="font-semibold leading-snug">{orang.name}</h3>
          {orang.position ? (
            <p className="mt-0.5 text-sm text-muted-foreground">
              {orang.position}
            </p>
          ) : null}
          {orang.subject ? (
            <p className="mt-2 text-xs text-muted-foreground">{orang.subject}</p>
          ) : null}
        </div>
      </article>
    </li>
  );
}

/** Kartu program atau ekstrakurikuler. */
export function KartuKonten({
  item,
  slugPrefix,
  tampilkanJadwal = false,
}: {
  item: Program | Extracurricular;
  slugPrefix: string;
  tampilkanJadwal?: boolean;
}) {
  const jadwal = "schedule" in item ? item.schedule : "";

  return (
    <li className="animate-fade-up overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
      <Link href={`/${slugPrefix}/${item.slug}`} className="block h-full">
        <article className="flex h-full flex-col">
          <div className="aspect-[4/3] w-full bg-muted">
            {item.image ? (
              <GambarMedia
                id={item.image.id}
                alt={item.image.alt || item.name}
                width={item.image.width}
                height={item.image.height}
                lebar={480}
                className="h-full w-full transition-transform duration-300 hover:scale-105"
              />
            ) : (
              <span className="flex h-full items-center justify-center text-muted-foreground">
                <span className="text-3xl" aria-hidden>
                  +
                </span>
              </span>
            )}
          </div>

          <div className="flex flex-1 flex-col p-4">
            <h3 className="font-semibold leading-snug">{item.name}</h3>
            {item.summary ? (
              <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                {item.summary}
              </p>
            ) : null}

            {tampilkanJadwal && jadwal ? (
              <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="size-3.5 shrink-0" aria-hidden />
                {jadwal}
              </p>
            ) : null}

            {"coach" in item && item.coach ? (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                <User className="size-3.5 shrink-0" aria-hidden />
                {item.coach}
              </p>
            ) : null}
          </div>
        </article>
      </Link>
    </li>
  );
}

/** Kotak informasi kecil di halaman detail. */
export function KotakInfo({
  label,
  nilai,
  ikon: Ikon,
}: {
  label: string;
  nilai: string;
  ikon?: LucideIcon;
}) {
  if (!nilai) return null;
  return (
    <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3">
      {Ikon ? <Ikon className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden /> : null}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{nilai}</p>
      </div>
    </div>
  );
}

/** Teks panjang dipecah menjadi paragraf berdasarkan baris kosong. */
export function Paragraf({ teks }: { teks: string }) {
  const bagian = teks
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (bagian.length === 0) return null;

  return (
    <div className="space-y-4">
      {bagian.map((p, i) => (
        <p key={i} className="leading-relaxed">
          {p}
        </p>
      ))}
    </div>
  );
}