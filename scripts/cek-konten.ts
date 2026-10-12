/**
 * Laporan konten yang masih berupa placeholder.
 *
 *.placeholders di halaman publik akan kepada mesin AI dan calon orang tua.
 * Jalankan skrip ini sebelum rilis untuk memastikan tidak ada sisa.
 *
 *   npm run cek:konten
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { loadEnv } from "./load-env";
import { createDb } from "../src/lib/db/client";

loadEnv();

/**
 * Hanya berkas yang berisi KONTEN. Komponen yang memeriksa placeholder
 * (misalnya `startsWith("TODO")`) sengaja tidak ikut dipindai, karena
 * kemunculan kata TODO di sana justru alat untuk menyembunyikan placeholder.
 */
const BERKAS = [
  "src/config/site.ts",
  "src/config/profil.ts",
  "src/app/(public)/page.tsx",
  "src/app/(public)/kebijakan-privasi/page.tsx",
  "src/components/site/hero.tsx",
  "src/components/site/statistik.tsx",
];

interface Temuan {
  berkas: string;
  baris: number;
  teks: string;
}

function pindai(): Temuan[] {
  const hasil: Temuan[] = [];

  for (const relatif of BERKAS) {
    const isi = readFileSync(join(process.cwd(), relatif), "utf8");
    const baris = isi.split("\n");

    baris.forEach((teks, i) => {
      // Hanya baris isi data: komentar dan baris kode dilewati.
      const bersih = teks.trim();
      if (
        bersih.startsWith("//") ||
        bersih.startsWith("*") ||
        bersih.startsWith("/*")
      ) {
        return;
      }
      // Kode yang memeriksa placeholder juga dilewati: kemunculan kata
      // TODO di sana justru alat untuk menyembunyikannya dari pembaca.
      if (
        bersih.includes("=>") ||
        bersih.includes(".filter(") ||
        bersih.includes('includes("TODO') ||
        bersih.includes('startsWith("TODO")') ||
        bersih.includes('includes("DRAF:")')
      ) {
        return;
      }
      if (bersih.includes("DRAF:") || bersih.includes("TODO")) {
        hasil.push({ berkas: relatif, baris: i + 1, teks: bersih.slice(0, 110) });
      }
    });
  }

  return hasil;
}

async function periksaDatabase(): Promise<string[]> {
  const db = createDb();
  const catatan: string[] = [];

  const settings = await db.execute(
    "SELECT key, value FROM settings WHERE key = 'logo_media_id'",
  );
  if (settings.rows.length === 0 || !settings.rows[0]?.value) {
    catatan.push("Logo sekolah belum diunggah lewat CMS (/admin/settings).");
  }

  const tabel: Array<[string, string]> = [
    ["staff", "guru dan staf"],
    ["programs", "program sekolah"],
    ["extracurriculars", "ekstrakurikuler"],
    ["albums", "album galeri"],
  ];

  for (const [nama, label] of tabel) {
    const r = await db.execute(`SELECT count(*) AS c FROM ${nama}`);
    const jumlah = Number(r.rows[0]?.c ?? 0);
    if (jumlah === 0) {
      catatan.push(`Belum ada data ${label} (tabel ${nama}).`);
    }
  }

  const contoh = await db.execute(
    "SELECT count(*) AS c FROM staff WHERE id LIKE 'demo-%'",
  );
  if (Number(contoh.rows[0]?.c ?? 0) > 0) {
    catatan.push(
      `Masih ada ${contoh.rows[0]?.c} baris data contoh (awalan id "demo-") yang harus dihapus.`,
    );
  }

  return catatan;
}

async function main() {
  console.log("Laporan kesiapan konten\n");

  const temuan = pindai();
  console.log(`A. Placeholder di berkas (${temuan.length})`);
  if (temuan.length === 0) {
    console.log("   Tidak ada. Semua teks sudah terisi.");
  } else {
    const perBerkas = new Map<string, Temuan[]>();
    for (const t of temuan) {
      const arr = perBerkas.get(t.berkas) ?? [];
      arr.push(t);
      perBerkas.set(t.berkas, arr);
    }
    for (const [berkas, daftar] of perBerkas) {
      console.log(`\n   ${berkas}`);
      for (const t of daftar) {
        console.log(`     baris ${t.baris}: ${t.teks}`);
      }
    }
  }

  console.log(`\nB. Isi database`);
  const catatan = await periksaDatabase();
  if (catatan.length === 0) {
    console.log("   Semua lengkap.");
  } else {
    for (const c of catatan) console.log(`   - ${c}`);
  }

  const total = temuan.length + catatan.length;
  console.log(
    total === 0
      ? "\nSelesai: tidak ada placeholder yang tersisa."
      : `\nSisa ${total} hal yang perlu dilengkapi sebelum rilis.`,
  );

  // Dengan --strict, build rilis berhenti di sini. Tanpa flag tersebut
  // skrip hanya melaporkan, supaya pengembangan tidak terhalang.
  if (total > 0 && process.argv.includes("--strict")) {
    console.error(
      "\nBuild rilis dibatalkan: masih ada placeholder yang akan tampil di\n" +
        "halaman publik. Ganti datanya, atau jalankan tanpa --strict bila\n" +
        "ini memang hanya pemeriksaan.",
    );
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});