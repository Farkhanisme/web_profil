"use client";

import { useState } from "react";
import { Lightbox, type FotoLightbox } from "./lightbox";

/**
 * Contact sheet + lightbox dalam satu komponen.
 *
 * Semula keduanya terpisah dan saling memberi tahu lewat
 * `window.dispatchEvent(new CustomEvent("open-lightbox"))`. Cara itu rapuh:
 * tidak ada tipe yang.checked, state ada di dua tempat, dan event
 * apa pun dengan nama sama dari skrip lain bisa memicu lightbox. Sekarang
 * indeks foto yang sedang dibuka hidup di satu state saja.
 *
 * Catatan penting untuk ponsel: keterangan foto TIDAK hanya muncul saat
 * hover. Di layar sentuh tidak ada hover, jadi keterangan disembunyikan
 * permanen — padahal itu informasi yang paling sering dicari orang tua
 * ("foto ini di kelas mana?").
 */
export function ContactSheet({
  photos,
  albumTitle,
}: {
  photos: FotoLightbox[];
  albumTitle: string;
}) {
  const [terbuka, setTerbuka] = useState<number | null>(null);

  return (
    <>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {photos.map((f, i) => (
          <figure
            key={f.id}
            className="group relative aspect-square overflow-hidden rounded-xl bg-biru-muda"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={f.srcMini}
              srcSet={`${f.srcMini} 800w, ${f.src} 1600w`}
              sizes="(min-width: 1280px) 280px, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              alt={f.caption || `${albumTitle} — foto ${i + 1}`}
              width={f.width}
              height={f.height}
              loading={i < 4 ? "eager" : "lazy"}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/*
              Keterangan: selalu terlihat di layar sentuh (md ke bawah),
              hanya muncul saat hover di layar besar agar grid tetap rapi.
            */}
            {f.caption && (
              <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-3 md:opacity-0 md:transition-opacity md:group-hover:opacity-100">
                <p className="text-sm leading-snug text-white">{f.caption}</p>
              </figcaption>
            )}
            <button
              type="button"
              onClick={() => setTerbuka(i)}
              className="absolute inset-0 cursor-zoom-in focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-biru"
              aria-label={`Perbesar foto ${i + 1} dari ${photos.length}${f.caption ? `: ${f.caption}` : ""}`}
            />
          </figure>
        ))}
      </div>

      {terbuka !== null && (
        <Lightbox
          photos={photos}
          index={terbuka}
          onClose={() => setTerbuka(null)}
          onNavigate={setTerbuka}
        />
      )}
    </>
  );
}