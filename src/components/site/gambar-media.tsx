import { cn } from "@/lib/utils";

/**
 * Gambar dari proxy media.
 *
 * Memakai <img> biasa, bukan next/image: gambar sudah melalui proxy
 * `/media/[id]` yang melakukan resize dan_cache CDN, sehingga optimizer
 * kedua hanya menambah ongkos tanpa hasil.
 *
 * Width dan height selalu ditulis agar pergeseran tata letak (CLS)
 * tetap nol. Alt selalu diisi agar bisa dibaca pembaca layar.
 */
export function GambarMedia({
  id,
  alt,
  width,
  height,
  lebar = 480,
  className,
  prioritas = false,
  sizes,
  memuatLambat = true,
}: {
  id: string;
  alt: string;
  width: number;
  height: number;
  /** Lebar thumbnail yang diminta ke proxy: 240, 480, 800, atau 1600. */
  lebar?: 240 | 480 | 800 | 1600;
  className?: string;
  /** true untuk gambar hero: dimuat lebih dulu oleh peramban. */
  prioritas?: boolean;
  sizes?: string;
  memuatLambat?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/media/${id}?w=${lebar}`}
      alt={alt}
      width={width}
      height={height}
      loading={memuatLambat ? "lazy" : "eager"}
      decoding={prioritas ? "sync" : "async"}
      fetchPriority={prioritas ? "high" : "auto"}
      sizes={sizes}
      className={cn("object-cover", className)}
    />
  );
}

/** Hitung rasio aspek sebagai nilai CSS (dipakai untuk placeholder). */
export function rasio(width: number, height: number): number {
  if (!width || !height) return 4 / 3;
  return width / height;
}