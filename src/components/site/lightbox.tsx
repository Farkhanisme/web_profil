"use client";

import { useCallback, useEffect, useRef } from "react";

export interface FotoLightbox {
  id: string;
  /** URL untuk tampilan besar. */
  src: string;
  /** URL untuk pratinjau cepat saat berpindah foto. */
  srcMini: string;
  caption: string;
  width: number;
  height: number;
}

/**
 * Lightbox galeri.
 *
 * Perilaku yang diuji di sini bukan soal animasi, melainkan tiga hal
 * yang sering terlewat dan langsung terasa oleh pengguna:
 *   1. Fokus dikurung di dalam dialog. Tanpa itu, menekan Tab membuat layar
 *      pembaca layar keluar ke konten di belakang overlay.
 *   2. Fokus dikembalikan ke foto yang diklik setelah ditutup, jadi
 *      pengguna tidak mulai lagi dari atas halaman.
 *   3. Tombol navigasi berukuran 48 px dan berada di dalam layar.
 *      Versi sebelumnya memakai 44 px dan digeser keluar viewport pada
 *      ponsel.
 */
export function Lightbox({
  photos,
  index,
  onClose,
  onNavigate,
}: {
  photos: FotoLightbox[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const kotak = useRef<HTMLDivElement>(null);
  const tombolTutup = useRef<HTMLButtonElement>(null);
  const sentuhMulai = useRef<number | null>(null);

  // Elemen yang sedang difokus sebelum lightbox dibuka. Diambil satu
  // kali saat mount, dipulihkan saat ditutup, supaya pengguna tidak
  // harus mencari kembali foto yang tadi diklik.
  const mundur = useRef<Element | null>(null);

  const berikutnya = useCallback(
    (arah: 1 | -1) =>
      onNavigate((index + arah + photos.length) % photos.length),
    [index, photos.length, onNavigate],
  );

  // Kunci gulir halaman + kunci fokus di dalam dialog.
  useEffect(() => {
    const gulirSebelum = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    mundur.current = document.activeElement;
    tombolTutup.current?.focus();

    return () => {
      document.body.style.overflow = gulirSebelum;
      // Kembalikan fokus ke elemen yang membuka lightbox.
      if (mundur.current instanceof HTMLElement) mundur.current.focus();
    };
    // Satu kali per pembukaan: indeks foto ditangani lewat prop.
  }, []);

  // Navigasi papan ketik + kurung fokus.
  useEffect(() => {
    const tekan = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        berikutnya(-1);
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        berikutnya(1);
        return;
      }
      if (e.key !== "Tab") return;

      // Kurung fokus: hanya tombol di dalam dialog yang bisa difokuskan.
      const bisa = kotak.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!bisa || bisa.length === 0) return;
      const pertama = bisa[0];
      const terakhir = bisa[bisa.length - 1];

      if (e.shiftKey && document.activeElement === pertama) {
        e.preventDefault();
        terakhir.focus();
      } else if (!e.shiftKey && document.activeElement === terakhir) {
        e.preventDefault();
        pertama.focus();
      }
    };

    document.addEventListener("keydown", tekan);
    return () => document.removeEventListener("keydown", tekan);
  }, [berikutnya, onClose]);

  // Prasaat foto berikutnya/sesudah supaya perpindahan tidak terasa kosong.
  useEffect(() => {
    const sekitar = [
      photos[(index - 1 + photos.length) % photos.length],
      photos[(index + 1) % photos.length],
    ];
    for (const f of sekitar) {
      if (typeof window === "undefined") break;
      const img = new Image();
      img.src = f.srcMini;
    }
  }, [index, photos]);

  const foto = photos[index];
  if (!foto) return null;

  return (
    <div
      ref={kotak}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={`Foto ${index + 1} dari ${photos.length}`}
      onClick={onClose}
      onTouchStart={(e) => {
        sentuhMulai.current = e.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(e) => {
        const mulai = sentuhMulai.current;
        sentuhMulai.current = null;
        if (mulai === null) return;
        const jarak = (e.changedTouches[0]?.clientX ?? mulai) - mulai;
        if (Math.abs(jarak) > 40) berikutnya(jarak > 0 ? -1 : 1);
      }}
    >
      <button
        ref={tombolTutup}
        type="button"
        onClick={onClose}
        aria-label="Tutup galeri"
        className="absolute right-3 top-3 z-10 grid size-12 place-items-center rounded-full bg-white/15 text-white transition-colors hover:bg-white/30"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
      </button>

      <figure
        className="relative flex max-h-[88vh] max-w-[92vw] flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={foto.src}
          alt={foto.caption || `Foto kegiatan ${index + 1}`}
          width={foto.width}
          height={foto.height}
          className="max-h-[80vh] w-auto max-w-full object-contain"
        />

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => berikutnya(-1)}
              aria-label="Foto sebelumnya"
              className="absolute left-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => berikutnya(1)}
              aria-label="Foto berikutnya"
              className="absolute right-2 top-1/2 grid size-12 -translate-y-1/2 place-items-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </>
        )}

        {(foto.caption || photos.length > 1) && (
          <figcaption className="mt-3 flex w-full items-center justify-between gap-4 px-1 text-center text-sm text-white/90">
            <span className="text-left">{foto.caption}</span>
            {photos.length > 1 && (
              <span aria-live="polite" className="tabular-nums">
                {index + 1}/{photos.length}
              </span>
            )}
          </figcaption>
        )}
      </figure>
    </div>
  );
}