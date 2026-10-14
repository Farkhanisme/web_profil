"use client";

import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

/** Kepala halaman CMS: judul, keterangan, dan aksi di kanan. */
export function KepalaHalaman({
  judul,
  deskripsi,
  kembali,
  children,
}: {
  judul: string;
  deskripsi?: string;
  /** URL tombol kembali, mis. "/admin/staff". */
  kembali?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        {kembali ? (
          <Link
            href={kembali}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="size-4" aria-hidden />
            Kembali
          </Link>
        ) : null}

        <h1 className="text-2xl font-bold tracking-tight">{judul}</h1>
        {deskripsi ? (
          <p className="mt-1 text-sm text-muted-foreground">{deskripsi}</p>
        ) : null}
      </div>

      {children ? <div className="flex shrink-0 gap-2">{children}</div> : null}
    </div>
  );
}

/** Wadah kartu untuk daftar dan formulir. */
export function Panel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card shadow-xs",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Keadaan kosong yang jelas, sesuai kriteria penerimaan PRD. */
export function KeadaanKosong({
  judul,
  pesan,
  aksi,
}: {
  judul: string;
  pesan: string;
  aksi?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-14 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl bg-muted">
        <span className="text-lg" aria-hidden>
          ∅
        </span>
      </div>
      <div>
        <p className="font-medium">{judul}</p>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          {pesan}
        </p>
      </div>
      {aksi}
    </div>
  );
}
