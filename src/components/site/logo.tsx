import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Logo sekolah.
 *
 * Logo diambil dari pengaturan CMS. Bila admin belum mengunggah logo,
 * dipakai lambang cadangan berisi huruf awal nama madrasah agar situs
 * tidak pernah tampil tanpa identitas.
 *
 * Memakai <img> biasa: berkas sudah melewati proxy /media/[id] yang
 * melakukan resize dan cache, sehingga optimizer kedua tidak perlu.
 */
export function LogoSitus({
  mediaId,
  className,
  ukuran = 40,
  prioritas = false,
}: {
  mediaId: string | null;
  className?: string;
  /** Sisi gambar dalam piksel. */
  ukuran?: number;
  /** true untuk logo di hero: dimuat paling awal untuk LCP. */
  prioritas?: boolean;
}) {
  if (mediaId) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={`/media/${mediaId}?w=240`}
        alt={site.name}
        width={ukuran}
        height={ukuran}
        loading={prioritas ? "eager" : "lazy"}
        decoding={prioritas ? "sync" : "async"}
        fetchPriority={prioritas ? "high" : "auto"}
        className={cn("shrink-0 object-contain", className)}
        style={{ width: ukuran, height: ukuran }}
      />
    );
  }

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-xl bg-primary font-bold text-primary-foreground",
        className,
      )}
      style={{ width: ukuran, height: ukuran, fontSize: ukuran * 0.45 }}
      aria-hidden
    >
      M
    </span>
  );
}

/** Nama sekolah + slogan, dipakai di header dan footer. */
export function NamaSitus({
  className,
  tampilkanSlogan = false,
}: {
  className?: string;
  tampilkanSlogan?: boolean;
}) {
  return (
    <span className={cn("min-w-0", className)}>
      <span className="block truncate text-sm font-bold leading-tight sm:text-base">
        {site.name}
      </span>
      {tampilkanSlogan ? (
        <span className="block truncate text-[11px] font-normal leading-tight text-muted-foreground sm:text-xs">
          {site.tagline}
        </span>
      ) : null}
    </span>
  );
}