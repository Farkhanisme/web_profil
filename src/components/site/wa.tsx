import { teleponHref, waLinkUrl, teleponTerisi } from "@/lib/konten";
import type { IsiSitus } from "@/lib/konten";

/**
 * Ikon WhatsApp digambar sendiri, bukan font ikon.
 */
export function IkonWa({ ukuran = 20 }: { ukuran?: number }) {
  return (
    <svg
      width={ukuran}
      height={ukuran}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.174.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 0 1 6.988 2.896 9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0 0 20.465 3.488" />
    </svg>
  );
}

/**
 * Tombol WhatsApp mengambang.
 *
 * Hijau #25D366 bukan peniruan: itu warna yang membuat orang tua
 * mengenali "ini tombol chat" sekilas, seperti gelembung hijau di
 * aplikasi mereka. Halaman madrasah di Indonesia hampir selalu punya
 * tombol seperti ini, dan kalau tidak ada orang tua akan mencari-cari.
 *
 * Botak sampai nomor WhatsApp diisi pengelola. `waLinkUrl` mengembalikan
 * null bila nomornya masih placeholder, jadi tidak ada tautan mati.
 */
export function TombolWa({ situs }: { situs: IsiSitus }) {
  const href = waLinkUrl(
    situs,
    "Halo, saya ingin menanyakan pendaftaran MTs Ma'arif Tieng.",
  );

  // Nomor belum diisi: jangan tampilkan tombol yang tidak bisa dipakai.
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="tombol fixed right-4 bottom-20 z-30 bg-wa text-white shadow-lg shadow-black/20 hover:bg-wa-gelap sm:right-6 sm:bottom-24"
    >
      <IkonWa />
      <span>Chat WhatsApp</span>
    </a>
  );
}

/**
 * Kontak di dalam blok pendaftaran.
 *
 * Hanya menampilkan tombol yang memang punya data: nomor telepon dan
 * WhatsApp masing-masing diperiksa terpisah, supaya tidak ada tombol
 * yang menuju ke "TODO" kalau pengelola belum mengisi.
 */
export function KontakBlok({ situs }: { situs: IsiSitus }) {
  const wa = waLinkUrl(situs, "Halo, saya ingin bertanya pendaftaran.");
  const adaWa = Boolean(wa);
  const adaTelp = teleponTerisi(situs.contact);

  if (!adaWa && !adaTelp) {
    return (
      <p className="rounded-xl bg-kuning-terang p-4 text-kuning-tua">
        Nomor kontak belum diisi. Pengelola dapat menambahkannya lewat
        pengaturan situs.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      {adaWa && wa && (
        <a
          href={wa}
          target="_blank"
          rel="noopener noreferrer"
          className="tombol bg-wa text-white hover:bg-wa-gelap"
        >
          <IkonWa />
          Chat WhatsApp
        </a>
      )}
      {adaTelp && (
        <a
          href={teleponHref(situs)}
          className="tombol border-2 border-kuning-tua bg-kuning-muda text-kuning-tua hover:bg-kuning-terang"
        >
          Telepon {situs.contact.phone}
        </a>
      )}
      </div>
  );
}