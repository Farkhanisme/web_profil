import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";

/**
 * Banner "tersimpan" yang dipakai semua halaman modul profil.
 *
 * Disimpan sebagai komponen sendiri supaya wording-nya dijaga di satu
 * tempat: setelah simpan, isi CMS langsung tampil di halaman publik
 * tanpa perlu deploy ulang.
 */
export function SimpanBanner({ tampil }: { tampil: boolean }) {
  if (!tampil) return null;

  return (
    <Alert className="mb-5 border-primary/30 bg-primary-soft text-primary">
      <CheckCircle2 className="size-4" aria-hidden />
      <AlertDescription>
        Tersimpan. Perubahan langsung terlihat di halaman publik.
      </AlertDescription>
    </Alert>
  );
}