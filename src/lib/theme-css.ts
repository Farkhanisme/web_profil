import type { VariabelTema } from "@/lib/color";

/**
 * Pembentuk blok CSS untuk warna tema.
 *
 * Layout root menyisipkan blok ini ke dalam `<head>`. Karena ditulis
 * server sebelum halaman dilukis, tidak ada kedipan warna: elemen
 * pertama yang digambar sudah memakai warna akhir.
 */
export function blokCssTema(t: VariabelTema): string {
  return [
    ":root{",
    `--brand:${t.primary};`,
    `--brand-hover:${t.primaryHover};`,
    `--brand-soft:${t.primarySoft};`,
    `--on-brand:${t.onPrimary};`,
    `--brand-accent:${t.accent};`,
    `--brand-accent-soft:${t.accentSoft};`,
    `--on-brand-accent:${t.onAccent};`,
    "}",
  ].join("");
}

/**
 * Meta `theme-color` untuk bilah peramban di perangkat seluler
 * mengikuti warna utama.
 */
export function warnaMetaPeramban(t: VariabelTema): string {
  return t.primary;
}