import { cn } from "@/lib/utils";

/**
 * Wadah lebar maksimum konten.
 *
 * Mobile first: lebar penuh dengan padding comfortable di layar kecil,
 * lalu melebar hingga batas yang enak dibaca di layar besar.
 */
export function Container({
  children,
  className,
  lebar = "default",
}: {
  children: React.ReactNode;
  className?: string;
  /** "default" untuk isi, "sempit" untuk teks panjang seperti artikel. */
  lebar?: "default" | "sempit";
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        lebar === "sempit" ? "max-w-3xl" : "max-w-6xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

/** Jarak antar bagian yang konsisten di seluruh halaman. */
export function Bagian({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <section className={cn("py-10 sm:py-14 lg:py-16", className)}>{children}</section>;
}