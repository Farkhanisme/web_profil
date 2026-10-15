import "server-only";

import sharp from "sharp";
import {
  GalatMedia,
  klasifikasiGalat,
  type BalasanTelegram,
} from "./galat";
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

/** Tunggu `ms` milidetik. */
const jeda = (ms: number) => new Promise<void>((selesai) => setTimeout(selesai, ms));

export class TelegramMediaClient implements MediaClient {
  readonly isRemote = true;

  constructor(
    private readonly token: string,
    private readonly chatId: string,
  ) {}

  /**
   * Panggil API Telegram.
   *
   * Dicoba ulang hanya untuk hal yang bisa membaik dengan sendirinya:
   * batas laju (429), gangguan sementara (5xx), dan kegagalan jaringan.
   * Galat permanen — token dicabut (401), bot tanpa akses (403), id grup
   * salah (400) — langsung dilempar supaya pengelola tahu apa yang harus
   * diperbaiki, bukan menunggu tiga percobaan yang sia-sia.
   */
  private async panggil(
    metode: "POST" | "GET",
    jalur: string,
    body?: FormData,
  ): Promise<BalasanTelegram> {
    const maksPercobaan = 4;
    let galatAkhir: GalatMedia | null = null;

    for (let percobaan = 1; percobaan <= maksPercobaan; percobaan += 1) {
      const url = `${API}/bot${this.token}${jalur}`;
      const res = await this.ambilRespon(url, metode, body);

      // Permintaan gagal di sisi jaringan.
      if (res === null) {
        galatAkhir = new GalatMedia(
          "jaringan",
          `Telegram tidak terjangkau (percobaan ${percobaan}/${maksPercobaan}).`,
        );
        if (percobaan < maksPercobaan) await jeda(1000 * percobaan);
        continue;
      }

      const data = await this.bacaBalasan(res);

      // Balasan bukan JSON — mis. halaman HTML galat dari penyedia jaringan.
      if (data === null) {
        galatAkhir = new GalatMedia(
          "jaringan",
          `Balasan Telegram tidak terbaca (HTTP ${res.status}, percobaan ${percobaan}/${maksPercobaan}).`,
        );
        if (percobaan < maksPercobaan) await jeda(1000 * percobaan);
        continue;
      }

      if (data.ok) return data;

      // 429: hormati retry_after dari Telegram, lalu coba lagi.
      // Tidur hanya bila masih ada percobaan tersisa — menunggu
      // `retry_after` pada percobaan terakhir hanya memperlambat galat.
      if (data.error_code === 429) {
        const tunggu = (data.parameters?.retry_after ?? 2) * 1000;
        galatAkhir = klasifikasiGalat(data, res.status);
        if (percobaan < maksPercobaan) await jeda(Math.min(tunggu, 30_000));
        continue;
      }

      const galat = klasifikasiGalat(data, res.status);

      // 4xx selain 429 bersifat permanen: mencoba ulang hanya membuang waktu.
      if (res.status < 500) throw galat;

      galatAkhir = galat;
      if (percobaan < maksPercobaan) await jeda(1000 * percobaan);
    }

    throw galatAkhir ?? new GalatMedia("jaringan", "Telegram tidak terjangkau.");
  }

  /** Ambil respons. Mengembalikan `null` bila gagal di sisi jaringan. */
  private async ambilRespon(
    url: string,
    metode: "POST" | "GET",
    body?: FormData,
  ): Promise<Response | null> {
    try {
      return metode === "POST"
        ? await fetch(url, { method: "POST", body })
        : await fetch(url, { method: "GET" });
    } catch {
      return null;
    }
  }

  /** Baca balasan JSON. Mengembalikan `null` bila bukan JSON yang valid. */
  private async bacaBalasan(res: Response): Promise<BalasanTelegram | null> {
    try {
      return (await res.json()) as BalasanTelegram;
    } catch {
      return null;
    }
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
