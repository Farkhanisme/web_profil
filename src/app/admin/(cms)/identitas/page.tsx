import type { Metadata } from "next";
import { bacaSitus } from "@/lib/queries/profil";
import { KepalaHalaman } from "@/components/admin/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { FormIdentitas } from "./identitas-form";

export const metadata: Metadata = { title: "Identitas Madrasah" };

/**
 * Identitas Madrasah: nama, data resmi, alamat, peta, dan kontak.
 *
 * Semua field kosong berarti "pengelola belum mengisi" — halaman publik
 * menyembunyikan bagian yang kosong, bukan menampilkan teks draf. Jadi
 * modul ini boleh disimpan berkala tanpauttafsirkan halaman.
 */
export default async function HalamanIdentitas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [situs, params] = await Promise.all([bacaSitus(), searchParams]);

  return (
    <>
      <KepalaHalaman
        judul="Identitas Madrasah"
        deskripsi="Nama, data resmi, alamat, titik peta, dan kontak. Dipakai di seluruh halaman publik."
      />

      {params.saved === "1" ? (
        <Alert className="mb-5 border-primary/30 bg-primary-soft text-primary">
          <CheckCircle2 className="size-4" aria-hidden />
          <AlertDescription>
            Identitas tersimpan. Halaman publik ikut berubah tanpa perlu
            deploy ulang.
          </AlertDescription>
        </Alert>
      ) : null}

      <FormIdentitas situs={situs} />
    </>
  );
}