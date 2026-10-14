import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { KepalaHalaman, KeadaanKosong, Panel } from "@/components/admin/ui";
import { TombolHapus } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Daftar program atau ekstrakurikuler.
 *
 * Satu komponen untuk dua modul karena keduanya identik dari sisi
 * tampilan: gambar, nama, ringkasan, urutan, dan aksi.
 */
export interface BarisDaftar {
  id: string;
  slug: string;
  name: string;
  summary: string;
  image: { id: string; alt: string } | null;
  /** Hanya untuk ekstrakurikuler. */
  schedule?: string;
  isPublished?: boolean;
}

export function DaftarKonten({
  judul,
  deskripsi,
  basePath,
  slugPrefix,
  baris,
  aksiHapus,
  pesanKosong,
  actionGeser,
}: {
  judul: string;
  deskripsi: string;
  basePath: string;
  slugPrefix: string;
  baris: BarisDaftar[];
  aksiHapus: (formData: FormData) => void | Promise<void>;
  pesanKosong: string;
  actionGeser: (formData: FormData) => void | Promise<void>;
}) {
  return (
    <>
      <KepalaHalaman judul={judul} deskripsi={deskripsi}>
        <Button asChild className="bg-primary hover:bg-primary-hover">
          <Link href={`${basePath}/baru`}>
            <Plus className="size-4" aria-hidden />
            Tambah
          </Link>
        </Button>
      </KepalaHalaman>

      <Panel>
        {baris.length === 0 ? (
          <KeadaanKosong
            judul={`Belum ada ${judul.toLowerCase()}`}
            pesan={pesanKosong}
            aksi={
              <Button asChild className="mt-1 bg-primary hover:bg-primary-hover">
                <Link href={`${basePath}/baru`}>
                  <Plus className="size-4" aria-hidden />
                  Tambah data pertama
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y">
            {baris.map((item, index) => (
              <li
                key={item.id}
                className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/40 sm:px-4"
              >
                <div className="flex shrink-0 flex-col gap-0.5">
                  <form action={actionGeser}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="arah" value="naik" />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-xs"
                      disabled={index === 0}
                      aria-label={`Naikkan urutan ${item.name}`}
                    >
                      <ArrowUp className="size-3.5" aria-hidden />
                    </Button>
                  </form>
                  <form action={actionGeser}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="arah" value="turun" />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-xs"
                      disabled={index === baris.length - 1}
                      aria-label={`Turunkan urutan ${item.name}`}
                    >
                      <ArrowDown className="size-3.5" aria-hidden />
                    </Button>
                  </form>
                </div>

                <div
                  className={cn(
                    "hidden size-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:block",
                    item.image ? "aspect-[4/3]" : "aspect-square",
                  )}
                >
                  {item.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/media/${item.image.id}?w=240`}
                      alt={item.image.alt || item.name}
                      width={56}
                      height={56}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`${basePath}/${item.id}`}
                      className="truncate font-medium hover:underline"
                    >
                      {item.name}
                    </Link>
                    <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
                      {index + 1}
                    </Badge>
                    {item.isPublished === false ? (
                      <Badge
                        variant="outline"
                        className="hidden shrink-0 border-brand-accent/40 text-brand-accent sm:inline-flex"
                      >
                        Draft
                      </Badge>
                    ) : null}
                  </div>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    /{slugPrefix}/{item.slug}
                  </p>
                  {item.summary ? (
                    <p className="truncate text-sm text-muted-foreground">
                      {item.summary}
                    </p>
                  ) : null}
                  {item.schedule ? (
                    <p className="truncate text-xs text-muted-foreground">
                      Jadwal: {item.schedule}
                    </p>
                  ) : null}
                </div>

                <TombolHapus
                  action={aksiHapus}
                  id={item.id}
                  deskripsi={`Data "${item.name}" akan dihapus dari daftar.`}
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </>
  );
}
