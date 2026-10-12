import { Container } from "@/components/site/container";
import { cn } from "@/lib/utils";

/**
 * Kepala halaman dalam.
 *
 * Setiap halaman punya pola yang sama: remah roti, satu `h1`, kalimat
 * pembuka yang menjawab pertanyaan utama, lalu isi halaman.
 */
export function PageHeader({
  eyebrow,
  judul,
  deskripsi,
  children,
  className,
  /** Lebar teks pembuka. */
  sempit = false,
}: {
  eyebrow?: string;
  judul: string;
  deskripsi?: string;
  children?: React.ReactNode;
  className?: string;
  sempit?: boolean;
}) {
  return (
    <div className={cn("border-b bg-muted/30", className)}>
      <Container lebar={sempit ? "sempit" : "default"}>
        <div className="py-8 sm:py-10">
          {eyebrow ? (
            <p className="mb-2 text-sm font-medium text-primary">{eyebrow}</p>
          ) : null}

          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            {judul}
          </h1>

          {deskripsi ? (
            <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {deskripsi}
            </p>
          ) : null}

          {children ? <div className="mt-6">{children}</div> : null}
        </div>
      </Container>
    </div>
  );
}

/** Judul bagian di dalam halaman (bukan `h1`). */
export function JudulBagian({
  judul,
  deskripsi,
  aksi,
  className,
}: {
  judul: string;
  deskripsi?: string;
  aksi?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-5 flex flex-wrap items-end justify-between gap-3", className)}>
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{judul}</h2>
        {deskripsi ? (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {deskripsi}
          </p>
        ) : null}
      </div>
      {aksi ? <div className="shrink-0">{aksi}</div> : null}
    </div>
  );
}