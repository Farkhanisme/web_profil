import "server-only";

import type { MediaClient } from "./types";
import { LocalMediaClient } from "./local";
import { TelegramMediaClient } from "./telegram";

/**
 * Pemilihan klien media.
 *
 * Selama `TELEGRAM_BOT_TOKEN` kosong (pengembangan), situs memakai
 * penyimpanan lokal.inggal mengisi `TELEGRAM_BOT_TOKEN` dan
 * `TELEGRAM_CHAT_ID` di produksi tanpa mengubah route maupun komponen.
 */

let cached: MediaClient | null = null;

export function mediaClient(): MediaClient {
  if (cached) return cached;

  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  cached =
    token && chatId
      ? new TelegramMediaClient(token, chatId)
      : new LocalMediaClient();

  return cached;
}

/** Lebar yang boleh dipakai pada route `/media/[id]`. */
export const LEBAR_DIIZINKAN = [240, 480, 800, 1600] as const;
export type Lebar = (typeof LEBAR_DIIZINKAN)[number];

export function parseLebar(value: string | null): Lebar | null {
  if (!value) return null;
  const n = Number(value);
  return (LEBAR_DIIZINKAN as readonly number[]).includes(n) ? (n as Lebar) : null;
}
