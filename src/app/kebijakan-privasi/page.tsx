import type { Metadata } from "next";
import { bacaSitus } from "@/lib/queries/profil";
import { terisi } from "@/lib/konten";
import { metadataDasar } from "@/lib/seo";
import { tahunSekarang } from "@/lib/tahun";
import { Kontainer } from "@/components/site/dasar";
import { Kerangka } from "@/components/site/kerangka";
import Link from "next/link";

export async function generateMetadata(): Promise<Metadata> {
  return metadataDasar(
    "Kebijakan Privasi",
    "Penjelasan singkat data yang dikumpulkan formulir kontak MTs Ma'arif Tieng dan cara pengelolaannya.",
    "/kebijakan-privasi",
  );
}

export default async function HalamanKebijakanPrivasi() {
  const [situs, tahun] = await Promise.all([bacaSitus(), tahunSekarang()]);

  return (
    <Kerangka situs={situs}>
      <section className="bg-biru text-white">
        <Kontainer>
          <div className="py-12 sm:py-16">
            <div className="h-1.5 w-14 rounded-full bg-biru-terang" aria-hidden />
            <p className="label-bagian mt-4 text-biru-terang">Kebijakan Privasi</p>
            <h1 className="mt-3 max-w-3xl text-display">Kebijakan Privasi</h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/90">
              Penjelasan singkat mengenai data yang dikumpulkan formulir kontak
              dan cara pengelolaannya.
            </p>
          </div>
        </Kontainer>
      </section>
      <section className="bg-putih">
        <Kontainer>
          <div className="max-w-3xl space-y-6 py-14 text-tinta-2 lg:py-20">
            <p>Kebijakan ini menjelaskan data yang kami kumpulkan melalui formulir kontak di {situs.name}.</p>
            <h2 className="font-judul text-title text-biru-tua">Data yang kami kumpulkan</h2>
            <p>Kami hanya mengumpulkan data yang Anda kirimkan secara sukarela: nama, nomor telepon atau alamat email, dan isi pesan.</p>
            <h2 className="font-judul text-title text-biru-tua">Tujuan penggunaan</h2>
            <p>Data digunakan semata-mata untuk membalas pertanyaan dan menindaklanjuti komunikasi dengan Anda.</p>
            <h2 className="font-judul text-title text-biru-tua">Hak Anda</h2>
            <p>Anda berhak meminta salinan atau penghapusan data yang Anda kirimkan. Hubungi pengelola melalui halaman Kontak.</p>
            <h2 className="font-judul text-title text-biru-tua">Cookies</h2>
            <p>Situs ini tidak menggunakan cookies untuk pelacakan perilaku pengunjung.</p>
            {terisi(situs.contact.email) && (
              <p>
                Untuk pertanyaan seputar kebijakan ini, hubungi {situs.name} di {situs.contact.email}.
              </p>
            )}
            <p>Diperbarui terakhir: {tahun}.</p>
            <Link href="/kontak" className="inline-flex min-h-12 items-center rounded-full bg-biru px-6 py-3 font-judul font-bold text-white hover:bg-biru-tua">
              Ke halaman Kontak
            </Link>
          </div>
        </Kontainer>
      </section>
    </Kerangka>
  );
}
