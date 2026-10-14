import type { Metadata } from "next";
import { BAWAAN } from "@/lib/color";
import { pengaturanSitus } from "@/lib/queries/settings";
import { KepalaHalaman } from "@/components/admin/ui";
import { FormTema, TombolResetTema } from "./tema-form";
import { FormLogo } from "./logo-form";

export const metadata: Metadata = { title: "Pengaturan" };

export default async function HalamanPengaturan({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const pengaturan = await pengaturanSitus();
  const params = await searchParams;

  return (
    <>
      <KepalaHalaman
        judul="Pengaturan"
        deskripsi="Perubahan tampil di seluruh halaman publik dalam hitungan detik, tanpa perlu deploy ulang."
      />

      {params.saved === "1" ? (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-primary">
          Warna tema tersimpan dan sudah berlaku di seluruh halaman publik.
        </div>
      ) : null}
      {params.logo === "1" ? (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-primary">
          Logo tersimpan dan sudah dipakai di header, footer, favicon, dan
          gambar tautan media sosial.
        </div>
      ) : null}
      {params.reset === "1" ? (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-primary">
          Warna dikembalikan ke warna bawaan.
        </div>
      ) : null}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Warna tema
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          Warna utama dipakai pada tombol, tautan, dan header. Warna aksen
          dipakai pada label dan sorotan. Mode gelap belum tersedia.
        </p>
        <FormTema
          awal={{ primary: pengaturan.themePrimary, accent: pengaturan.themeAccent }}
        />

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <TombolResetTema />
          <p className="text-xs text-muted-foreground">
            Warna bawaan: {BAWAAN.primary} dan {BAWAAN.accent}.
            {pengaturan.memakaiBawaan
              ? " Situs sedang memakai warna bawaan."
              : " Situs sedang memakai warna pilihan sendiri."}
          </p>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold tracking-tight">Logo</h2>
        <FormLogo awal={pengaturan.logo} />
      </section>
    </>
  );
}