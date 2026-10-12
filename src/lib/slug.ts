/**
 * Pembuat slug untuk URL yang ramah mesin pencari.
 *
 * Aturan: huruf kecil, spasi menjadi tanda hubung, karakter khusus
 * dibuang, tanda hubung ganda dirapatkan, panjang dibatasi 80 karakter.
 */

const BATAH_PANJANG = 80;

export function buatSlug(teks: string): string {
  return teks
    .toLowerCase()
    .normalize("NFKD")
    // Buang tanda baca (aksen) supaya "Pramuka" tetap menjadi "pramuka".
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, BATAH_PANJANG)
    .replace(/-+$/g, "");
}

/** Slug harus berupa huruf, angka, dan tanda hubung. */
export function slugValid(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= BATAH_PANJANG;
}

/**
 * Pastikan slug unik dalam satu tabel. Mengembalikan slug yang aman:
 * bila sudah dipakai, ditambahkan akhiran angka (-2, -3, dan seterusnya).
 */
export async function slugUnik(
  ada: (slug: string) => Promise<boolean>,
  slugDasar: string,
): Promise<string> {
  const dasar = buatSlug(slugDasar) || "tanpa-judul";

  if (!(await ada(dasar))) return dasar;

  for (let i = 2; i < 100; i += 1) {
    const kandidat = `${denganAkhiran(dasar, i)}`;
    if (!(await ada(kandidat))) return kandidat;
  }

  // Camaran: 100 varian sudah lebih dari cukup untuk satu sekolah.
  return denganAkhiran(dasar, 100);
}

/** Tambahkan akhiran angka tanpa melewati batas panjang. */
function denganAkhiran(slug: string, angka: number): string {
  const akhiran = `-${angka}`;
  return slug.slice(0, BATAH_PANJANG - akhiran.length) + akhiran;
}
