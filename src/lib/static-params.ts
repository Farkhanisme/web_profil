/**
 * Pembuat `generateStaticParams` yang tahan database kosong.
 *
 * Dengan `cacheComponents: true`, Next.js mewajibkan setiap
 * `generateStaticParams` mengembalikan minimal satu param supaya build
 * bisa memvalidasi route (pesan galat "empty-generate-static-params").
 * Untuk situs yang isinya diisi pengelola lewat CMS, tabel program,
 * ekstrakurikuler, dan album bisa saja masih kosong saat build pertama
 * dijalankan — tanpa perlindungan ini, satu tabel kosong langsung
 * menggagalkan seluruh deploy.
 *
 * Caranya: bila daftar dari database kosong, kembalikan satu slug
 * placeholder. Halaman memanggil `notFound()` untuk slug yang tidak
 * dikenal, sehingga route ini hanya menghasilkan halaman 404 saat build
 * — bukan error — dan situs bisa dideploy pada keadaan apa pun.
 */

/**
 * Slug sengaja memakai garis bawah sehingga tidak mungkin bertabrakan
 * dengan slug CMS: `buatSlug()` hanya menghasilkan huruf kecil, angka,
 * dan tanda hubung (`src/lib/slug.ts`).
 */
export const SLUG_PLACEHOLDER = "__placeholder__";

/**
 * Ubah daftar baris CMS menjadi daftar param statis.
 *
 * @param rows Hasil query berisi kolom `slug`. Boleh kosong.
 */
export function paramSlug<T extends { slug: string }>(
  rows: readonly T[],
): Array<{ slug: string }> {
  if (rows.length > 0) return rows.map((row) => ({ slug: row.slug }));
  return [{ slug: SLUG_PLACEHOLDER }];
}
