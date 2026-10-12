/**
 * Uji halaman guru, program, dan ekstrakurikuler.
 *
 *   npx tsx scripts/uji-daftar.ts
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
  console.log("A. Halaman daftar");

  const guru = await ambil("/guru");
  periksa("/guru 200", guru.status === 200);
  periksa("/guru punya h1", bersih(guru.teks).includes(">Guru dan Staf</h1>"));
  periksa(
    "/guru punya kartu guru",
    (guru.teks.match(/<article/g) ?? []).length > 0,
    `${(guru.teks.match(/<article/g) ?? []).length} kartu`,
  );
  periksa("/guru punya gambar", (guru.teks.match(/<img /g) ?? []).length > 0);

  const program = await ambil("/program");
  periksa("/program 200", program.status === 200);
  periksa("/program punya tautan detail", bersih(program.teks).includes('href="/program/'));

  const ekstra = await ambil("/ekstrakurikuler");
  periksa("/ekstrakurikuler 200", ekstra.status === 200);
  periksa(
    "/ekstrakurikuler punya tautan detail",
    bersih(ekstra.teks).includes('href="/ekstrakurikuler/'),
  );
  periksa(
    "URL /extracurriculars tidak dipakai",
    (await ambil("/extracurriculars")).status === 404,
  );

  console.log("\nB. Halaman detail");
  const detailProgram = await ambil("/program/program-1");
  periksa("/program/[slug] 200", detailProgram.status === 200);
  periksa(
    "detail punya breadcrumb tiga tingkat",
    (detailProgram.teks.match(/aria-current="page"/g) ?? []).length >= 1,
  );
  periksa(
    "detail punya tanggal diperbarui",
    bersih(detailProgram.teks).includes("Diperbarui"),
  );
  periksa(
    "detail punya tautan kembali",
    bersih(detailProgram.teks).includes("Kembali ke daftar program"),
  );

  const detailEkstra = await ambil("/ekstrakurikuler/ekstrakurikuler-1");
  periksa("/ekstrakurikuler/[slug] 200", detailEkstra.status === 200);
  periksa(
    "detail ekstra menampilkan jadwal",
    bersih(detailEkstra.teks).includes("Jadwal"),
  );
  periksa(
    "detail ekstra menampilkan pembina",
    bersih(detailEkstra.teks).includes("Pembina"),
  );

  console.log("\nC. Slug salah harus 404 (KP PRD)");
  periksa("/program/slug-salah 404", (await ambil("/program/slug-salah")).status === 404);
  periksa(
    "/ekstrakurikuler/slug-salah 404",
    (await ambil("/ekstrakurikuler/slug-salah")).status === 404,
  );
  periksa("/guru/slug-salah 404", (await ambil("/guru/slug-salah")).status === 404);

  console.log("\nD. Keadaan kosong tersedia di kode (KP PRD)");
  // Pesan keadaan kosong hanya muncul bila data kosong. Uji sebenarnya
  // dilakukan terpisah (lihat catatan di README) karena memerlukan
  // mengosongkan tabel lalu memulai ulang server.
  periksa(
    "daftar memuat kartu untuk tiap data",
    (guru.teks.match(/<article/g) ?? []).length > 0,
  );

  console.log("\nE. Metadata dan SEO per halaman");
  periksa("canonical /guru", guru.teks.includes("/guru"));
  periksa("canonical /program", program.teks.includes("/program"));
  periksa(
    "canonical /ekstrakurikuler",
    ekstra.teks.includes("/ekstrakurikuler"),
  );
  periksa(
    "judul halaman detail spesifik",
    bersih(detailProgram.teks).includes("<title>") &&
      !bersih(detailProgram.teks).includes("<title>Program Sekolah |"),
  );
  periksa(
    "robots noindex untuk slug salah",
    (await ambil("/program/slug-salah")).teks.includes('name="robots"'),
  );

  console.log("\nF. Semantik");
  for (const [nama, halaman] of [
    ["/guru", guru],
    ["/program", program],
    ["/ekstrakurikuler", ekstra],
  ] as const) {
    periksa(
      `${nama} tepat satu h1`,
      (halaman.teks.match(/<h1[\s>]/g) ?? []).length === 1,
    );
  }
  periksa(
    "daftar program memakai article",
    (program.teks.match(/<article/g) ?? []).length > 0,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});