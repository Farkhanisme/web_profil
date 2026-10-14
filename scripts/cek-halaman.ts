/**
 * Uji invariant halaman publik.
 *
 *   npm run cek:halaman     (server harus sudah berjalan)
 *
 * Berbeda dari uji tampilan lawas yang menguji markup desain lama, skrip
 * ini memeriksa hal-hal yang benar-benar penting untuk audiens orang
 * tua dan harus tetap berlaku meski warnanya diganti:
 *
 *   - satu judul utama per halaman dan tautan lompat ke konten,
 *   - tidak ada teks placeholder (TODO/DRAF) yang bocor ke pengunjung,
 *   - setiap halaman punya description sendiri (jangan semua sama),
 *   - halaman yang salah alamat tetap memberi jalan keluar,
 *   - tombol WhatsApp muncul hanya bila nomornya benar-benar diisi,
 *   - keterangan foto galeri ikut terbawa di HTML (berguna untuk
 *     pembaca layar dan untuk mesin pencari).
 */

import { request } from "node:http";
import { createClient } from "@libsql/client";
import { loadEnv } from "./load-env";

const HOST = "localhost";
const PORT = 3000;

interface Halaman {
  jalur: string;
  ButuhJsonLd?: boolean;
  breadcrumb?: boolean;
}

const HALAMAN: Halaman[] = [
  { jalur: "/", ButuhJsonLd: true },
  { jalur: "/profil", ButuhJsonLd: true },
  { jalur: "/guru" },
  { jalur: "/program", breadcrumb: true },
  { jalur: "/ekstrakurikuler", breadcrumb: true },
  { jalur: "/galeri", breadcrumb: true },
  { jalur: "/kontak", ButuhJsonLd: true },
  { jalur: "/kebijakan-privasi" },
];

interface Balasan {
  status: number;
  teks: string;
  lokasi: string | null;
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
        resolve({
          status: res.statusCode ?? 0,
          teks: data,
          lokasi: (res.headers.location as string) ?? null,
        }),
      );
    });
    req.on("error", reject);
    req.end();
  });
}

/** Buang skrip, gaya, dan SVG supaya teks yang dibaca benar-benar isi halaman. */
function teksTampak(html: string): string {
  const badan = html.split("<body")[1] ?? "";
  return badan
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<[^>]+>/g, " ");
}

let gagal = 0;
function periksa(label: string, lulus: boolean, catatan = ""): void {
  if (!lulus) gagal += 1;
  console.log(
    `  ${lulus ? "OK   " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`,
  );
}

function deskripsi(html: string): string {
  return /<meta name="description" content="([^"]*)"/.exec(html)?.[1] ?? "";
}

async function main() {
  loadEnv();
  console.log(`Memeriksa halaman di http://${HOST}:${PORT}\n`);

  // Nomor WhatsApp aktif menentukan apakah tombol boleh muncul di mana pun.
  const db = createClient({ url: process.env.TURSO_DATABASE_URL ?? "file:.data/dev.db" });
  const baris = await db.execute(
    "SELECT whatsapp FROM profil_content WHERE id = 1",
  );
  const nomor = (baris.rows[0] as { whatsapp?: string } | undefined)?.whatsapp?.trim() ?? "";
  const waAktif =
    nomor !== "" &&
    !nomor.startsWith("TODO") &&
    !nomor.startsWith("DRAF") &&
    /\d{8,}/.test(nomor) &&
    !/^(\d)\1+$/.test(nomor) &&
    nomor !== "6281234567890";
  console.log(
    `Nomor WhatsApp ${waAktif ? "diisi" : "belum diisi"} (${waAktif ? "tombol harus muncul" : "tombol harus disembunyikan"})\n`,
  );

  console.log("A. Kerangka tiap halaman");
  const deskripsiTerpakai = new Map<string, string[]>();

  for (const { jalur } of HALAMAN) {
    const r = await minta(jalur);
    periksa(`${jalur} status 200`, r.status === 200, `status=${r.status}`);

    const jumlahH1 = (r.teks.match(/<h1[\s>]/g) ?? []).length;
    periksa(`${jalur} punya tepat satu h1`, jumlahH1 === 1, `${jumlahH1} h1`);

    periksa(`${jalur} punya tautan lompat ke konten`, r.teks.includes('href="#konten"'));
    periksa(`${jalur} punya <main id="konten">`, r.teks.includes('id="konten"'));
    periksa(`${jalur} punya navigasi`, r.teks.includes('aria-label="Navigasi utama"'));
    periksa(`${jalur} punya footer`, r.teks.includes("<footer"));

    const isi = teksTampak(r.teks);
    periksa(`${jalur} tidak membocorkan placeholder`, !/\bTODO\b|\bDRAF:/.test(isi));

    const d = deskripsi(r.teks);
    periksa(`${jalur} punya meta description`, d.length > 20, `${d.length} karakter`);
    deskripsiTerpakai.set(d, [...(deskripsiTerpakai.get(d) ?? []), jalur]);
  }

  console.log("\nB. Description tidak seragam");
  for (const [d, daftar] of deskripsiTerpakai) {
    if (daftar.length > 1 && d.length > 0) {
      periksa(
        `${daftar.length} halaman memakai description yang sama: ${daftar.join(", ")}`,
        false,
        d.slice(0, 50),
      );
    }
  }

  console.log("\nC. Data terstruktur");
  for (const h of HALAMAN) {
    const r = await minta(h.jalur);
    const adaLd = r.teks.includes('type="application/ld+json"');
    if (h.breadcrumb) {
      periksa(`${h.jalur} punya JSON-LD remah roti`, adaLd && r.teks.includes("BreadcrumbList"));
    } else if (h.ButuhJsonLd) {
      periksa(`${h.jalur} punya JSON-LD`, adaLd);
    }
  }

  console.log("\nD. Tombol WhatsApp");
  for (const { jalur } of HALAMAN) {
    const r = await minta(jalur);
    const adaTombol = r.teks.includes("wa.me/");
    periksa(
      `${jalur} ${waAktif ? "memiliki" : "tidak memiliki"} tombol WhatsApp`,
      adaTombol === waAktif,
    );
  }

  console.log("\nE. Halaman 404");
  const salah = await minta("/halaman-yang-salah-untuk-uji");
  periksa("status 404", salah.status === 404, `status=${salah.status}`);
  periksa("tidak diindeks", salah.teks.includes('content="noindex'));
  periksa("berbahasa Indonesia", teksTampak(salah.teks).includes("tidak ditemukan"));
  periksa("masih punya navigasi", salah.teks.includes('aria-label="Navigasi utama"'));
  periksa("menawarkan jalan keluar", (salah.teks.match(/href="\//g) ?? []).length >= 5);

  console.log("\nF. Galeri");
  const daftar = await minta("/galeri");
  const album = /href="\/galeri\/([^"]+)"/.exec(daftar.teks)?.[1];
  if (!album) {
    console.log("  (lewati: belum ada album untuk diperiksa)");
  } else {
    const detail = await minta(`/galeri/${album}`);
    periksa(`/galeri/${album} memuat foto`, detail.teks.includes("/media/"));
    periksa(
      "ukuran gambar responsif (srcset)",
      detail.teks.includes("srcSet") || detail.teks.includes("srcset"),
    );
    periksa(
      "keterangan foto ikut di markup",
      /figcaption[\s\S]{0,400}figurasi/.test(detail.teks) ||
        detail.teks.includes("<figcaption"),
    );
  }

  console.log(
    gagal === 0
      ? "\nSelesai: semua pemeriksaan halaman lulus."
      : `\nSelesai: ${gagal} pemeriksaan gagal.`,
  );
  if (gagal > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});