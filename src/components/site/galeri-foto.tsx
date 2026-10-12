"use client";

import { useState } from "react";
import { Maximize2 } from "lucide-react";
import { Lightbox, type FotoLightbox } from "@/components/site/lightbox";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Berapa banyak foto yang tampil sebelum menekan tombol tambah. */
const AWAL = 24;

/**
 * Kisi foto dalam album.
 *
 * Dua hal yang dijaga demi performa:
 *   1. Hanya 24 foto yang benar-benar ada di DOM saat halaman dibuka.
 *      Sisanya baru dirender setelah tombol ditekan.
 *   2. Metadata foto yang dikirim ke peramban kecil (id, ukuran, alt),
 *      bukan berkas gambarnya. Gambar diambil dari proxy saat memang
 *      terlihat, dengan loading="lazy".
 */
export function GaleriFoto({ foto }: { foto: FotoLightbox[] }) {
  const [tampil, setTampil] = useState(AWAL);
  const [buka, setBuka] = useState<number | null>(null);

  const terlihat = foto.slice(0, tampil);
  const sisa = foto.length - terlihat.length;

  if (foto.length === 0) return null;

  return (
    <>
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
        {terlihat.map((f, i) => (
          <li key={f.id}>
            <button
              type="button"
              onClick={() => setBuka(i)}
              aria-label={`Perbesar: ${f.caption || "foto kegiatan sekolah"}`}
              className="group relative block aspect-square w-full overflow-hidden rounded-lg bg-muted transition-transform hover:scale-[1.02]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/media/${f.mediaId}?w=480`}
                alt={f.alt || f.caption || "Foto kegiatan sekolah"}
                width={f.width}
                height={f.height}
                loading="lazy"
                decoding="async"
                className="h-full w-full object-cover"
              />

              <span
                className={cn(
                  "absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent",
                  "flex items-end p-2 text-left text-xs leading-snug text-white",
                  "opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100",
                )}
              >
                {f.caption || "Foto kegiatan"}
              </span>

              <span className="pointer-events-none absolute right-1.5 top-1.5 rounded-full bg-black/50 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                <Maximize2 className="size-3" aria-hidden />
              </span>
            </button>
          </li>
        ))}
      </ul>

      {sisa > 0 ? (
        <div className="mt-6 flex justify-center">
          <Button variant="outline" onClick={() => setTampil((t) => t + AWAL)}>
            Muat lebih banyak ({sisa} foto tersisa)
          </Button>
        </div>
      ) : null}

      {buka !== null ? (
        <Lightbox foto={foto} urutan={buka} onTutup={() => setBuka(null)} />
      ) : null}
    </>
  );
}