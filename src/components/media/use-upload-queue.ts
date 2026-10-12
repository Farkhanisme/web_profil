"use client";

import { useCallback, useRef, useState } from "react";
import {
  GalatGambar,
  kompresGambar,
  ukuranRingkas,
} from "@/lib/image-compress";

/**
 * Antrean unggah berurutan.
 *
 * Telegram membatasi sekitar 20 pesan per menit ke satu grup, jadi berkas
 * dikirim satu per satu, bukan paralel. `retry_after` saat barrage 429
 * ditangani di sisi server (TelegramMediaClient).
 *
 * Kegagalan satu berkas TIDAK membatalkan berkas lain di antrean.
 */

export type StatusAntrean =
  | "menunggu"
  | "mengompresi"
  | "mengunggah"
  | "selesai"
  | "gagal";

export interface ItemAntrean {
  id: string;
  nama: string;
  status: StatusAntrean;
  /** 0 sampai 100 */
  progres: number;
  ukuranAsli: number;
  ukuranAkhir: number;
  /** id media dari tabel media, tersedia setelah unggah berhasil */
  mediaId?: string;
  /** pratinjau lokal sebelum selesai diunggah */
  pratinjau?: string;
  galat?: string;
}

export interface HasilUnggah {
  mediaId: string;
  nama: string;
}

/** Batas berkas per satu sesi unggah (sesuai batasan Telegram). */
export const MAKS_PER_SESI = 20;

/** Unggah satu berkas ke route admin media, dengan progres nyata. */
function unggahBerkas(
  file: File,
  alt: string,
  onProgres: (persen: number) => void,
): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("alt", alt);

    // XHR dipakai (bukan fetch) karena fetch tidak memberi progres unggah.
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) onProgres(Math.round((e.loaded / e.total) * 100));
    });

    xhr.addEventListener("load", () => {
      let data: { id?: string; error?: string } = {};
      try {
        data = JSON.parse(xhr.responseText) as typeof data;
      } catch {
        reject(new Error("Balasan server tidak dikenali."));
        return;
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.id) {
        resolve(data.id);
      } else {
        reject(new Error(data.error ?? `Gagal mengunggah (${xhr.status}).`));
      }
    });

    xhr.addEventListener("error", () =>
      reject(new Error("Jaringan bermasalah saat mengunggah.")),
    );
    xhr.addEventListener("abort", () =>
      reject(new Error("Unggah dibatalkan.")),
    );

    xhr.send(form);
  });
}

export function useUploadQueue() {
  const [items, setItems] = useState<ItemAntrean[]>([]);
  const sedangJalan = useRef(false);
  const penanda = useRef(0);

  const perbarui = useCallback(
    (id: string, perubahan: Partial<ItemAntrean>) => {
      setItems((lama) =>
        lama.map((item) => (item.id === id ? { ...item, ...perubahan } : item)),
      );
    },
    [],
  );

  /**
   * Jalankan antrean satu per satu sampai habis.
   *
   * `selesaiSatu` dipanggil setelah setiap berkas sukses terunggah, bukan
   * hanya di akhir. Ini yang membuat satu berkas bisa langsung disimpan ke
   * database tanpa menunggu berkas lain selesai.
   */
  const jalankan = useCallback(
    async (
      daftar: Array<{ id: string; file: File }>,
      selesaiSatu?: (hasil: { mediaId: string; nama: string }) => void | Promise<void>,
    ) => {
      if (sedangJalan.current) return;
      sedangJalan.current = true;

      try {
        for (const { id, file } of daftar) {
          try {
            perbarui(id, { status: "mengompresi", progres: 5 });

            const hasil = await kompresGambar(file);
            perbarui(id, {
              status: "mengunggah",
              progres: 15,
              ukuranAkhir: hasil.ukuranAkhir,
            });

            const mediaId = await unggahBerkas(
              hasil.file,
              file.name.replace(/\.[^.]+$/, ""),
              (persen) => perbarui(id, { progres: 15 + Math.round(persen * 0.85) }),
            );

            perbarui(id, { status: "selesai", progres: 100, mediaId });

            // Simpan ke database sebelum lanjut ke berkas berikutnya.
            // Bila pemanggil gagal menyimpan, berkas ini tetap tercatat
            // sebagai gagal tanpa menghentikan berkas lain.
            if (selesaiSatu) {
              try {
                await selesaiSatu({ mediaId, nama: file.name });
              } catch (galatSimpan) {
                perbarui(id, {
                  galat:
                    galatSimpan instanceof Error
                      ? `Foto terunggah tetapi gagal disimpan: ${galatSimpan.message}`
                      : "Foto terunggah tetapi gagal disimpan.",
                });
              }
            }
          } catch (galat) {
            perbarui(id, {
              status: "gagal",
              progres: 0,
              galat:
                galat instanceof GalatGambar || galat instanceof Error
                  ? galat.message
                  : "Gagal mengunggah.",
            });
          }
        }
      } finally {
        sedangJalan.current = false;
      }
    },
    [perbarui],
  );

  /** Tambahkan berkas baru ke antrean lalu langsung jalankan. */
  const tambah = useCallback(
    async (
      files: File[],
      selesaiSatu?: (hasil: { mediaId: string; nama: string }) => void | Promise<void>,
    ) => {
      const sisa = MAKS_PER_SESI - items.length;
      if (sisa <= 0) {
        return {
          ditolak: files.length,
          pesan: `Maksimal ${MAKS_PER_SESI} foto per satu sesi unggah.`,
        };
      }

      const diterima = files.slice(0, sisa);

      const baru = diterima.map<ItemAntrean>((file) => {
        penanda.current += 1;
        return {
          id: `antrean-${penanda.current}`,
          nama: file.name,
          status: "menunggu",
          progres: 0,
          ukuranAsli: file.size,
          ukuranAkhir: 0,
          pratinjau: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
        };
      });

      setItems((lama) => [...lama, ...baru]);

      await jalankan(
        baru.map((item, i) => ({ id: item.id, file: diterima[i]! })),
        selesaiSatu,
      );

      return {
        ditolak: files.length - diterima.length,
        pesan:
          files.length - diterima.length > 0
            ? `${files.length - diterima.length} berkas diabaikan karena batas ${MAKS_PER_SESI} per sesi.`
            : "",
      };
    },
    [items.length, jalankan],
  );

  const hapusItem = useCallback((id: string) => {
    setItems((lama) => {
      const item = lama.find((x) => x.id === id);
      if (item?.pratinjau) URL.revokeObjectURL(item.pratinjau);
      return lama.filter((x) => x.id !== id);
    });
  }, []);

  const bersihkanSelesai = useCallback(() => {
    setItems((lama) =>
      lama.filter((x) => {
        if (x.status === "selesai" || x.status === "gagal") {
          if (x.pratinjau) URL.revokeObjectURL(x.pratinjau);
          return false;
        }
        return true;
      }),
    );
  }, []);

  const kosongkan = useCallback(() => {
    setItems((lama) => {
      for (const x of lama) {
        if (x.pratinjau) URL.revokeObjectURL(x.pratinjau);
      }
      return [];
    });
  }, []);

  return {
    items,
    tambah,
    hapusItem,
    bersihkanSelesai,
    kosongkan,
    adaProses: items.some(
      (x) => x.status === "menunggu" || x.status === "mengompresi" || x.status === "mengunggah",
    ),
    formatUkuran: ukuranRingkas,
  };
}
