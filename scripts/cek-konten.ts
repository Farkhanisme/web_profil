/**
 * Laporan konten yang masih berupa placeholder.
 *
 *.placeholders di halaman publik akan kepada mesin AI dan calon orang tua.
 * Jalankan skrip ini sebelum rilis untuk memastikan tidak ada sisa.
 *
 *   npm run cek:konten
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { loadEnv } from "./load-env";
import { createDb } from "../src/lib/db/client";
import { whatsappTerisi, terisi, type IsiSitus } from "../src/lib/konten";

loadEnv();

/**
 * Hanya berkas yang berisi KONTEN. Komponen yang memeriksa placeholder
 * (misalnya `startsWith("TODO")`) sengaja tidak ikut dipindai, karena
 * kemunculan kata TODO di sana justru alat untuk menyembunyikan placeholder.
 *
 * Daftar ini menyesuaikan struktur folder yang sedang dipakai. Berkas yang
 * sudah dipindah tidak boleh membuat skrip ini berhenti dengan galat —
 * lebih baik dilewati pelan daripada menutupi laporan.
 */
const BERKAS = [
  "src/config/site.ts",
  "src/config/profil.ts",
  "src/app/page.tsx",
  "src/app/profil/page.tsx",
  "src/app/kebijakan-privasi/page.tsx",
  "src/app/kontak/page.tsx",
];

/**
 * Nomor contoh yang pernah bocor ke halaman publik. Bentuknya angka biasa,
 * jadi `masihPlaceholder` tidak menangkapnya; tapi dampaknya besar karena
 * tombol WhatsApp mengarah ke nomor milik orang lain.
 */
const NOMOR_CONTOH = ["6281234567890"];

interface Temuan {
  berkas: string;
  baris: number;
  teks: string;
}

function pindai(): Temuan[] {
  const hasil: Temuan[] = [];

  for (const relatif of BERKAS) {
    const jalur = join(process.cwd(), relatif);

    if (!existsSync(jalur)) {
      console.warn(`   (melewati berkas yang sudah tidak ada: ${relatif})`);
      continue;
    }

    const isi = readFileSync(jalur, "utf8");
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
        bersih.includes('includes("DRAF:")') ||
        bersih.includes("NOMOR_CONTOH")
      ) {
        return;
      }
      if (bersih.includes("DRAF:") || bersih.includes("TODO")) {
        hasil.push({ berkas: relatif, baris: i + 1, teks: bersih.slice(0, 110) });
        return;
      }
      for (const nomor of NOMOR_CONTOH) {
        if (bersih.includes(nomor)) {
          hasil.push({
            berkas: relatif,
            baris: i + 1,
            teks: `NOMOR CONTOH: ${bersih.slice(0, 90)}`,
          });
          return;
        }
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

  // Nomor WhatsApp di database. Nilai kosong atau bertanda TODO tidak
  // masalah karena tombolnya sengaja disembunyikan. Yang berbahaya adalah
  // nomor yang tampak "terisi" tetapi bukan nomor asli: bentuknya lolos
  // pemeriksaan, tombol pun muncul, hanya saja mengarah ke nomor orang lain.
  const wa = await db.execute("SELECT whatsapp FROM profil_content WHERE id = 1");
  const barisWa = wa.rows[0] as { whatsapp?: string | null } | undefined;
  const nomorWa = barisWa?.whatsapp?.trim() ?? "";

  if (
    nomorWa !== "" &&
    terisi(nomorWa) &&
    !whatsappTerisi({ whatsapp: nomorWa } as IsiSitus["contact"])
  ) {
    catatan.push(
      `Nomor WhatsApp di CMS ("${nomorWa}") bukan nomor yang bisa dipakai. ` +
        "Ganti dengan nomor resmi sekolah atau kosongkan agar tombol disembunyikan.",
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