import type { Metadata } from "next";
import { bacaProfil } from "@/lib/queries/profil";
import { KepalaHalaman } from "@/components/admin/ui";
import { TabProfil } from "@/components/admin/tab-profil";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { FormProfilTeks } from "./profil-form";

export const metadata: Metadata = { title: "Profil Madrasah" };

/**
 * Teks halaman profil: ringkasan, sejarah, visi, misi, dan sambutan.
 *
 * Modul ini sengaja dipisah per bagian, bukan satu formulir panjang,
 * supaya pengelola bisa mengisi satu bagian tanpa harus melewati bagian
 * lain yang belum siap.
 */
export default async function HalamanProfilTeks({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [profil, params] = await Promise.all([bacaProfil(), searchParams]);

  return (
    <>
      <KepalaHalaman
        judul="Profil Madrasah"
        deskripsi="Teks yang tampil pada halaman /profil dan bagian sambutan di beranda."
      />

      <TabProfil aktif="/admin/profil" />

      {params.saved === "1" ? (
        <Alert className="mb-5 border-primary/30 bg-primary-soft text-primary">
          <CheckCircle2 className="size-4" aria-hidden />
          <AlertDescription>
            Teks profil tersimpan dan langsung tampil di halaman publik.
          </AlertDescription>
        </Alert>
      ) : null}

      <FormProfilTeks profil={profil} />
    </>
  );
}