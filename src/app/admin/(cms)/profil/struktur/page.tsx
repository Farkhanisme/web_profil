import type { Metadata } from "next";
import { bacaProfil } from "@/lib/queries/profil";
import { KepalaHalaman } from "@/components/admin/ui";
import { TabProfil } from "@/components/admin/tab-profil";
import { FormDaftarProfil } from "@/components/admin/form-daftar-profil";
import { SimpanBanner } from "@/components/admin/simpan-banner";
import { simpanStruktur } from "../../actions/profil";
import { terisi } from "@/lib/konten";

export const metadata: Metadata = { title: "Struktur Organisasi" };

/**
 * Struktur organisasi madrasah.
 *
 * Baris yang nama dan jabatannya sama-sama kosong diabaikan, jadi
 * pengelola boleh menyisakan baris kosong tanpa perlu menghapusnya
 * terlebih dahulu.
 */
export default async function HalamanStruktur({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [profil, params] = await Promise.all([bacaProfil(), searchParams]);

  return (
    <>
      <KepalaHalaman
        judul="Struktur Organisasi"
        deskripsi="Nama dan jabatan yang tampil di bagian Struktur pada halaman profil."
      />

      <TabProfil aktif="/admin/profil/struktur" />
      <SimpanBanner tampil={params.saved === "1"} />

      <FormDaftarProfil
        action={simpanStruktur}
        kolom={[
          { nama: "nama", label: "Nama", placeholder: "Nama dan gelar" },
          {
            nama: "posisi",
            label: "Jabatan",
            placeholder: "Kepala Madrasah",
          },
        ]}
        awal={profil.struktur
          .filter((s) => terisi(s.name))
          .map((s) => [s.name, s.position])}
        tambahLabel="Tambah orang"
        kosong="Belum ada nama yang mengisi. Tekan tombol di bawah untuk menambah."
        labelSimpan="Simpan struktur"
      />
    </>
  );
}