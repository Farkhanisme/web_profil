import type { Metadata } from "next";
import { bacaProfil } from "@/lib/queries/profil";
import { KepalaHalaman } from "@/components/admin/ui";
import { TabProfil } from "@/components/admin/tab-profil";
import { FormDaftarProfil } from "@/components/admin/form-daftar-profil";
import { SimpanBanner } from "@/components/admin/simpan-banner";
import { simpanFaq } from "../../actions/profil";
import { terisi } from "@/lib/konten";

export const metadata: Metadata = { title: "Pertanyaan Umum" };

/**
 * Pertanyaan yang sering diajukan calon orang tua.
 *
 * Daftar ini juga dipakai sebagai data terstruktur FAQPage, jadi
 * pertanyaan ditulis dalam bentuk pertanyaan sungguhan, bukan judul
 * bebas. Jawaban juga sebaiknya satu paragraf: pertanyaan orang tua
 * biasanya sudah selesai dijawab dalam satu-dua kalimat.
 */
export default async function HalamanFaq({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [profil, params] = await Promise.all([bacaProfil(), searchParams]);

  return (
    <>
      <KepalaHalaman
        judul="Pertanyaan Umum"
        deskripsi="Tampil di akhir halaman profil dan dibaca mesin pencari sebagai data FAQ."
      />

      <TabProfil aktif="/admin/profil/faq" />
      <SimpanBanner tampil={params.saved === "1"} />

      <FormDaftarProfil
        action={simpanFaq}
        kolom={[
          {
            nama: "pertanyaan",
            label: "Pertanyaan",
            placeholder: "Apakah kelas berapa saja yang tersedia?",
            area: true,
          },
          {
            nama: "jawaban",
            label: "Jawaban",
            placeholder: "Kelas VII sampai IX, dengan tiga angkatan.",
            area: true,
          },
        ]}
        awal={profil.faq
          .filter((f) => terisi(f.question))
          .map((f) => [f.question, f.answer])}
        tambahLabel="Tambah pertanyaan"
        kosong="Belum ada pertanyaan. Tekan tombol di bawah untuk menambah."
        labelSimpan="Simpan pertanyaan"
      />
    </>
  );
}