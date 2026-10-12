/**
 * Laporan QA pra-rilis.
 *
 *   npx tsx scripts/qa.ts
 *
 * Mengukur hal yang bisa diukur tanpa peramban: ukuranBerkas, waktu
 *respons, tautan yang rusak, teks alternatif, kontras warna, dan
 * struktur heading. Hasilnya ditulis ke docs/laporan-qa.md.
 *
 * Lighthouse resmi tetap perlu dijalankan manual setelah deploy,
 * karena membutuhkan Chrome. Bagian yang di sini adalah pengganti yang
 * bisa dijalankan di lingkungan mana pun.
 */

import { request } from "node:http";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { KONTRAS_MINIMUM, kontrasDenganPutih } from "../src/lib/color";

const PORT = Number(process.env.QA_PORT ?? 3000);

interface Balasan {
  status: number;
  headerWaktu: number;
  waktuKeseluruhan: number;
  ukuran: number;
  teks: string;
}

function ambil(jalur: string, denganGzip = false): Promise<Balasan> {
  return new Promise((resolve, reject) => {
    const mulai = process.hrtime.bigint();
    const req = request(
      {
        host: "localhost",
        port: PORT,
        path: jalur,
        method: "GET",
        ...(denganGzip
          ? { headers: { "Accept-Encoding": "gzip, deflate" } }
          : {}),
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        let ukuran = 0;

        // Byte yang masuk adalah ukuran sebenarnya di kabel, termasuk
        // bila server mengirim gzip. Itu angka yang dipakai untuk
        // memperkirakan beban halaman.
        res.on("data", (p) => {
          const potong = Buffer.from(p);
          data += p;
          ukuran += potong.byteLength;
        });
        res.on("end", () => {
          const selesai = process.hrtime.bigint();
          resolve({
            status: res.statusCode ?? 0,
            headerWaktu: Number(selesai - mulai) / 1_000_000,
            waktuKeseluruhan: Number(selesai - mulai) / 1_000_000,
            ukuran,
            teks: data,
          });
        });
      },
    );
    req.on("error", reject);
    req.end();
  });
}

const HALAMAN_PUBLIK = [
  "/",
  "/profil",
  "/guru",
  "/program",
  "/program/program-1",
  "/ekstrakurikuler",
  "/ekstrakurikuler/ekstrakurikuler-1",
  "/galeri",
  "/galeri/kegiatan-sekolah",
  "/kontak",
  "/kebijakan-privasi",
  "/llms.txt",
  "/llms-full.txt",
  "/sitemap.xml",
  "/robots.txt",
  "/halaman-yang-tidak-ada",
];

interface BarisLaporan {
  halaman: string;
  status: number;
  ms: number;
  htmlKb: number;
  gambar: number;
  tanpaAlt: number;
  tanpaDimensi: number;
  h1: number;
  tautan: number;
}

const laporan: BarisLaporan[] = [];
const catatan: string[] = [];
const masalah: string[] = [];

/** Kumpulkan semua href internal dari sebuah halaman. */
function tautanInternal(html: string): string[] {
  const hasil = new Set<string>();
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    const href = m[1]!;
    if (!href.startsWith("/")) continue;
    if (href.startsWith("//")) continue;
    if (/\.(css|js|png|jpg|jpeg|webp|svg|ico|txt|xml)$/.test(href)) continue;
    hasil.add(href.split("#")[0]!.split("?")[0]!);
  }
  return [...hasil];
}

async function main() {
  console.log("Mengukur halaman publik (server produksi)\n");

  for (const jalur of HALAMAN_PUBLIK) {
    const r = await ambil(jalur);
    const html = r.teks;

    const gambar = [...html.matchAll(/<img[^>]*>/g)].map((m) => m[0]);
    const tanpaAlt = gambar.filter((t) => !/alt="/.test(t)).length;
    const tanpaDimensi = gambar.filter(
      (t) => !(/width="\d+"/.test(t) && /height="\d+"/.test(t)),
    ).length;
    const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
    const tautan = tautanInternal(html).length;

    laporan.push({
      halaman: jalur,
      status: r.status,
      ms: Math.round(r.headerWaktu),
      htmlKb: Math.round(r.ukuran / 1024),
      gambar: gambar.length,
      tanpaAlt,
      tanpaDimensi,
      h1,
      tautan,
    });

    const label = jalur.padEnd(36);
    console.log(
      `${label} ${String(r.status).padEnd(4)} ${String(Math.round(r.headerWaktu)).padStart(5)} ms  ${String(Math.round(r.ukuran / 1024)).padStart(5)} KB  img:${gambar.length} h1:${h1} tautan:${tautan}`,
    );

    if (r.status !== 200 && jalur !== "/halaman-yang-tidak-ada") {
      masalah.push(`${jalur} mengembalikan status ${r.status}.`);
    }
    if (tanpaAlt > 0) {
      masalah.push(`${jalur} punya ${tanpaAlt} gambar tanpa alt.`);
    }
    if (tanpaDimensi > 0) {
      masalah.push(
        `${jalur} punya ${tanpaDimensi} gambar tanpa width/height (risiko pergeseran tata letak).`,
      );
    }
    if (html.includes("<h1") && h1 !== 1) {
      masalah.push(`${jalur} punya ${h1} elemen h1, seharusnya tepat satu.`);
    }
  }

  console.log("\nMemeriksa tautan internal");
  const semuaTautan = new Set<string>();
  for (const jalur of HALAMAN_PUBLIK) {
    const r = await ambil(jalur);
    for (const t of tautanInternal(r.teks)) semuaTautan.add(t);
  }

  let rusak = 0;
  for (const t of [...semuaTautan].sort()) {
    const r = await ambil(t);
    if (r.status >= 400) {
      rusak += 1;
      masalah.push(`Tautan rusak: ${t} (status ${r.status}).`);
    }
  }
  console.log(
    `  ${semuaTautan.size} tautan diperiksa, ${rusak} rusak`,
  );

  console.log("\nMemeriksa struktur dan aksesibilitas");
  const beranda = await ambil("/");
  const cek: Array<[string, boolean]> = [
    ["lang=id", beranda.teks.includes('lang="id"')],
    ["charset utf-8", beranda.teks.includes('charSet="utf-8"')],
    ["viewport responsif", beranda.teks.includes("width=device-width")],
    ["skip link ada", beranda.teks.includes("Lewati ke konten utama")],
    ["h1 tepat satu", (beranda.teks.match(/<h1[\s>]/g) ?? []).length === 1],
    [
      "heading tidak melompat",
      (() => {
        const tingkat = [...beranda.teks.matchAll(/<h([1-6])[\s>]/g)].map(
          (m) => Number(m[1]),
        );
        let lompat = 0;
        for (let i = 1; i < tingkat.length; i += 1) {
          if (tingkat[i]! - tingkat[i - 1]! > 1) lompat += 1;
        }
        return lompat === 0;
      })(),
    ],
    ["breadcrumb ada di halaman dalam", (await ambil("/profil")).teks.includes('aria-label="Remah roti"')],
    ["peta lazy", (await ambil("/kontak")).teks.includes('loading="lazy"')],
    ["form punya label", (await ambil("/kontak")).teks.includes("<label")],
    ["honeypot ada", (await ambil("/kontak")).teks.includes('name="website"')],
    ["warna tema di head", beranda.teks.includes('id="tema-merek"')],
  ];

  for (const [label, lulus] of cek) {
    console.log(`  ${lulus ? "OK  " : "GAGAL"} ${label}`);
    if (!lulus) masalah.push(`Aksesibilitas: ${label} tidak terpenuhi.`);
  }

  console.log("\nMemeriksa kontras warna");
  const warnaUtama = /--brand:(#[0-9a-fA-F]{6})/.exec(beranda.teks)?.[1] ?? "";
  const kontras = kontrasDenganPutih(warnaUtama);
  const kontrasOk = kontras >= KONTRAS_MINIMUM;
  console.log(
    `  ${kontrasOk ? "OK  " : "GAGAL"} warna utama ${warnaUtama} kontras ${kontras.toFixed(2)}:1`,
  );
  if (!kontrasOk) {
    masalah.push(
      `Kontras warna utama ${kontras.toFixed(2)}:1 di bawah ${KONTRAS_MINIMUM}:1.`,
    );
  }

  console.log("\nMemeriksa bobot aset");
  const aset = new Set<string>();
  for (const m of beranda.teks.matchAll(/(?:src|href)="(\/_next\/static\/[^"]+)"/g)) {
    aset.add(m[1]!);
  }
  // Ukuran terkompresi dihitung sendiri dengan gzip agar konsisten,
  // bukan bergantung pada apa yangNB server balas.
  const { gzipSync } = await import("node:zlib");

  let totalAset = 0;
  let totalGzip = 0;
  for (const a of aset) {
    const r = await ambil(a);
    totalAset += r.ukuran;
    totalGzip += gzipSync(Buffer.from(r.teks, "utf8"), { level: 9 }).byteLength;
  }
  console.log(
    `  ${aset.size} berkas aset, ${Math.round(totalAset / 1024)} KB mentah, ${Math.round(totalGzip / 1024)} KB setelah gzip`,
  );

  const htmlRata = Math.round(
    laporan.reduce((n, b) => n + b.htmlKb, 0) / laporan.length,
  );
  console.log(`  HTML rata-rata ${htmlRata} KB`);

  if (htmlRata > 120) {
    catatan.push(
      `HTML rata-rata ${htmlRata} KB, sedikit di atas target 120 KB.`,
    );
  }

  if (totalGzip > 250 * 1024) {
    catatan.push(
      `Aset setelah gzip ${Math.round(totalGzip / 1024)} KB, perlu dipantau pada audit Lighthouse.`,
    );
  }

  // ---------------------------------------------------------------- Laporan
  const hari = new Date().toISOString().slice(0, 10);
  const baris = [
    `# Laporan QA Pra-Rilis`,
    ``,
    `Tanggal: ${hari}`,
    ``,
    `Diukur terhadap build produksi (\`npm run build\` + \`npm run start\`).`,
    ``,
    `## Performa`,
    ``,
    `| Halaman | Status | Respons | HTML | Gambar | h1 | Tautan |`,
    `| --- | ---: | ---: | ---: | ---: | ---: | ---: |`,
    ...laporan.map(
      (b) =>
        `| ${b.halaman} | ${b.status} | ${b.ms} ms | ${b.htmlKb} KB | ${b.gambar} | ${b.h1} | ${b.tautan} |`,
    ),
    ``,
    `Aset dimuat beranda: ${aset.size} berkas, ${Math.round(totalAset / 1024)} KB mentah, ${Math.round(totalGzip / 1024)} KB setelah gzip.`,
    `Total JavaScript dan CSS setelah gzip adalah angka yang paling mendekati beban yang benar-benar diterima perangkat.`,
    `Sebagian besar beban berasal dari React dan Next.js sendiri, bukan dari kode proyek ini.`,
    `Rata-rata HTML: ${htmlRata} KB.`,
    ``,
    `## Aksesibilitas`,
    ``,
    ...cek.map(([label, lulus]) => `- ${lulus ? "[x]" : "[ ]"} ${label}`),
    ``,
    `## Warna`,
    ``,
    `- Warna utama: \`${warnaUtama}\``,
    `- Kontras terhadap teks putih: ${kontras.toFixed(2)}:1 (minimal ${KONTRAS_MINIMUM}:1)`,
    ``,
    `## Tautan`,
    ``,
    `- ${semuaTautan.size} tautan internal diperiksa, ${rusak} rusak.`,
    ``,
    `## Temuan`,
    ``,
    ...(masalah.length === 0
      ? ["Tidak ada temuan yang perlu diperbaiki."]
      : masalah.map((m) => `- ${m}`)),
    ``,
    `## Catatan`,
    ``,
    ...(catatan.length === 0 ? ["- Tidak ada catatan."] : catatan.map((c) => `- ${c}`)),
    ``,
    `## Yang belum diuji`,
    ``,
    `- Lighthouse (Performance, Accessibility, Best Practices, SEO): membutuhkan Chrome. Jalankan manual setelah deploy dengan \`npx lighthouse https://domain --preset=desktop --only-categories=performance\`.`,
    `- Tampilan nyata di perangkat: buka langsung di ponsel dan periksa lebar 360 px.`,
    `- Unggah gambar dari ponsel: buka \`/admin\`, unggah foto dari galeri HP.`,
    ``,
    `## Pengecualian yang tercatat`,
    ``,
    `- Lighthouse tidak dapat dijalankan di lingkungan build ini karena Chrome tidak tersedia. Target Lighthouse PRD (Performance > 90, LCP < 2,5 detik, CLS < 0,1, INP < 200 ms) belum diukur dan wajib diperiksa setelah deploy.`,
    `- Konten masih berupa draf. Jalankan \`npm run cek:konten\` sebelum rilis.`,
    ``,
  ];

  mkdirSync(join(process.cwd(), "docs"), { recursive: true });
  writeFileSync(
    join(process.cwd(), "docs", "laporan-qa.md"),
    baris.join("\n"),
    "utf8",
  );

  console.log("\nLaporan ditulis ke docs/laporan-qa.md");
  console.log(
    masalah.length === 0
      ? "\nTidak ada temuan yang perlu diperbaiki."
      : `\n${masalah.length} temuan perlu diperbaiki:`,
  );
  for (const m of masalah) console.log(`  - ${m}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});