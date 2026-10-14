/**
 * Uji kontras warna Blok Warna Madrasah.
 *
 *   npm run cek:kontras
 *
 * Skrip ini membaca token warna yang benar-benar dipakai situs dari
 * `src/app/globals.css`, lalu menghitung rasionya dengan rumus WCAG 2.1
 * yang sama seperti di `src/lib/color.ts`.
 *
 * Kenapa perlu: regresi kontras/color happened ketika label kecil
 * memakai varian terang di atas blok pekat (`jingga-terang` di
 * `jingga` hanya 2,29:1).ylicately tidak ada yang gagal; hanya terlihat
 * kalau dihitung. Karena itu ambang minimum ditulis di sini, bukan
 * hanya di komentar.
 *
 * Tidak butuh server yang berjalan.
 */

import { readFileSync } from "node:fs";
import { join } from "node:path";
import { rasioKontras, hexKeRgb } from "../src/lib/color";

const AMBANG_teks = 4.5; // WCAG AA untuk teks normal
const AMBANG_BESAR = 3; // WCAG AA untuk teks besar dan komponen UI

type Pasangan = {
  nama: string;
  depan: string;
  latar: string;
  minimum: number;
  catatan?: string;
};

interface Hasil {
  nama: string;
  rasionya: number;
  minimum: number;
  catatan?: string;
}

/** Gabungkan dua warna dengan alpha (untuk `rgb(... / 0.6)`). */
function campur(atas: string, bawah: string, alpha: number): string {
  const a = hexKeRgb(atas);
  const b = hexKeRgb(bawah);
  if (!a || !b) throw new Error(`Warna tidak bisa dibaca: ${atas} / ${bawah}`);
  const camp = (x: number, y: number) => Math.round(x * alpha + y * (1 - alpha));
  const toHex = (n: number) => n.toString(16).padStart(2, "0");
  return `#${toHex(camp(a.r, b.r))}${toHex(camp(a.g, b.g))}${toHex(camp(a.b, b.b))}`;
}

/**
 * Baca nilai satu token dari blok `:root` di globals.css.
 *
 * Token sering ditulis sebagai alias, misalnya
 * `--primary: var(--hijau)`, jadi referensinya ikut ditelusuri sampai
 * ketemu warna heksadesimal.
 */
function bacaToken(css: string, nama: string, kedalaman = 0): string {
  const pola = new RegExp(`--${nama}:\\s*([^;]+);`);
  const cocok = pola.exec(css);
  if (!cocok) throw new Error(`Token --${nama} tidak ditemukan di globals.css`);
  const nilai = cocok[1]!.trim();

  if (/^#[0-9a-fA-F]{3,8}$/.test(nilai)) return nilai;

  const alias = /^var\(\s*--([a-z0-9-]+)\s*\)$/.exec(nilai);
  if (alias && kedalaman < 5) return bacaToken(css, alias[1]!, kedalaman + 1);

  throw new Error(`Token --${nama} tidak berisi warna heksadesimal: ${nilai}`);
}

const css = readFileSync(
  join(process.cwd(), "src/app/globals.css"),
  "utf8",
);

const t = (nama: string) => bacaToken(css, nama);

/*
 * Semua pasangan di bawah adalah kombinasi yang benar-benar muncul di
 * markup. `--wa-terang` sengaja tidak di sini sebagai latar teks.
 */
const PASANGAN: Pasangan[] = [
  // Blok pekat + judul dan paragraf besar
  { nama: "Judul putih di blok hijau", depan: "#ffffff", latar: t("hijau"), minimum: AMBANG_teks },
  { nama: "Paragraf putih di blok hijau", depan: "#ffffff", latar: t("hijau"), minimum: AMBANG_teks },
  { nama: "Judul putih di blok jingga", depan: "#ffffff", latar: t("jingga"), minimum: AMBANG_teks },
  { nama: "Judul putih di blok biru", depan: "#ffffff", latar: t("biru"), minimum: AMBANG_teks },
  { nama: "Label putih di blok hijau", depan: "#ffffff", latar: t("hijau"), minimum: AMBANG_teks },

  // Blok muda + teks tua
  { nama: "Teks utama di hijau muda", depan: t("hijau-tua"), latar: t("hijau-muda"), minimum: AMBANG_teks },
  { nama: "Teks utama di jingga muda", depan: t("jingga-tua"), latar: t("jingga-muda"), minimum: AMBANG_teks },
  { nama: "Teks utama di biru muda", depan: t("biru-tua"), latar: t("biru-muda"), minimum: AMBANG_teks },
  { nama: "Teks utama di kuning muda", depan: t("kuning-tua"), latar: t("kuning-muda"), minimum: AMBANG_teks },

  // Teks netral
  { nama: "Teks utama di putih", depan: t("tinta"), latar: t("putih"), minimum: AMBANG_teks },
  { nama: "Teks sekunder di putih", depan: t("tinta-2"), latar: t("putih"), minimum: AMBANG_teks },
  { nama: "Teks meta di putih", depan: t("tinta-3"), latar: t("putih"), minimum: AMBANG_teks },
  { nama: "Label jadwal di jingga muda", depan: t("tinta-2"), latar: t("jingga-muda"), minimum: AMBANG_teks, catatan: "tinta-3 hanya 4,15:1 di sini" },

  // Tombol WhatsApp
  {
    nama: "Teks tombol WhatsApp",
    depan: "#ffffff",
    latar: t("wa"),
    minimum: AMBANG_teks,
    catatan: "hijau asli #25d366 hanya 1,98:1 dan tidak boleh jadi latar teks",
  },
  { nama: "Teks tombol WhatsApp saat hover", depan: "#ffffff", latar: t("wa-gelap"), minimum: AMBANG_teks },

  // Footer gelap
  { nama: "Teks footer di tinta", depan: t("putih"), latar: t("tinta"), minimum: AMBANG_teks },

  // Token semantik CMS
  { nama: "Tombol utama CMS", depan: t("primary-foreground"), latar: t("primary"), minimum: AMBANG_teks },
  { nama: "Teks utama CMS", depan: t("foreground"), latar: t("card"), minimum: AMBANG_teks },
  { nama: "Teks sekunder CMS", depan: t("muted-foreground"), latar: t("muted"), minimum: AMBANG_teks },
  { nama: "Label CMS di latar lembut", depan: t("primary"), latar: t("primary-soft"), minimum: AMBANG_teks },
  { nama: "Tombol hapus CMS", depan: t("destructive-foreground"), latar: t("destructive"), minimum: AMBANG_teks },
  { nama: "Cincin fokus CMS", depan: t("ring"), latar: t("background"), minimum: AMBANG_BESAR },

  // Kartu statistik di beranda: hijau tua 60% di atas hijau
  {
    nama: "Angka statistik di beranda",
    depan: "#ffffff",
    latar: campur(t("hijau-tua"), t("hijau"), 0.6),
    minimum: AMBANG_teks,
  },

  // Ekstrakurikuler: kartu gelap di dalam blok jingga
  { nama: "Jadwal ekstrakurikuler", depan: "#ffffff", latar: t("jingga-tua"), minimum: AMBANG_teks },
];

function hitung(p: Pasangan): Hasil | null {
  const depan = hexKeRgb(p.depan);
  const latar = hexKeRgb(p.latar);
  if (!depan || !latar) return null;
  return {
    nama: p.nama,
    rasionya: rasioKontras(depan, latar),
    minimum: p.minimum,
    catatan: p.catatan,
  };
}

function main() {
  console.log("Pemeriksaan kontras warna (WCAG 2.1)\n");

  let gagal = 0;

  for (const p of PASANGAN) {
    const hasil = hitung(p);
    if (!hasil) {
      console.log(`  GAGAL ${p.nama} — warna tidak bisa dibaca`);
      gagal += 1;
      continue;
    }
    const ok = hasil.rasionya >= hasil.minimum;
    if (!ok) gagal += 1;
    console.log(
      `  ${ok ? "OK   " : "GAGAL"} ${hasil.nama}: ${hasil.rasionya.toFixed(2)}:1 (minimal ${hasil.minimum}:1)` +
        (hasil.catatan ? ` — ${hasil.catatan}` : ""),
    );
  }

  console.log("");
  if (gagal === 0) {
    console.log(`Selesai: ${PASANGAN.length} pasangan warna lolos.`);
  } else {
    console.log(`Selesai: ${gagal} pasangan warna gagal.`);
    process.exit(1);
  }
}

main();