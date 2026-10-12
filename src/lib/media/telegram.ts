import "server-only";

import sharp from "sharp";
import type { MediaClient, StoredFile } from "./types";

/**
 * Penyimpanan gambar melalui grup Telegram privat.
 *
 * Satu gambar = satu pesan Telegram yang dikirim sebagai `document`
 * (bukan `photo`) supaya Telegram tidak mengompres ulang berkas WebP
 * yang sudah kita kompres di browser.
 *
 * Pembatas Telegram: sekitar 20 pesan per menit ke satu grup, dan unduhan
 * dibatasi 20 MB per berkas. Karena itu `kirimDokumen` menghormati
 * `retry_after` yang dikembalikan saat barrage 429.
 */

const API = "https://api.telegram.org";

interface BalasanTelegram {
  ok: boolean;
  result?: unknown;
  description?: string;
  error_code?: number;
  parameters?: { retry_after?: number };
}

export class TelegramMediaClient implements MediaClient {
  readonly isRemote = true;

  constructor(
    private readonly token: string,
    private readonly chatId: string,
  ) {}

  /** Panggil API Telegram dengan percobaan ulang untuk 429 dan galat jaringan. */
  private async panggil(
    metode: "POST" | "GET",
    jalur: string,
    body?: FormData,
  ): Promise<BalasanTelegram> {
    const maksPercobaan = 4;

    for (let percobaan = 1; percobaan <= maksPercobaan; percobaan += 1) {
      const url = `${API}/bot${this.token}${jalur}`;
      const res =
        metode === "POST"
          ? await fetch(url, { method: "POST", body })
          : await fetch(url, { method: "GET" });

      const data = (await res.json()) as BalasanTelegram;

      if (data.ok) return data;

      // 429: hormati retry_after dari Telegram, lalu coba lagi.
      if (data.error_code === 429) {
        const tunggu = (data.parameters?.retry_after ?? 2) * 1000;
        await new Promise((r) => setTimeout(r, Math.min(tunggu, 30_000)));
        continue;
      }

      // Galat jaringan / server: coba lagi dengan jedaincreasing.
      if (!res.ok && percobaan < maksPercobaan) {
        await new Promise((r) => setTimeout(r, 1000 * percobaan));
        continue;
      }

      throw new Error(
        `Telegram API gagal (${data.error_code ?? res.status}): ${data.description ?? "tidak diketahui"}`,
      );
    }

    throw new Error("Telegram API gagal setelah beberapa percobaan.");
  }

  async save(input: Buffer, mime: string): Promise<StoredFile> {
    const form = new FormData();
    // Nama berkas dummy: Telegram butuh nama, tapi isinya tetap utuh.
    form.append("chat_id", this.chatId);
    form.append("document", new Blob([new Uint8Array(input)], { type: mime }), `gambar.${ekstensi(mime)}`);

    const hasil = await this.panggil("POST", "/sendDocument", form);
    const pesan = hasil.result as
      | { message_id: number; document: { file_id: string; file_unique_id: string } }
      | undefined;

    if (!pesan?.document) {
      throw new Error("Telegram tidak mengembalikan dokumen.");
    }

    const meta = await sharp(input).metadata();

    return {
      fileId: pesan.document.file_id,
      fileUniqueId: pesan.document.file_unique_id,
      messageId: pesan.message_id,
      mime,
      width: meta.width ?? 0,
      height: meta.height ?? 0,
      bytes: input.byteLength,
    };
  }

  async load(ref: Pick<StoredFile, "fileId" | "messageId">): Promise<Buffer> {
    if (!ref.fileId) throw new Error("file_id tidak tersedia.");

    const hasil = await this.panggil("GET", "/getFile?file_id=" + encodeURIComponent(ref.fileId));
    const berkas = hasil.result as { file_path?: string } | undefined;

    if (!berkas?.file_path) throw new Error("Telegram tidak mengembalikan file_path.");

    const url = `${API}/file/bot${this.token}/${berkas.file_path}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Unduhan dari Telegram gagal: ${res.status}`);

    return Buffer.from(await res.arrayBuffer());
  }

  async notify(text: string): Promise<void> {
    const form = new FormData();
    form.append("chat_id", this.chatId);
    form.append("text", text);
    form.append("disable_web_page_preview", "true");
    await this.panggil("POST", "/sendMessage", form);
  }
}

function ekstensi(mime: string): string {
  switch (mime) {
    case "image/webp":
      return "webp";
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/svg+xml":
      return "svg";
    default:
      return "bin";
  }
}
