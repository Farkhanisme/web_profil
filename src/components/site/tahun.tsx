"use client";

import { useSyncExternalStore } from "react";

/** Tidak ada sumber peristiwa: nilainya dibaca sekali saat hidrasi. */
function tidakLangganan(): () => void {
  return () => {};
}

/**
 * Tahun berjalan untuk baris copyright.
 *
 * Halaman publik dibangun lebih dulu lalu dilayani dari cache, dan
 * Cache Components menolak `new Date()` saat proses itu, sehingga tahun
 * tidak boleh dihitung di server. Memakai `useSyncExternalStore`:
 * render di server dan saat hidrasi sama-sama kosong (tidak ada
 * ketidakcocokan), lalu React menggambar ulang dengan tahun sebenarnya
 * begitu peramban siap.
 *
 * Ruang ancho dikunci memakai `ch`, jadi angka yang muncul belakangan
 * tidak menggeser teks di sebelahnya.
 */
export function TahunBerjalan() {
  const tahun = useSyncExternalStore(
    tidakLangganan,
    () => new Date().getFullYear(),
    () => 0,
  );

  return (
    <time
      dateTime={tahun ? String(tahun) : undefined}
      className="inline-block w-[4ch] text-right tabular-nums"
    >
      {tahun || ""}
    </time>
  );
}