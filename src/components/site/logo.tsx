import Image from "next/image";
import { site } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Logo sekolah.
 *
 * Logo diambil dari pengaturan CMS. Bila admin belum mengunggah logo,
 * dipakai lambang cadangan berisi inisial nama madrasah agar situs
 * tidak pernah tampil tanpa identitas.
 */
export function LogoSitus({
  mediaId,
  width = 0,
  height = 0,
  className,
  ukuran = 40,
}: {
  mediaId: string | null;
  width?: number;
  height?: number;
  className?: string;
  /** Sisi gambar dalam piksel. */
  ukuran?: number;
}) {
  if (mediaId) {
    return (
      <Image
        src={`/media/${mediaId}?w=240`}
        alt={site.name}
        width={width || ukuran}
        height={height || ukuran}
        className={cn("shrink-0 object-contain", className)}
        style={{ width: ukuran, height: ukuran }}
        priority
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