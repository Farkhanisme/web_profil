import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { query } from "@/lib/db";
import type { MediaRow } from "@/lib/db/types";
import { BAWAAN, hitungTema, normalisasiHex, type VariabelTema } from "@/lib/color";
import { TAG } from "./cache-tags";

/**
 * Pembacaan pengaturan situs.
 *
 * Nilai diambil dari tabel `settings` (diisi lewat CMS) dan sudah
 * di-cache dengan tag, sehingga root layout membacanya sekali lalu
 * menuliskan variabel CSS ke dalam halaman.
 */

export interface PengaturanSitus {
  themePrimary: string;
  themeAccent: string;
  /** Warna ketiga untuk blok warna penuh. */
  themeAlt: string;
  logoMediaId: string | null;
  logo: MediaDTO | null;
  /** true bila nilai masih sama dengan warna bawaan */
  memakaiBawaan: boolean;
}

export interface MediaDTO {
  id: string;
  width: number;
  height: number;
  alt: string;
  mime: string;
}

export async function pengaturanSitus(): Promise<PengaturanSitus> {
  "use cache";
  cacheTag(TAG.settings);
  cacheLife("max");

  const baris = await query<{ key: string; value: string }>(
    "SELECT key, value FROM settings",
  );

  const peta: Record<string, string> = {};
  for (const b of baris) peta[b.key] = b.value;

  const primary = normalisasiHex(peta.theme_primary ?? BAWAAN.primary);
  const accent = normalisasiHex(peta.theme_accent ?? BAWAAN.accent);
  // Instalasi lama belum punya kunci theme_alt; bawaan sudah cukup aman.
  const alt = normalisasiHex(peta.theme_alt ?? BAWAAN.alt);
  const logoId = peta.logo_media_id?.trim() || null;

  let logo: MediaDTO | null = null;
  if (logoId) {
    const media = await query<MediaRow>(
      "SELECT id, mime, width, height, alt FROM media WHERE id = ?",
      [logoId],
    );
    if (media.length > 0) {
      logo = {
        id: media[0]!.id,
        mime: media[0]!.mime,
        width: media[0]!.width,
        height: media[0]!.height,
        alt: media[0]!.alt,
      };
    }
  }

  return {
    themePrimary: primary,
    themeAccent: accent,
    themeAlt: alt,
    logoMediaId: logoId,
    logo,
    memakaiBawaan:
      primary === BAWAAN.primary &&
      accent === BAWAAN.accent &&
      alt === BAWAAN.alt &&
      !logoId,
  };
}

/** Seluruh turunan warna, siap dipakai untuk CSS variable. */
export async function tema(): Promise<VariabelTema> {
  const pengaturan = await pengaturanSitus();
  return hitungTema(
    pengaturan.themePrimary,
    pengaturan.themeAccent,
    pengaturan.themeAlt,
  );
}