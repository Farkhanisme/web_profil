/**
 * Kompresi gambar di sisi browser.
 *
 * Dilakukan sebelum unggah supaya:
 *   1. Satu berkas hasil kompresi jauh di bawah batas body 4,5 MB Vercel.
 *   2. Server hanya perlu memvalidasi, bukan memproses berat.
 *   3. Unggah dari jaringan seluler jauh lebih cepat.
 *
 * Hasil: WebP, sisi terpanjang maksimal 1600 px, target di bawah 1 MB.
 */

/** Batas ukuran berkas MASUK (foto HP modern bisa 5 sampai 12 MB). */
export const MAKS_BYTES_MASUK = 15 * 1024 * 1024;

/** Sisi terpanjang hasil kompresi. */
export const MAKS_SISI = 1600;

/** Target ukuran hasil kompresi. */
export const TARGET_BYTES = 1024 * 1024;

/** Kualitas diminish bertahap bila masih terlalu besar. */
const KUALITAS = [0.8, 0.7, 0.6];

export type HasilKompres = {
  file: File;
  width: number;
  height: number;
  /** Berapa kali kualitas diturunkan (0 = langsung memenuhi target) */
  iterasi: number;
  ukuranAsli: number;
  ukuranAkhir: number;
};

export class GalatGambar extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GalatGambar";
  }
}

/** Didukung browser secara wajar: JPEG, PNG, WebP, HEIC sudah jadi JPEG. */
const TIPE_DIIZINKAN = ["image/jpeg", "image/png", "image/webp", "image/avif"];

/** SVG lewat apa adanya, tidak dirasterisasi (dipakai untuk logo). */
function svgLewatApaAdanya(file: File): HasilKompres | null {
  if (file.type !== "image/svg+xml") return null;
  return {
    file,
    width: 0,
    height: 0,
    iterasi: 0,
    ukuranAsli: file.size,
    ukuranAkhir: file.size,
  };
}

/** Muat berkas gambar jadi HTMLImageElement (dengan createImageBitmap bila ada). */
async function muatGambar(file: File): Promise<
  { lebar: number; tinggi: number; sumber: CanvasImageSource; lepas: () => void }
> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        lebar: bitmap.width,
        tinggi: bitmap.height,
        sumber: bitmap,
        lepas: () => bitmap.close(),
      };
    } catch {
      // HEIC dan beberapa format lain gagal di createImageBitmap;
      // lanjut ke jalur <img> yang lebih toleran.
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new GalatGambar("Gambar tidak bisa dibaca."));
      el.src = url;
    });
    return {
      lebar: img.naturalWidth,
      tinggi: img.naturalHeight,
      sumber: img,
      lepas: () => URL.revokeObjectURL(url),
    };
  } catch (galat) {
    URL.revokeObjectURL(url);
    throw galat;
  }
}

function keCanvas(lebar: number, tinggi: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = lebar;
  canvas.height = tinggi;
  return canvas;
}

function keBlob(
  canvas: HTMLCanvasElement,
  kualitas: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), "image/webp", kualitas);
  });
}

function namaBaru(namaAsli: string): string {
  const tanpaExt = namaAsli.replace(/\.[^.]+$/, "");
  return `${tanpaExt || "gambar"}.webp`;
}

/**
 * Kompres satu berkas gambar.
 *
 * Strategi: perkecil dimensi bila perlu, lalu turunkan kualitas WebP
 * bertahap (0.8 -> 0.7 -> 0.6). Bila masih di atas target, dimensi
 * dikecilkan lagi dua kali. SELALU mengembalikan WebP valid.
 */
export async function kompresGambar(
  file: File,
  opsi: { maksSisi?: number; targetBytes?: number } = {},
): Promise<HasilKompres> {
  const maksSisi = opsi.maksSisi ?? MAKS_SISI;
  const target = opsi.targetBytes ?? TARGET_BYTES;

  if (file.size > MAKS_BYTES_MASUK) {
    const maksMb = Math.round(MAKS_BYTES_MASUK / (1024 * 1024));
    throw new GalatGambar(
      `Ukuran berkas ${(file.size / (1024 * 1024)).toFixed(1)} MB melebihi batas ${maksMb} MB.`,
    );
  }

  const svg = svgLewatApaAdanya(file);
  if (svg) return svg;

  if (file.type && !TIPE_DIIZINKAN.includes(file.type)) {
    throw new GalatGambar(
      `Format ${file.type || "tidak dikenal"} tidak didukung. Pakai JPG, PNG, atau WebP.`,
    );
  }

  const gambar = await muatGambar(file);

  try {
    if (!gambar.lebar || !gambar.tinggi) {
      throw new GalatGambar("Dimensi gambar tidak terbaca.");
    }

    // Skala awal: sisi terpanjang tidak melebihi maksSisi.
    let skala = Math.min(1, maksSisi / Math.max(gambar.lebar, gambar.tinggi));
    let iterasi = 0;

    // Dua kali pengurangan dimensi sebagai jaring pengaman bila
    // mutu 0.6 masih belum cukup.
    for (let putaran = 0; putaran <= 2; putaran += 1) {
      const lebar = Math.max(1, Math.round(gambar.lebar * skala));
      const tinggi = Math.max(1, Math.round(gambar.tinggi * skala));
      const canvas = keCanvas(lebar, tinggi);

      const ctx = canvas.getContext("2d");
      if (!ctx) throw new GalatGambar("Kanvas tidak tersedia di peramban ini.");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(gambar.sumber, 0, 0, lebar, tinggi);

      for (const kualitas of KUALITAS) {
        const blob = await keBlob(canvas, kualitas);
        if (!blob) continue;

        iterasi += 1;
        if (blob.size <= target || kualitas === KUALITAS[KUALITAS.length - 1]) {
          return {
            file: new File([blob], namaBaru(file.name), { type: "image/webp" }),
            width: lebar,
            height: tinggi,
            iterasi,
            ukuranAsli: file.size,
            ukuranAkhir: blob.size,
          };
        }
      }

      skala *= 0.75;
    }

    throw new GalatGambar("Gagal mengompres gambar.");
  } finally {
    gambar.lepas();
  }
}

/** Format ukuran untuk tampilan antrean unggah. */
export function ukuranRingkas(byte: number): string {
  if (byte < 1024) return `${byte} B`;
  if (byte < 1024 * 1024) return `${(byte / 1024).toFixed(0)} KB`;
  return `${(byte / (1024 * 1024)).toFixed(1)} MB`;
}
