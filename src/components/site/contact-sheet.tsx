"use client";

import { useState } from "react";

interface PhotoItem {
  id: string;
  src: string;
  caption: string;
  width: number;
  height: number;
}

interface ContactSheetProps {
  photos: PhotoItem[];
  albumTitle: string;
}

/**
 * Contact sheet grid yang membuka lightbox.
 *
 * Dipisah ke Client Component karena butuh onClick handler
 * untuk membuka lightbox via CustomEvent.
 */
export function ContactSheet({ photos, albumTitle }: ContactSheetProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    window.dispatchEvent(
      new CustomEvent("open-lightbox", { detail: { index, photos } })
    );
  };

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {photos.map((f, i) => (
        <figure
          key={f.id}
          className="group relative aspect-square overflow-hidden rounded-xl bg-biru-muda cursor-zoom-in"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={f.src.replace("w=1600", "w=800")}
            alt={f.caption || `${albumTitle} - foto ${i + 1}`}
            width={f.width}
            height={f.height}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
          {f.caption && (
            <figcaption className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
              <p className="text-white text-sm leading-snug w-full">{f.caption}</p>
            </figcaption>
          )}
          <button
            type="button"
            onClick={() => openLightbox(i)}
            className="absolute inset-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-biru"
            aria-label={`Buka foto ${i + 1} dari ${photos.length}`}
          />
        </figure>
      ))}
    </div>
  );
}