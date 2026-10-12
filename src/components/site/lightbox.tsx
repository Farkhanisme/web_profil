"use client";

import { useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

export interface FotoLightbox {
  id: string;
  mediaId: string;
  caption: string;
  width: number;
  height: number;
  alt: string;
}

/**
 * Penampil foto (lightbox).
 *
 * Semua foto memakai komponen Dialog dari shadcn, sehingga-focus trap,
 * tombol Escape, dan pengembalian fokus ke pemicunya sudah ditangani.
 * Panah kiri dan kanan untuk berpindah foto.
 */
export function Lightbox({
  foto,
  urutan,
  onTutup,
}: {
  foto: FotoLightbox[];
  urutan: number;
  onTutup: () => void;
}) {
  const [posisi, setPosisi] = useState(urutan);

  const geser = useCallback(
    (arah: -1 | 1) => {
      setPosisi((p) => (p + arah + foto.length) % foto.length);
    },
    [foto.length],
  );

  const ini = foto[posisi];
  if (!ini) return null;

  return (
    <Dialog open onOpenChange={(buka) => !buka && onTutup()}>
      <DialogContent
        showCloseButton={false}
        className="max-w-[95vw] gap-3 border-none bg-transparent p-0 shadow-none sm:max-w-[95vw]"
      >
        <DialogHeader className="sr-only">
          <DialogTitle>
            Foto {posisi + 1} dari {foto.length}
          </DialogTitle>
          <DialogDescription>{ini.caption || "Foto kegiatan sekolah"}</DialogDescription>
        </DialogHeader>

        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/media/${ini.mediaId}?w=1600`}
            alt={ini.alt || ini.caption || "Foto kegiatan sekolah"}
            width={ini.width}
            height={ini.height}
            className="max-h-[80vh] w-auto rounded-lg object-contain shadow-2xl"
            // Pemotan di dalam dialog: muat tanpa membuat halaman panjang.
            style={{ maxWidth: "min(92vw, 1100px)" }}
          />

          {foto.length > 1 ? (
            <>
              <button
                type="button"
                onClick={() => geser(-1)}
                aria-label="Foto sebelumnya"
                className="absolute left-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <ChevronLeft className="size-5" aria-hidden />
              </button>
              <button
                type="button"
                onClick={() => geser(1)}
                aria-label="Foto berikutnya"
                className="absolute right-1 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
              >
                <ChevronRight className="size-5" aria-hidden />
              </button>
            </>
          ) : null}

          <button
            type="button"
            onClick={onTutup}
            aria-label="Tutup"
            className="absolute -top-2 right-1 flex size-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 sm:-right-2 sm:top-0"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="flex items-center justify-between gap-4 text-sm text-white/90">
          <p className="min-w-0 flex-1 truncate">
            {ini.caption || "Foto kegiatan sekolah"}
          </p>
          <p className={cn("shrink-0 tabular-nums")}>
            {posisi + 1} / {foto.length}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}