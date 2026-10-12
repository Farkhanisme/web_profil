import Link from "next/link";
import { FolderOpen, type LucideIcon } from "lucide-react";
import { JudulBagian } from "@/components/site/page-header";

/**
 * Keadaan kosong.
 *
 * PRD menuntut halaman yang belum terisi tetap menampilkan pesan yang
 * jelas, bukan halaman kosong. Kalimatnya jujur: data memang belum ada.
 */
export function KeadaanKosongPublik({
  judul,
  pesan,
  ikon: Ikon = FolderOpen,
  aksi,
}: {
  judul: string;
  pesan: string;
  ikon?: LucideIcon;
  aksi?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-6 py-14 text-center">
      <span className="flex size-11 items-center justify-center rounded-xl bg-muted">
        <Ikon className="size-5 text-muted-foreground" aria-hidden />
      </span>
      <div>
        <p className="font-medium">{judul}</p>
        <p className="mx-auto mt-1 max-w-md text-sm leading-relaxed text-muted-foreground">
          {pesan}
        </p>
      </div>
      {aksi}
    </div>
  );
}

/** Pembungkus daftar dengan judul bagian dan keadaan kosong. */
export function DaftarDenganJudul({
  judul,
  deskripsi,
  jumlah,
  kosong,
  children,
}: {
  judul: string;
  deskripsi: string;
  jumlah: number;
  kosong: { judul: string; pesan: string; ikon?: LucideIcon };
  children: React.ReactNode;
}) {
  return (
    <section className="border-b">
      <div className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
        {jumlah > 0 ? (
          <JudulBagian judul={judul} deskripsi={deskripsi} />
        ) : (
          <h2 className="mb-6 text-2xl font-bold tracking-tight">{judul}</h2>
        )}

        {jumlah === 0 ? (
          <KeadaanKosongPublik
            judul={kosong.judul}
            pesan={kosong.pesan}
            ikon={kosong.ikon}
          />
        ) : (
          children
        )}
      </div>
    </section>
  );
}

/** Tautan "lihat semua" ke halaman daftar dari halaman detail. */
export function KembaliKeDaftar({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
    >
      {label}
    </Link>
  );
}