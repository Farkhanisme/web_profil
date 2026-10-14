/**
 * Uji tautan antar halaman publik.
 *
 *   npm run cek:tautan      (server harus sudah berjalan)
 *
 * Dua masalah yang pernah terjadi dan sulit terlihat mata:
 *   1. Halaman yatim — halaman yang tidak punya satu pun tautan masuk.
 *      Footer dulu hanya memuat tiga halaman, sehingga /program,
 *      /ekstrakurikuler, /galeri, dan /kontak tidak bisa dijangkau dari
 *      halaman lain mana pun.
 *   2. Tautan mati — tautan internal yang balasannya bukan 200.
 *
 * Skrip ini mengambil semua href internal dari setiap halaman publik,
 * lalu memastikan semuanya benar-benar bisa dibuka dan semuanya punya
 * jalan masuk.
 */

import { request } from "node:http";
import { HALAMAN_PUBLIK } from "../src/config/navigation";

const HOST = "localhost";
const PORT = 3000;

const AKAR = ["/", ...HALAMAN_PUBLIK.map((h) => h.href)];
interface Balasan {
  status: number;
  teks: string;
}

function minta(jalur: string): Promise<Balasan> {
  return new Promise((resolve, reject) => {
    const req = request({ host: HOST, port: PORT, path: jalur }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (p) => {
        data += p;
      });
      res.on("end", () =>
        resolve({ status: res.statusCode ?? 0, teks: data }),
      );
    });
    req.on("error", reject);
    req.end();
  });
}

/** Semua href internal (dimulai dengan satu garis miring). */
function tautanInternal(html: string): Set<string> {
  const hasil = new Set<string>();
  for (const cocok of html.matchAll(/href="(\/[^"#]*)"/g)) {
    const href = cocok[1]!;
    if (href.startsWith("//")) continue;
    hasil.add(href);
  }
  return hasil;
}

let gagal = 0;
function periksa(label: string, lulus: boolean, catatan = ""): void {
  if (!lulus) gagal += 1;
  console.log(
    `  ${lulus ? "OK   " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`,
  );
}

async function main() {
  console.log(`Memeriksa tautan di http://${HOST}:${PORT}\n`);

  // Halaman detail slug-nya bisa berbeda antara mesin. Kita ambil dari
  // halaman daftar, bukan menebak.
  const daftarProgram = await minta("/program");
  const daftarEkstra = await minta("/ekstrakurikuler");
  const daftarGaleri = await minta("/galeri");

  const detailProgram = [...tautanInternal(daftarProgram.teks)].filter((h) =>
    h.startsWith("/program/"),
  );
  const detailEkstra = [...tautanInternal(daftarEkstra.teks)].filter((h) =>
    h.startsWith("/ekstrakurikuler/"),
  );
  const detailGaleri = [...tautanInternal(daftarGaleri.teks)].filter((h) =>
    h.startsWith("/galeri/"),
  );

  const semuaDialami = [
    ...AKAR,
    ...detailProgram,
    ...detailEkstra,
    ...detailGaleri,
  ];


  console.log("A. Halaman yang dipanggil langsung");
  for (const jalur of semuaDialami) {
    const r = await minta(jalur);
    periksa(`${jalur} → ${r.status}`, r.status === 200);
  }

  console.log("\nB. Tautan internal yang ditemukan");
  const semuaTautan = new Set<string>();
  for (const jalur of semuaDialami) {
    const r = await minta(jalur);
    for (const t of tautanInternal(r.teks)) semuaTautan.add(t);
  }
  console.log(`  total tautan internal: ${semuaTautan.size}`);

  // Hanya tautan halaman (bukan berkas, aset, atau rute API).
  const SKIP = [
    /^\/(admin|api|_next|media|llms)/,
    /\.(xml|txt|ico|png|jpg|webp|svg|css|js)$/,
    /^\/#/,
  ];
  const tautanHalaman = [...semuaTautan].filter(
    (t) => !SKIP.some((p) => p.test(t)),
  );

  console.log("\nC. Tautan halaman dibuka satu per satu");
  const rusak: string[] = [];
  for (const t of tautanHalaman) {
    const r = await minta(t);
    if (r.status !== 200) rusak.push(`${t} → ${r.status}`);
  }
  periksa(
    "semua tautan halaman hidup",
    rusak.length === 0,
    rusak.length > 0 ? rusak.join(", ") : `${tautanHalaman.length} tautan diperiksa`,
  );

  console.log("\nD. Halaman yatim");
  const punyaTautanMasuk = new Set<string>();
  for (const t of semuaTautan) {
    if (SKIP.some((p) => p.test(t))) continue;
    // Anak dari /program/{slug} dianggap punya jalan masuk dari /program.
    const induk = t.split("/").slice(0, 3).join("/");
    punyaTautanMasuk.add(t);
    if (induk && induk !== "/") punyaTautanMasuk.add(induk);
  }
  for (const halaman of AKAR) {
    periksa(
      `${halaman} punya tautan masuk`,
      punyaTautanMasuk.has(halaman),
    );
  }
  for (const [nama, daftar] of [
    ["program", detailProgram],
    ["ekstrakurikuler", detailEkstra],
    ["galeri", detailGaleri],
  ] as const) {
    for (const d of daftar) {
      periksa(`${d} punya tautan masuk`, semuaTautan.has(d));
    }
    if (daftar.length === 0) {
      console.log(`  (lewati: tidak ada halaman detail ${nama} untuk diperiksa)`);
    }
  }

  console.log(
    gagal === 0
      ? "\nSelesai: struktur tautan sehat."
      : `\nSelesai: ${gagal} pemeriksaan gagal.`,
  );
  if (gagal > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});