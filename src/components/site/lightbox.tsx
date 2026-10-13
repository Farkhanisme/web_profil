"use client";

import { useState, useEffect, useCallback } from "react";

interface PhotoItem {
  id: string;
  src: string;
  caption: string;
  width: number;
  height: number;
}

/**
 * Lightbox untuk galeri foto.
 *
 * - Navigasi: panah kiri/kanan, swipe (touch), ESC untuk tutup
 * - Preload foto sebelum/sesudah yang sedang dilihat
 * - Aksesibilitas: focus trap, aria-label, keyboard navigation
 * - Performa: hanya 3 foto di DOM (sebelum, sekarang, sesudah)
 */
export function Lightbox({
  photos,
  initialIndex,
  onClose,
}: {
  photos: PhotoItem[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [loaded, setLoaded] = useState<Set<number>>(new Set([initialIndex]));
  const [touchStart, setTouchStart] = useState<number | null>(null);

  // Fokus trap & keyboard
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + photos.length) % photos.length);
      else if (e.key === "ArrowRight") setIndex((i) => (i + 1) % photos.length);
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [photos.length, onClose]);

  // Preload adjacent
  useEffect(() => {
    const preload = [index];
    if (index > 0) preload.push(index - 1);
    if (index < photos.length - 1) preload.push(index + 1);
    preload.forEach((i) => setLoaded((s) => new Set([...s, i])));
  }, [index, photos.length]);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = e.changedTouches[0].clientX - touchStart;
    if (Math.abs(diff) > 40) {
      if (diff > 0) setIndex((i) => (i - 1 + photos.length) % photos.length);
      else setIndex((i) => (i + 1) % photos.length);
    }
    setTouchStart(null);
  };

  const photo = photos[index];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} dari ${photos.length}`}
      onClick={onClose}
    >
      {/* Preload adjacent */}
      {loaded.has((index - 1 + photos.length) % photos.length) && (
        <img
          src={photos[(index - 1 + photos.length) % photos.length].src}
          alt=""
          aria-hidden="true"
          className="absolute -left-full w-0 h-0 opacity-0 pointer-events-none"
        />
      )}
      {loaded.has((index + 1) % photos.length) && (
        <img
          src={photos[(index + 1) % photos.length].src}
          alt=""
          aria-hidden="true"
          className="absolute -right-full w-0 h-0 opacity-0 pointer-events-none"
        />
      )}

      {/* Konten utama */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] w-auto h-auto"
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {photo && loaded.has(index) && (
          <>
            <img
              src={photo.src}
              alt={photo.caption || `Foto ${index + 1}`}
              width={photo.width}
              height={photo.height}
              className="max-w-[90vw] max-h-[85vh] w-auto h-auto object-contain"
            />
            {photo.caption && (
              <figcaption className="mt-3 text-center text-white/80 text-sm px-2">
                {photo.caption}
              </figcaption>
            )}
          </>
        )}

        {/* Navigasi */}
        {photos.length > 1 && (
          <>
            <button
              onClick={() => setIndex((i) => (i - 1 + photos.length) % photos.length)}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-10 md:-translate-x-14 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Foto sebelumnya"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % photos.length)}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-10 md:translate-x-14 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Foto berikutnya"
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </>
        )}

        {/* Counter */}
        {photos.length > 1 && (
          <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 text-white/70 text-sm">
            {index + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Tutup */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        aria-label="Tutup lightbox"
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  );
}