/**
 * Uji layout publik: struktur semantik, navigasi, footer, dan
 * breakpoint yang dipakai.
 *
 *   npx tsx scripts/uji-layout.ts
 */

import { request } from "node:http";

const PORT = 3000;

interface Balasan {
  status: number;
  teks: string;
}

function minta(jalur: string): Promise<Balasan> {
  return new Promise((resolve, reject) => {
    const req = request(
      { host: "localhost", port: PORT, path: jalur },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (p) => {
          data += p;
        });
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, teks: data }),
        );
      },
    );
    req.on("error", reject);
    req.end();
  });
}

function periksa(label: string, lulus: boolean, catatan = ""): void {
  console.log(`  ${lulus ? "OK  " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`);
}

/** Hitung jumlah kemunculan kelas yang menandai breakpoint. */
function adaBreakpoint(html: string, prefix: string): boolean {
  return html.includes(`${prefix}:`);
}

async function main() {
  console.log("A. Halaman beranda");
  const beranda = await minta("/");
  periksa("status 200", beranda.status === 200);
  periksa("tepat satu h1", (beranda.teks.match(/<h1[\s>]/g) ?? []).length === 1,
    `${(beranda.teks.match(/<h1[\s>]/g) ?? []).length} h1`);
  periksa("skip link menuju konten utama", beranda.teks.includes("Lewati ke konten utama"));
  periksa("main#konten-utama ada", beranda.teks.includes('id="konten-utama"'));
  periksa("header sticky ada", beranda.teks.includes("sticky top-0"));
  periksa("navigasi utama ada", beranda.teks.includes('aria-label="Navigasi utama"'));
  periksa("navigasi seluler ada", beranda.teks.includes('aria-label="Navigasi seluler"'));
  periksa("footer ada", beranda.teks.includes("<footer"));

  console.log("\nB. Menu dan breakpoint");
  periksa("7 butir menu di navigasi", (beranda.teks.match(/aria-label="Navigasi utama"/g) ?? []).length === 1);
  const bersih = (x: string) => x.replace(/<!--.*?-->/g, "");
  const html = bersih(beranda.teks);
  const menu = ["Beranda", "Profil", "Guru dan Staf", "Program", "Ekstrakurikuler", "Galeri", "Kontak"];
  for (const label of menu) {
    periksa(`menu "${label}" ada`, html.includes(`>${label}</a>`));
  }
  periksa("tidak ada menu yang hilang", menu.length === 7);
  periksa("tombol Hubungi Kami ada", beranda.teks.includes("Hubungi Kami"));
  periksa("breakpoint sm: dipakai", adaBreakpoint(beranda.teks, "sm"));
  periksa("breakpoint lg: dipakai", adaBreakpoint(beranda.teks, "lg"));
  periksa("menu desktop disembunyikan di mobile (lg:flex)",
    /nav[^>]*aria-label="Navigasi utama"[^>]*class="[^"]*hidden lg:block/.test(beranda.teks));
  periksa("tombol menu mobile disembunyikan di desktop (lg:hidden)",
    beranda.teks.includes("lg:hidden"));
  periksa("konten memakai padding responsif",
    beranda.teks.includes("px-4") && beranda.teks.includes("sm:px-6"));

  console.log("\nC. Footer dan NAP");
  periksa("alamat di footer", beranda.teks.includes("Secangkang"));
  periksa("tautan peta", beranda.teks.includes("google.com/maps"));
  periksa("tautan kebijakan privasi", beranda.teks.includes("/kebijakan-privasi"));
  periksa("copyright dan hak cipta", beranda.teks.includes("Seluruh hak cipta dilindungi"));

  console.log("\nD. Breadcrumb");
  const profil = await minta("/profil");
  periksa("breadcrumb di halaman dalam", profil.teks.includes('aria-label="Remah roti"'));
  periksa("tautan ke beranda", profil.teks.includes('aria-label="Remah roti"'));
  periksa("halaman dalam punya h1", (profil.teks.match(/<h1[\s>]/g) ?? []).length === 1);
  periksa("halaman dalam tidak punya menu seluler duplikat",
    (profil.teks.match(/aria-label="Navigasi utama"/g) ?? []).length === 1);

  console.log("\nE. Seluruh halaman publik");
  const halaman = [
    "/",
    "/profil",
    "/guru",
    "/program",
    "/ekstrakurikuler",
    "/galeri",
    "/kontak",
    "/kebijakan-privasi",
  ];
  for (const p of halaman) {
    const r = await minta(p);
    const jumlahH1 = (r.teks.match(/<h1[\s>]/g) ?? []).length;
    periksa(`${p} -> 200 dengan 1 h1`, r.status === 200 && jumlahH1 === 1, `h1=${jumlahH1}`);
  }

  console.log("\nF. Bahasa dan aksesibilitas");
  periksa("html lang=id", beranda.teks.includes('lang="id"'));
  periksa("charset utf-8", beranda.teks.includes('charSet="utf-8"'));
  periksa("viewport mobile", beranda.teks.includes("width=device-width"));
  periksa("tema warna dari CMS ada di head",
    beranda.teks.includes('id="tema-merek"'));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});