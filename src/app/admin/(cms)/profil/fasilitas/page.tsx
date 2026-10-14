import type { Metadata } from "next";
import { bacaProfil } from "@/lib/queries/profil";
import { KepalaHalaman } from "@/components/admin/ui";
import { TabProfil } from "@/components/admin/tab-profil";
import { FormDaftarProfil } from "@/components/admin/form-daftar-profil";
import { SimpanBanner } from "@/components/admin/simpan-banner";
import { simpanFasilitas } from "../../actions/profil";
import { terisi } from "@/lib/konten";

export const metadata: Metadata = { title: "Fasilitas" };

/** Sarana dan prasarana yang tampil di bagian Fasilitas pada halaman profil. */
export default async function HalamanFasilitas({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [profil, params] = await Promise.all([bacaProfil(), searchParams]);

  return (
    <>
      <KepalaHalaman
        judul="Fasilitas"
        deskripsi="Sarana dan prasarana yang bisa dilihat calon siswa saat kunjungan kelas."
      />

      <TabProfil aktif="/admin/profil/fasilitas" />
      <SimpanBanner tampil={params.saved === "1"} />

      <FormDaftarProfil
        action={simpanFasilitas}
        kolom={[
          { nama: "nama", label: "Nama fasilitas", placeholder: "Laboratorium komputer" },
          {
            nama: "keterangan",
            label: "Keterangan singkat",
            placeholder: "20 unit, dipakai untuk praktikum",
            area: true,
          },
        ]}
        awal={profil.fasilitas
          .filter((f) => terisi(f.name))
          .map((f) => [f.name, f.description])}
        tambahLabel="Tambah fasilitas"
        kosong="Belum ada fasilitas yang dicatat. Tekan tombol di bawah untuk menambah."
        labelSimpan="Simpan fasilitas"
      />
    </>
  );
}