import "server-only";

import { GalatMedia } from "./galat";
import type { DimensiGambar, MediaClient, StoredFile } from "./types";

/**
 * Penyimpanan lokal untuk pengembangan.
 *
 * Berkas ditulis ke `.data/media/<id>.bin` (nama berkas tidak membocorkan
 * tipe berkas). Dipakai otomatis selama `TELEGRAM_BOT_TOKEN` kosong,
 * sehingga seluruh alur unggah dan proxy bisa diuji tanpa akun Telegram.
 */

const DIR = ".data/media";

async function simpanKeDisk(id: string, data: Buffer): Promise<void> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  await mkdir(join(process.cwd(), DIR), { recursive: true });
  await writeFile(join(process.cwd(), DIR, `${id}.bin`), data);
}

async function bacaDariDisk(id: string): Promise<Buffer> {
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  return readFile(join(process.cwd(), DIR, `${id}.bin`));
}

export class LocalMediaClient implements MediaClient {
  readonly isRemote = false;

  async save(
    input: Buffer,
    mime: string,
    dimensi: DimensiGambar,
  ): Promise<StoredFile> {
    const { newId } = await import("@/lib/ids");
    const id = newId();

    // Bila disk penuh atau direktori tidak bisa dibuat, katakan apa
    // yang sebenarnya terjadi supaya tidak terlihat seperti galat Telegram.
    try {
      await simpanKeDisk(id, input);
    } catch (error) {
      throw new GalatMedia(
        "penyimpanan",
        `Server tidak dapat menulis berkas ke .data/media: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }

    return {
      // Pada mode lokal, kolom file_id dipakai untuk menyimpan nama berkas
      // di disk. Dengan begitu `load()` tidak perlu cabang terpisah.
      fileId: id,
      fileUniqueId: id,
      messageId: null,
      mime,
      width: dimensi.width,
      height: dimensi.height,
      bytes: input.byteLength,
    };
  }

  async load(ref: Pick<StoredFile, "fileId" | "messageId">): Promise<Buffer> {
    // Pada mode lokal, kolom fileId sebenarnya dipakai untuk menyimpan
    // id berkas di disk, sehingga load() tidak perlu cabang terpisah.
    if (!ref.fileId) throw new Error("Rujukan berkas lokal tidak lengkap.");
    return bacaDariDisk(ref.fileId);
  }

  async notify(text: string): Promise<void> {
    console.log("[media lokal] notifikasi:", text.slice(0, 200));
  }
}
