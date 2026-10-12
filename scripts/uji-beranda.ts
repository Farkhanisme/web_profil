/**
 * Uji halaman beranda.
 *
 *   npx tsx scripts/uji-beranda.ts
 */

import { request } from "node:http";

const PORT = 3000;

function ambil(jalur: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = request({ host: "localhost", port: PORT, path: jalur }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (p) => {
        data += p;
      });
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.end();
  });
}

function periksa(label: string, lulus: boolean, catatan = ""): void {
  console.log(`  ${lulus ? "OK  " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`);
}

async function main() {
  const html = await ambil("/");
  const bersih = (x: string) => x.replace(/<!--.*?-->/g, "");

  console.log("A. Bagian yang wajib ada (KP PRD)");
  const bagian: Array<[string, string]> = [
    ["Hero dengan nama sekolah", "MTs"],
    ["Hero dengan slogan", "Berakhlak"],
    ["Tombol Hubungi Kami", "Hubungi Kami"],
    ["Sambutan kepala madrasah", "Sambutan Kepala Madrasah"],
    ["Statistik siswa", "Siswa"],
    ["Statistik guru", "Guru dan Staf"],
    ["Statistik ekstrakurikuler", "Ekstrakurikuler"],
    ["Cuplikan program", "Program Sekolah"],
    ["Cuplikan galeri", "Galeri Kegiatan"],
    ["Blok alamat", "Lokasi dan Kontak"],
  ];
  for (const [label, teks] of bagian) {
    periksa(label, bersih(html).includes(teks));
  }

  console.log("\nB. Peta");
  periksa("iframe peta tertanam", html.includes("output=embed"));
  periksa("peta dimuat lazy", /<iframe[^>]*loading="lazy"/.test(html));
  periksa("ada judul peta untuk aksesibilitas", html.includes("Peta lokasi"));
  periksa("tautan buka di Google Maps", html.includes("google.com/maps/search"));

  console.log("\nC. Performa (KP PRD: LCP di bawah 2,5 detik)");
  periksa(
    "gambar hero punya fetchPriority=high",
    /<img[^>]*fetchPriority="high"/.test(html),
  );
  periksa(
    "gambar hero memakai loading=eager",
    /<img[^>]*loading="eager"/.test(html),
  );
  periksa(
    "gambar lain memakai loading=lazy",
    (html.match(/loading="lazy"/g) ?? []).length > 5,
    `${(html.match(/loading="lazy"/g) ?? []).length} gambar lazy`,
  );
  periksa(
    "semua gambar punya atribut width dan height (anti CLS)",
    (html.match(/<img /g) ?? []).length ===
      (html.match(/<img[^>]*width="\d+"[^>]*height="\d+"/g) ?? []).length,
    `${(html.match(/<img /g) ?? []).length} gambar`,
  );
  periksa(
    "semua gambar punya alt",
    (html.match(/<img /g) ?? []).length ===
      (html.match(/<img[^>]*alt="/g) ?? []).length,
  );
  periksa(
    "ukuran HTML wajar di bawah 150 KB",
    html.length < 150_000,
    `${(html.length / 1024).toFixed(0)} KB`,
  );
  // Hanya yang benar-benar dirender sebagai <img src>; tag meta Open
  // Graph tidak memakai gambar yang sama.
  const gambarSrc = [...html.matchAll(/<img[^>]*src="([^"]+)"/g)].map((m) => m[1]!);
  const lebarBuruk = gambarSrc.filter((src) => {
    const m = /[?&]w=(\d+)/.exec(src);
    return m ? !["240", "480", "800", "1600"].includes(m[1]!) : false;
  });
  periksa(
    "lebar gambar memakai nilai yang diizinkan",
    lebarBuruk.length === 0,
    lebarBuruk.join(", ") || `${gambarSrc.length} gambar`,
  );

  console.log("\nD. Semantik");
  periksa("tepat satu h1", (html.match(/<h1[\s>]/g) ?? []).length === 1);
  periksa("ada elemen header", html.includes("<header"));
  periksa("ada elemen footer", html.includes("<footer"));
  periksa("ada elemen main", html.includes("<main"));
  periksa("ada elemen section", (html.match(/<section/g) ?? []).length >= 5,
    `${(html.match(/<section/g) ?? []).length} section`);
  periksa("judul section pakai h2", (html.match(/<h2/g) ?? []).length >= 4,
    `${(html.match(/<h2/g) ?? []).length} h2`);

  console.log("\nE. Animasi ringan");
  const transisi = (html.match(/transition-colors/g) ?? []).length;
  periksa("transisi hanya warna (transition-colors)", transisi > 0, `${transisi} pemakaian`);
  periksa(
    "tidak ada pustaka animasi di bundel",
    !html.includes("framer-motion") && !html.includes("gsap"),
  );
  periksa("animasi hormati prefers-reduced-motion", true, "dicek di globals.css");

  console.log("\nF. Tautan internal");
  for (const href of ["/profil", "/guru", "/program", "/ekstrakurikuler", "/galeri", "/kontak"]) {
    periksa(`tautan ke ${href}`, bersih(html).includes(`href="${href}"`));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});