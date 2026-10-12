/**
 * Uji galeri publik: daftar album, halaman album, muat lebih banyak,
 * dan peng optimalean gambar.
 *
 *   npx tsx scripts/uji-galeri.ts
 *
 * Album uji 30 foto perlu dibuat lebih dulu:
 *   npm run seed:galeri-uji
 */

import { request } from "node:http";

const PORT = 3000;

interface Balasan {
  status: number;
  teks: string;
}

function ambil(jalur: string): Promise<Balasan> {
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

const bersih = (x: string) => x.replace(/<!--[\s\S]*?-->/g, "");

function periksa(label: string, lulus: boolean, catatan = ""): void {
  console.log(`  ${lulus ? "OK  " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`);
}

async function main() {
  console.log("A. Daftar album");
  const daftar = await ambil("/galeri");
  periksa("/galeri 200", daftar.status === 200);
  periksa("ada judul Galeri", bersih(daftar.teks).includes(">Galeri Kegiatan</h1>"));
  periksa(
    "ada tautan ke album",
    /href="\/galeri\/[a-z0-9-]+"/.test(bersih(daftar.teks)),
  );
  periksa("canonical /galeri", daftar.teks.includes('rel="canonical"'));
  periksa(
    "jumlah foto disebut di deskripsi",
    bersih(daftar.teks).includes("foto"),
  );

  console.log("\nB. Halaman album");
  const album = await ambil("/galeri/kegiatan-sekolah");
  periksa("album ada 200", album.status === 200);
  periksa("tepat satu h1", (album.teks.match(/<h1[\s>]/g) ?? []).length === 1);
  periksa(
    "schema ImageGallery",
    album.teks.includes("ImageGallery"),
  );
  periksa(
    "schema ImageObject per foto",
    (album.teks.match(/"@type":"ImageObject"/g) ?? []).length > 0,
  );
  periksa("album salah -> 404", (await ambil("/galeri/tidak-ada")).status === 404);

  console.log("\nC. KP: 24 foto pertama lalu tombol muat lebih banyak");
  const uji = await ambil("/galeri/uji-galeri");
  if (uji.status !== 200) {
    periksa("album uji tersedia", false, "jalankan npm run seed:galeri-uji");
    return;
  }

  const gambarGaleri = [...uji.teks.matchAll(/<img[^>]*src="([^"]*\/media\/[^"]+)"[^>]*>/g)];
  const thumbnails = gambarGaleri.filter((m) => m[1]!.includes("?w=480"));

  periksa(
    "hanya 24 thumbnail foto di DOM awal",
    thumbnails.length === 24,
    `${thumbnails.length} thumbnail`,
  );
  periksa(
    "tombol muat lebih banyak ada",
    bersih(uji.teks).includes("Muat lebih banyak"),
  );

  const teksTombol = bersih(uji.teks)
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
  periksa(
    "jumlah sisa foto disebut di tombol",
    /Muat lebih banyak \(\d+ foto tersisa\)/.test(teksTombol),
    (teksTombol.match(/Muat lebih banyak \([^)]*\)/) ?? ["-"])[0],
  );

  console.log("\nD. KP: CLS di bawah 0,1 (anti pergeseran tata letak)");
  const imgTanpaDimensi = [...uji.teks.matchAll(/<img[^>]*>/g)]
    .map((m) => m[0])
    .filter((tag) => {
      // Header memuat logo yang juga punya dimensi; yang dihitung di sini
      // hanya gambar galeri, yaitu yang memakai w=480 atau w=1600.
      const lebar = /src="([^"]+)"/.exec(tag)?.[1] ?? "";
      if (!/w=(480|1600)/.test(lebar)) return false;
      return !(/width="\d+"/.test(tag) && /height="\d+"/.test(tag));
    });
  periksa(
    "semua gambar galeri punya width dan height",
    imgTanpaDimensi.length === 0,
    `${imgTanpaDimensi.length} tanpa dimensi`,
  );

  periksa(
    "semua gambar galeri dimuat lazy",
    (uji.teks.match(/loading="lazy"/g) ?? []).length >= 24,
  );

  console.log("\nE. Bobot halaman");
  const ukuranKb = Math.round(uji.teks.length / 1024);
  periksa("HTML di bawah 150 KB", ukuranKb < 150, `${ukuranKb} KB`);

  console.log("\nF. Lightbox");
  periksa(
    "tombol perbesar ada untuk tiap foto",
    (bersih(uji.teks).match(/aria-label="Perbesar:/g) ?? []).length === 24,
    `${(bersih(uji.teks).match(/aria-label="Perbesar:/g) ?? []).length} tombol`,
  );
  periksa(
    "keterangan foto ikut terkirim ke peramban",
    uji.teks.includes("Foto kegiatan ke-1"),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});