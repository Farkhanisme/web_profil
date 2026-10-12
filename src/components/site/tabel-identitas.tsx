import { site } from "@/config/site";

/**
 * Tabel identitas sekolah.
 *
 * Bentuk tabel (bukan daftar bullet) karena mesin AI dan peramban
 * membaca tabel dua kolom jauh lebih Ease daripada teks bebas.
 * Fakta yang masih berupa placeholder disembunyikan, bukan ditampilkan
 * sebagai "TODO".
 */
export function TabelIdentitas() {
  const semua: Array<[string, string]> = [
    ["Nama resmi", site.name],
    ["Bentuk sekolah", site.identity.status],
    ["Jenjang", "Madrasah Tsanawiyah (MTs), kelas VII sampai IX"],
    ["Kurikulum", site.identity.curriculum],
    ["NPSN", site.identity.npsn],
    ["Status akreditasi", site.identity.accreditation],
    ["Tahun berdiri", site.identity.foundedYear > 0 ? String(site.identity.foundedYear) : ""],
    ["Lembaga pengusul", site.identity.founder],
    [
      "Alamat",
      [site.address.street, site.address.village, site.address.subdistrict, site.address.city, site.address.province]
        .filter((b) => b && !b.startsWith("TODO"))
        .join(", "),
    ],
    ["Telepon", site.contact.phone],
    ["Email", site.contact.email],
    [
      "Jam layanan",
      site.openingHours
        .map((j) => `${j.days[0]!.slice(0, 3)}-${j.days[j.days.length - 1]!.slice(0, 3)} ${j.opens}-${j.closes}`)
        .join(", "),
    ],
  ];

  const baris = semua.filter(([, nilai]) => nilai && !nilai.startsWith("TODO"));

  return (
    <div className="overflow-hidden rounded-xl border">
      <table className="w-full border-collapse text-sm">
        <caption className="sr-only">Identitas dan kontak Madrasah Tsanawiyah Ma&apos;arif Tieng</caption>
        <tbody>
          {baris.map(([label, nilai]) => (
            <tr key={label} className="border-b last:border-b-0 even:bg-muted/30">
              <th
                scope="row"
                className="w-40 px-4 py-3 text-left align-top font-medium text-muted-foreground sm:w-48"
              >
                {label}
              </th>
              <td className="px-4 py-3 align-top">{nilai}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}