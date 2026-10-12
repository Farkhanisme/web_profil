import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format tanggal dalam gaya Indonesia yang konsisten untuk seluruh situs.
 * Dipakai juga oleh llms.txt dan JSON-LD agar format tanggal seragam.
 */
const BULAN = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

/** Epoch detik -> "12 Oktober 2026" */
export function formatTanggal(epochSeconds: number): string {
  const d = new Date(epochSeconds * 1000);
  return `${d.getDate()} ${BULAN[d.getMonth()]} ${d.getFullYear()}`;
}

/** Epoch detik -> "2026-10-12" (format machine-readable) */
export function formatTanggalISO(epochSeconds: number): string {
  const d = new Date(epochSeconds * 1000);
  const bl = String(d.getMonth() + 1).padStart(2, "0");
  const hr = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${bl}-${hr}`;
}

/** 1234567 -> "1.234.567" (format angka Indonesia) */
export function formatAngka(n: number): string {
  return new Intl.NumberFormat("id-ID").format(n);
}
