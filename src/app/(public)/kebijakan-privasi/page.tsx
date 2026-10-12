import type { Metadata } from "next";
import { metadataDasar } from "@/lib/seo";
import { Container } from "@/components/site/container";
import { BreadcrumbAtas } from "@/components/site/breadcrumb";

export async function generateMetadata(): Promise<Metadata> {
  return metadataDasar(
    "Kebijakan Privasi",
    "Kebijakan privasi singkat: data yang dikumpulkan situs ini, kegunaannya, dan bagaimana mengelolanya.",
    "/kebijakan-privasi",
  );
}

/**
 * Halaman kebijakan privasi.
 *
 * Ada formulir kontak di situs ini, jadi pengguna perlu tahu data apa
 * yang disimpan dan bagaimana data tersebut dihapus.
 * Halaman ini sengaja dibuat singkat agar mudah dibaca.
 */
export default function KebijakanPrivasiPage() {
  return (
    <>
      <BreadcrumbAtas nama="Kebijakan Privasi" segmen="kebijakan-privasi" />

      <Container lebar="sempit">
        <article className="space-y-8 py-10 sm:py-12">
          <header>
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Kebijakan Privasi
            </h1>
            <p className="mt-3 text-muted-foreground">
              Halaman singkat ini menjelaskan data yang kami simpan saat Anda
              menggunakan situs ini.
            </p>
          </header>

          <BagianJudul judul="Data yang dikumpulkan">
            <p>
              Situs ini tidak meminta Anda membuat akun dan tidak menggunakan
              cookie pelacak iklan. Data pribadi hanya dikumpulkan bila Anda
              mengirim pesan melalui formulir kontak.
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5">
              <li>Nama yang Anda tulis pada formulir kontak.</li>
              <li>Alamat email atau nomor telepon untuk dapat dihubungi.</li>
              <li>Isi pesan yang Anda kirim.</li>
            </ul>
          </BagianJudul>

          <BagianJudul judul="Cara kami memakai data">
            <p>
              Data tersebut hanya dipakai pengelola sekolah untuk menjawab
              pertanyaan Anda. Data tidak dijual, tidak dibagikan kepada pihak
              ketiga, dan tidak dipakai untuk keperluan pemasaran.
            </p>
          </BagianJudul>

          <BagianJudul judul="Alamat IP">
            <p>
              Untuk mencegah penyalahgunaan formulir, alamat IP pengunjung
              disimpan dalam bentuk terenkripsi (hash) dan tidak disimpan
              sebagai alamat IP mentah. Hash tersebut hanya dipakai untuk
              membatasi jumlah pesan yang dapat dikirim dalam waktu tertentu.
            </p>
          </BagianJudul>

          <BagianJudul judul="Berapa lama data disimpan">
            <p>
              Pesan disimpan selama masih diperlukan untuk keperluan sekolah,
              lalu dihapus. Anda dapat meminta penghapusan data kapan saja
              melalui halaman kontak.
            </p>
          </BagianJudul>

          <BagianJudul judul="Hubungi kami">
            <p>
              Untuk pertanyaan, permintaan penghapusan data, atau koreksi
              informasi, silakan kirim pesan melalui halaman kontak. Pengelola
              sekolah akan menindaklanjuti.
            </p>
          </BagianJudul>
        </article>
      </Container>
    </>
  );
}

/** Subbagian dengan judul dan isi. */
function BagianJudul({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-semibold tracking-tight">{judul}</h2>
      <div className="space-y-3 leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}