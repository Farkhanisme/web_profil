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
        deskripsi="Logo dan warna antarmuka CMS. Isi halaman publik diatur lewat modul masing-masing."
      />

      {params.saved === "1" ? (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-primary">
          Warna tersimpan dan dipakai sebagai warna utama antarmuka CMS
          serta warna bilah peramban. Halaman publik memakai palet Blok
          Warna yang tetap.
        </div>
      ) : null}
      {params.logo === "1" ? (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-primary">
          Logo tersimpan dan dipakai sebagai gambar pratinjau media sosial
          (Open Graph) untuk halaman yang tidak punya gambar sendiri.
        </div>
      ) : null}
      {params.reset === "1" ? (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-primary">
          Warna dikembalikan ke warna bawaan.
        </div>
      ) : null}

      <section className="mb-8">
        <h2 className="mb-3 text-lg font-semibold tracking-tight">
          Warna antarmuka CMS
        </h2>
        <p className="mb-4 max-w-2xl text-sm text-muted-foreground">
          Warna utama dipakai pada tombol, tautan, dan sorotan di dalam CMS,
          serta warna bilah peramban. Halaman publik memakai palet Blok
          Warna yang tetap: hijau untuk profil, jingga untuk program dan
          ekstrakurikuler, biru untuk guru dan galeri, kuning untuk
          pendaftaran. Mode gelap belum tersedia.
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