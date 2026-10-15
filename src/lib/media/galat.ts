/**
 * Galat penyimpanan media yang sudah dipetakan ke kode mesin.
 *
 * Unggahan gambar bisa gagal karena alasan yang sangat berbeda: token bot
 * salah, bot tidak punya akses, id grup salah, kena batas laju, atau
 * Telegram sedang down. Tanpa pemetaan ini, semuanya terbungkus satu pesan
 * "Gagal menyimpan gambar" dan pengelola harus membaca log server hanya
 * untuk mengetahui apa yang harus diperbaiki.
 *
 * Route `POST /api/admin/media` memakai `kode` di sini untuk memilih pesan
 * yang langsung menunjuk penyebabnya.
 */

export type KodeGalatMedia =
  /** `TELEGRAM_BOT_TOKEN` tidak sah / sudah dicabut (401) */
  | "token"
  /** bot ditolak grup atau tidak punya izin kirim (403) */
  | "akses"
  /** `TELEGRAM_CHAT_ID` tidak ditemukan atau bot bukan anggotanya (400) */
  | "grup"
  /** kena batas laju Telegram (429), sudah dicoba ulang */
  | "laju"
  /** sisi Telegram bermasalah (5xx) */
  | "server"
  /** Telegram tidak terjangkau dari server (jaringan / balasan tidak terbaca) */
  | "jaringan"
  /** penyimpanan lokal gagal menulis ke disk */
  | "penyimpanan"
  /** galat lain yang belum terpetakan */
  | "tak-dikenal";

/** Galat media yang membawa kode agar pemanggil bisa memilih pesan. */
export class GalatMedia extends Error {
  readonly kode: KodeGalatMedia;

  constructor(kode: KodeGalatMedia, pesan: string) {
    super(pesan);
    this.name = "GalatMedia";
    this.kode = kode;
  }
}

/** Balasan JSON dari Bot API Telegram. */
export interface BalasanTelegram {
  ok: boolean;
  result?: unknown;
  description?: string;
  error_code?: number;
  parameters?: { retry_after?: number };
}

/**
 * Petakan balasan gagal Telegram ke kode galat media.
 *
 * Urutan pemeriksaan penting: penyebab yang paling spesifik dulu, karena
 * satu `error_code` bisa dipakai Telegram untuk beberapa situasi
 * berbeda (mis. 400 untuk "chat not found" maupun "chat_id is empty").
 */
export function klasifikasiGalat(
  data: BalasanTelegram,
  statusHttp: number,
): GalatMedia {
  const kode = data.error_code ?? statusHttp;
  const deskripsi = (data.description ?? "").toLowerCase();
  const detail = `${kode}: ${data.description ?? "tidak diketahui"}`;

  // Token dicabut, salah tempat, atau mengandung spasi/kutip.
  if (kode === 401 || deskripsi.includes("unauthorized")) {
    return new GalatMedia("token", `Token bot ditolak Telegram (${detail})`);
  }

  // Grup tidak ada / id salah / bot sudah dikeluarkan.
  if (
    deskripsi.includes("chat not found") ||
    deskripsi.includes("chat_id") ||
    deskripsi.includes("group is deactivated")
  ) {
    return new GalatMedia("grup", `Grup tidak terjangkau (${detail})`);
  }

  // Bot anggota biasa di grup yang melarang, atau bukan anggota.
  if (
    kode === 403 ||
    deskripsi.includes("not a member") ||
    deskripsi.includes("not enough rights") ||
    deskripsi.includes("kicked")
  ) {
    return new GalatMedia("akses", `Bot tidak punya akses (${detail})`);
  }

  if (kode === 429) {
    return new GalatMedia("laju", `Batas laju Telegram (${detail})`);
  }

  if (kode >= 500 || statusHttp >= 500) {
    return new GalatMedia("server", `Telegram bermasalah (${detail})`);
  }

  return new GalatMedia("tak-dikenal", `Telegram API gagal (${detail})`);
}
