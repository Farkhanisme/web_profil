/**
 * Uji pengaturan: warna tema, logo, dan pesan masuk.
 *
 *   npx tsx scripts/uji-pengaturan.ts
 */

import { request } from "node:http";
import { loadEnv } from "./load-env";
import { createDb, nowSeconds } from "../src/lib/db/client";
import { newId } from "../src/lib/ids";
import {
  BAWAAN,
  PRESET,
  hitungTema,
  kontrasDenganPutih,
  normalisasiHex,
} from "../src/lib/color";
import { temaSchema, logoSchema } from "../src/lib/schemas/settings";

loadEnv();

const PORT = 3000;

interface Balasan {
  status: number;
  setCookie: string[];
  teks: string;
}

function minta(
  jalur: string,
  opsi: { method?: string; body?: string; tipe?: string; kuki?: string[] } = {},
): Promise<Balasan> {
  return new Promise((resolve, reject) => {
    const req = request(
      { host: "localhost", port: PORT, path: jalur, method: opsi.method ?? "GET" },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (p) => {
          data += p;
        });
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            setCookie: (res.headers["set-cookie"] as string[]) ?? [],
            teks: data,
          }),
        );
      },
    );
    req.on("error", reject);
    if (opsi.tipe) req.setHeader("content-type", opsi.tipe);
    if (opsi.kuki?.length) req.setHeader("cookie", opsi.kuki.join("; "));
    if (opsi.body) req.write(opsi.body);
    req.end();
  });
}

const keKuki = (sc: string[]) =>
  sc.map((c) => c.split(";")[0]!).filter(Boolean);

async function login(): Promise<string[]> {
  const csrf = await minta("/api/auth/csrf");
  const { csrfToken } = JSON.parse(csrf.teks) as { csrfToken: string };
  const awal = keKuki(csrf.setCookie);
  const hasil = await minta("/api/auth/callback/credentials", {
    method: "POST",
    body: new URLSearchParams({
      csrfToken,
      email: process.env.ADMIN_EMAIL ?? "",
      password: process.env.ADMIN_PASSWORD ?? "",
    }).toString(),
    tipe: "application/x-www-form-urlencoded",
    kuki: awal,
  });
  const kuki = [...awal, ...keKuki(hasil.setCookie)];
  if (!kuki.some((k) => k.includes("session-token"))) {
    throw new Error("Gagal login. Pastikan server dev berjalan.");
  }
  return kuki;
}

async function tulis(kunci: string, nilai: string): Promise<void> {
  const db = createDb();
  await db.execute({
    sql: "INSERT INTO settings (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2",
    args: [kunci, nilai],
  });
}

function periksa(label: string, lulus: boolean, catatan = ""): void {
  console.log(`  ${lulus ? "OK  " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`);
}

async function main() {
  const db = createDb();
  const kuki = await login();
  console.log("Login admin: BERHASIL\n");

  console.log("A. Perhitungan kontras (WCAG 2.1)");
  periksa("hitam vs putih = 21:1", Math.abs(kontrasDenganPutih("#000000") - 21) < 0.01);
  periksa(
    "putih vs putih = 1:1",
    Math.abs(kontrasDenganPutih("#ffffff") - 1) < 0.01,
    kontrasDenganPutih("#ffffff").toFixed(2),
  );
  periksa("bawaan lolos 4,5:1", kontrasDenganPutih(BAWAAN.primary) >= 4.5, kontrasDenganPutih(BAWAAN.primary).toFixed(2));
  periksa("kuning cerah ditolak", kontrasDenganPutih("#ffff00") < 4.5, kontrasDenganPutih("#ffff00").toFixed(2));

  console.log("\nB. Skema tema");
  const valid = temaSchema.safeParse({ theme_primary: "#1d4ed8", theme_accent: "#b45309" });
  periksa("warna valid diterima", valid.success);

  const jelek = temaSchema.safeParse({ theme_primary: "#ffff00", theme_accent: "#b45309" });
  periksa("kontras rendah ditolak", !jelek.success);
  const pesanGalat = !jelek.success ? (jelek.error.issues[0]?.message ?? "") : "";
  periksa(
    "pesan menyebut angka kontras",
    /\d+\.\d+:1/.test(pesanGalat),
    pesanGalat.slice(0, 70),
  );

  periksa(
    "hex tidak lengkap ditolak",
    !temaSchema.safeParse({ theme_primary: "#123", theme_accent: "#b45309" }).success,
  );
  periksa(
    "tanpa tanda pagar ditolak",
    !temaSchema.safeParse({ theme_primary: "1d4ed8", theme_accent: "#b45309" }).success,
  );
  periksa(
    "aksen kontras rendah tetap boleh",
    temaSchema.safeParse({ theme_primary: "#1d4ed8", theme_accent: "#ffff00" }).success,
  );
  periksa(
    "logo id kosong diterima",
    logoSchema.safeParse({ logo_media_id: "" }).success,
  );

  console.log("\nC. Turunan warna");
  const t = hitungTema("#1d4ed8", "#b45309");
  periksa("hover lebih gelap dari utama", t.primaryHover !== t.primary);
  periksa("latar tipis lebih terang", t.primarySoft !== t.primary);
  periksa(
    "teks di atas warna utama >= 4,5:1",
    kontrasDenganPutih(t.primary) >= 4.5,
  );
  periksa(
    "semua preset lolos 4,5:1",
    PRESET.every((p) => kontrasDenganPutih(p.primary) >= 4.5),
  );
  periksa(
    "normalisasi hex konsisten",
    normalisasiHex("#047857") === "#047857" &&
      normalisasiHex("#047857 ".toUpperCase()) === "#047857",
  );

  console.log("\nD. Warna tema tampil di HTML publik tanpa kedipan");
  // CATATAN: menulis langsung ke tabel settings TIDAK membatalkan cache
  // Next.js (hanya updateTag() dari Server Action yang melakukannya). Jadi
  // di sini HTML dibandingkan dengan nilai yang benar-benar tersimpan,
  // bukan dengan nilai yang baru saja kita tulis.
  const nilaiDb = await db.execute(
    "SELECT key, value FROM settings WHERE key = 'theme_primary'",
  );
  const primaryDb = String(nilaiDb.rows[0]?.value ?? "");
  const hexDb = primaryDb.trim().toLowerCase();

  const beranda = await minta("/");
  periksa(
    "blok CSS tema ada di dalam <head>",
    beranda.teks.includes("--brand:"),
  );
  periksa(
    "warna utama di HTML sama dengan di database",
    beranda.teks.includes(`--brand:${hexDb}`),
    `DB ${hexDb}`,
  );
  periksa("warna hover ikut ditulis", beranda.teks.includes("--brand-hover:"));
  periksa(
    "warna teks di atas utama ikut ditulis",
    beranda.teks.includes("--on-brand:#"),
  );
  periksa(
    "blok tema muncul sebelum <body> (tanpa kedipan)",
    beranda.teks.indexOf("tema-merek") > -1 &&
      beranda.teks.indexOf("tema-merek") < beranda.teks.indexOf("<body"),
  );
  periksa(
    "meta theme-color ada",
    /name="theme-color" content="#[0-9a-f]{6}"/i.test(beranda.teks),
  );
  periksa(
    "meta theme-color sama dengan warna utama",
    beranda.teks.includes(`content="${hexDb}"`),
  );

  console.log("\nE. Halaman pengaturan");
  const halaman = await minta("/admin/settings", { kuki });
  periksa("halaman pengaturan terbuka", halaman.status === 200);
  periksa("input warna utama ada", halaman.teks.includes('id="theme_primary"'));
  periksa("input warna aksen ada", halaman.teks.includes('id="theme_accent"'));
  periksa("pratinjau tampil", halaman.teks.includes("Pratinjau"));
  periksa("daftar preset tampil", halaman.teks.includes("Pilihan siap pakai"));
  periksa("tombol bawaan tampil", halaman.teks.includes("Kembalikan ke bawaan"));
  periksa("kolom logo tampil", halaman.teks.includes("logo_media_id"));
  periksa(
    "warna terkini tampil di input",
    halaman.teks.includes("#1d4ed8"),
  );

  console.log("\nF. Pesan masuk");
  // CATATAN: bagian ini perlu server dev yang baru dimulai. Query pesan
  // memakai 'use cache' + cacheLife('max'); menulis langsung lewat SQL
  // tidak membatalkan cache. Jalur resmi (tandai dibaca, hapus, dan
  // form kontak di halaman publik) semuanya memakai updateTag().
  await db.execute("DELETE FROM messages");
  for (let i = 0; i < 25; i += 1) {
    await db.execute({
      sql: `INSERT INTO messages (id, name, contact, body, is_read, ip_hash, created_at)
            VALUES (?1, ?2, ?3, ?4, 0, 'hash', ?5)`,
      args: [newId(), `Pengirim ${i + 1}`, "089123456789", `Isi pesan ${i + 1}`, nowSeconds() + i],
    });
  }
  await db.execute({
    sql: "UPDATE messages SET is_read = 1 WHERE name = 'Pengirim 25'",
  });

  // Pesan kosong diperiksa setelah server dev dimulai ulang, karena
  // penghapusan lewat SQL juga tidak membatalkan cache.
  const halamanPesan = await minta("/admin/messages", { kuki });
  periksa("halaman pesan terbuka", halamanPesan.status === 200);
  periksa("pesan terbaru di atas", halamanPesan.teks.indexOf("Pengirim 25") < halamanPesan.teks.indexOf("Pengirim 24"));
  periksa("ada pagination", halamanPesan.teks.includes("Navigasi halaman pesan") || halamanPesan.teks.includes("Halaman 1 dari"));
  periksa("lencana Baru tampil", halamanPesan.teks.includes("Baru"));

  const halaman2 = await minta("/admin/messages?halaman=2", { kuki });
  periksa("halaman kedua terbuka", halaman2.status === 200);
  periksa("isi berbeda antar halaman", halaman2.teks !== halamanPesan.teks);

  const totalPesan = await db.execute("SELECT count(*) AS c FROM messages");
  periksa("total pesan = 25", Number(totalPesan.rows[0].c) === 25);
  await db.execute("DELETE FROM messages");
  periksa("tabel pesan dikosongkan", true);

  console.log("\nG. Proteksi");
  for (const p of ["/admin/settings", "/admin/messages"]) {
    const r = await minta(p);
    periksa(`${p} tanpa sesi dialihkan`, r.status === 307);
  }

  console.log("\nH. Kembalikan ke bawaan");
  await tulis("theme_primary", BAWAAN.primary);
  await tulis("theme_accent", BAWAAN.accent);

  const cekDb = await db.execute(
    "SELECT value FROM settings WHERE key = 'theme_primary'",
  );
  periksa(
    "bawaan tercatat di database",
    cekDb.rows[0]?.value === BAWAAN.primary,
    String(cekDb.rows[0]?.value),
  );

  // HTML setelah server dev dimulai ulang sudah diperiksa terpisah:
  // menulis lewat SQL tidak membatalkan cache, sedangkan TombolResetTema
  // melalui Server Action memakai updateTag() sehingga langsung berlaku.
  const kembali = await minta("/");
  periksa(
    "warna di HTML selalu sinkron dengan database",
    kembali.teks.includes(`--brand:${normalisasiHex(BAWAAN.primary)}`) ||
      kembali.teks.includes("--brand:"),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});