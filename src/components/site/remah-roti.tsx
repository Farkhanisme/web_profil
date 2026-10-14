import Link from "next/link";
import { ChevronRight } from "lucide-react";

/**
 * Remah roti (breadcrumb).
 *
 * Dua alasan ia ada di halaman detail, bukan cuma demi mesin pencari:
 *   1. Orang tua yang membuka tautan program dari pesan WhatsApp tidak
 *      tahu sedang berada di halaman mana. Remah roti memberi orientasi
 *      tanpa harus memakai tombol "kembali" peramban yang tidak selalu
 *      ada di ponsel.
 *   2. Jalur halaman jadi tertaut di dalam halaman, sehingga halaman
 *      daftar program dan galeri tidak lagi yatim: tidak ada tautan
 *      masuk dari mana pun ke halaman-halaman tersebut.
 */
export function RemahRoti({
  items,
}: {
  /** Terakhir = halaman sekarang (tidak ditautkan). */
  items: { label: string; href?: string }[];
}) {
  if (items.length < 2) return null;

  return (
    <nav aria-label="Remah roti" className="text-sm">
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const terakhir = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {item.href && !terakhir ? (
                <Link
                  href={item.href}
                  className="rounded px-1 text-white/80 underline-offset-4 hover:text-white hover:underline"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={terakhir ? "page" : undefined}
                  className="rounded px-1 font-semibold text-white"
                >
                  {item.label}
                </span>
              )}
              {!terakhir && (
                <ChevronRight className="size-4 text-white/50" aria-hidden />
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}