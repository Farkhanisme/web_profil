/**
 * Klien Telegram Bot API.
 *
 * Dua implementasi memakai satu antarmuka yang sama:
 *   - TelegramClient   : menyimpan gambar di grup privat (produksi)
 *   - LocalMediaClient : menyimpan berkas di .data/media (pengembangan)
 *
 * Pemilihannya otomatis berdasarkan isi TELEGRAM_BOT_TOKEN. Dengan begitu
 * seluruh route dan komponen bisa diuji tanpa kredensial apa pun, dan
 * produksi hanya perlu mengisi dua variabel lingkungan.
 */

export interface StoredFile {
  /** Terisi bila berkas tersimpan di Telegram */
  fileId: string | null;
  fileUniqueId: string | null;
  messageId: number | null;
  mime: string;
  width: number;
  height: number;
  bytes: number;
}

export interface MediaClient {
  /** true bila memakai penyimpanan sungguhan, false bila mode lokal */
  readonly isRemote: boolean;
  /** Simpan satu gambar dan kembalikan referensinya. */
  save(input: Buffer, mime: string): Promise<StoredFile>;
  /** Ambil isi berkas berdasarkan referensi. */
  load(ref: Pick<StoredFile, "fileId" | "messageId">): Promise<Buffer>;
  /** Kirim teks ke grup (notifikasi pesan kontak). */
  notify(text: string): Promise<void>;
}
