"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Pemulihan gulir ke atas.
 *
 * Pada navigasi klien, peramban dapat mempertahankan posisi gulir lama
 * (sehingga halaman baru terasa terbuka dekat bagian bawah). Efek ini
 * memastikan setiap perubahan jalur kembali ke atas, dengan perilaku
 * instan agar pengguna tidak keliru melihat animasi gulir.
 */
export function ResetGulir() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [pathname]);

  return null;
}