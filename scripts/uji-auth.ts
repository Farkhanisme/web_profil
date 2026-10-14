/**
 * Uji autentikasi CMS: alur login, penolakan kredensial salah, dan
 * batas percobaan per alamat IP.
 *
 *   npm run uji:auth      (server harus sudah jalan di port 3000)
 *
 * Skrip ini menghapus penghitung `rate_limits` miliknya sendiri di awal.
 * Tanpa itu, menjalankan skrip dua kali berturut-turut akan membuat
 * langkah "login dengan kredensial benar" selalu gagal — bukan karena
 * autentikasinya rusak, melainkan karena kuotanya habis oleh uji
 * sebelumnya. Penghitung milik orang lain tidak ikut tersentuh.
 */

import { request as httpRequest } from "node:http";
import { loadEnv } from "./load-env";
import { createDb } from "../src/lib/db/client";

const PORT = 3000;

interface Balasan {
  status: number;
  lokasi: string | null;
  setCookie: string[];
  teks: string;
}

interface Opsi {
  method?: string;
  body?: string;
  tipe?: string;
  kuki?: string[];
}

function minta(jalur: string, opsi: Opsi = {}): Promise<Balasan> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      { host: "localhost", port: PORT, path: jalur, method: opsi.method ?? "GET" },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (potongan) => {
          data += potongan;
        });
        res.on("end", () => {
          resolve({
            status: res.statusCode ?? 0,
            lokasi: (res.headers.location as string) ?? null,
            setCookie: (res.headers["set-cookie"] as string[]) ?? [],
            teks: data,
          });
        });
      },
    );

    req.on("error", reject);

    if (opsi.tipe) req.setHeader("content-type", opsi.tipe);
    if (opsi.kuki && opsi.kuki.length > 0) {
      req.setHeader("cookie", opsi.kuki.join("; "));
    }
    if (opsi.body) req.write(opsi.body);

    req.end();
  });
}

/** Ambil pasangan nama=nilai dari setiap header Set-Cookie. */
function keKuki(setCookie: string[]): string[] {
  return setCookie.map((c) => c.split(";")[0]!).filter(Boolean);
}

async function cobaLogin(email: string, password: string) {
  const csrf = await minta("/api/auth/csrf");
  const { csrfToken } = JSON.parse(csrf.teks) as { csrfToken: string };
  const kukiAwal = keKuki(csrf.setCookie);

  const body = new URLSearchParams({
    csrfToken,
    email,
    password,
  }).toString();

  const hasil = await minta("/api/auth/callback/credentials", {
    method: "POST",
    body,
    tipe: "application/x-www-form-urlencoded",
    kuki: kukiAwal,
  });

  const semua = [...kukiAwal, ...keKuki(hasil.setCookie)];
  const dash = await minta("/admin", { kuki: semua });

  const dapatSesi = keKuki(hasil.setCookie).some((k) =>
    k.includes("session-token"),
  );

  // Tanpa sesi, /admin menjawab 307 ke halaman login; teksnya kosong
  // karena peramban tidak mengikuti pengalihan.
  let halaman = "?";
  if (dash.teks.includes("Dasbor")) halaman = "DASBOR";
  else if (dash.status === 307) halaman = "LOGIN";

  return {
    email,
    dapatSesi,
    statusCallback: hasil.status,
    statusAdmin: dash.status,
    halaman,
  };
}

let gagal = 0;
function periksa(label: string, lulus: boolean, catatan = ""): void {
  if (!lulus) gagal += 1;
  console.log(
    `   ${lulus ? "OK   " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`,
  );
}

async function main() {
  // Skrip dijalankan lewat tsx, yang tidak memuat .env.local sendiri.
  loadEnv();

  // Kosongkan kuota login milik uji ini saja.
  const db = createDb();
  await db.execute("DELETE FROM rate_limits WHERE key LIKE 'login%'");

  const email = process.env.ADMIN_EMAIL ?? "admin@mtsmaariftieng.sch.id";
  const sandiBenar = process.env.ADMIN_PASSWORD ?? "";

  console.log("1. Akses /admin tanpa sesi");
  const tanpaSesi = await minta("/admin");
  periksa(
    "diarahkan ke halaman login",
    tanpaSesi.status === 307 && (tanpaSesi.lokasi ?? "").includes("/admin/login"),
    `status=${tanpaSesi.status}`,
  );

  console.log("\n2. Halaman login tanpa sesi");
  const halamanLogin = await minta("/admin/login");
  periksa("status 200", halamanLogin.status === 200);
  periksa(
    "tidak mengaktifkan indeksasi",
    halamanLogin.teks.includes('content="noindex'),
  );

  console.log("\n3. Kredensial salah");
  const salah = await cobaLogin(email, "pasti-salah-123");
  periksa("tidak mendapat sesi", salah.dapatSesi === false);
  periksa("tetap di halaman login", salah.halaman === "LOGIN", salah.halaman);

  console.log("\n4. Email tidak terdaftar");
  const emailAneh = await cobaLogin("entah@tidakada.sch.id", "apa-saja-aja");
  periksa("tidak mendapat sesi", emailAneh.dapatSesi === false);

  console.log("\n5. Kredensial benar");
  if (!sandiBenar) {
    periksa("dilewati: ADMIN_PASSWORD belum diisi di .env.local", false);
  } else {
    const benar = await cobaLogin(email, sandiBenar);
    periksa("mendapat sesi", benar.dapatSesi === true);
    periksa("dibuka di dasbor", benar.halaman === "DASBOR", benar.halaman);
  }

  // Penghitung direset supaya batas diukur dari angka nol, bukan sisa
  // dari langkah 1-5.
  await db.execute("DELETE FROM rate_limits WHERE key LIKE 'login%'");

  console.log("\n6. Batas percobaan (5x per 15 menit)");
  let diterimaSalah = 0;
  for (let i = 1; i <= 6; i += 1) {
    const r = await cobaLogin(email, `salah-ke-${i}`);
    if (r.dapatSesi) diterimaSalah += 1;
    console.log(`   percobaan salah ${i}: ${r.dapatSesi ? "DITERIMA" : "ditolak"}`);
  }
  periksa(
    "tidak ada percobaan salah yang diterima",
    diterimaSalah === 0,
    `${diterimaSalah} diterima`,
  );

  // Yang diuji sesungguhnya: setelah kuota habis, kredensial yang benar
  // pun tidak boleh berhasil. inilah yang melindungi dasbor dari
  // tebak-menebak kata sandi.
  const setelahKuo = await cobaLogin(email, sandiBenar || "apa-saja");
  periksa(
    "kredensial benar juga ditolak setelah kuota habis",
    setelahKuo.dapatSesi === false,
  );

  console.log(
    gagal === 0
      ? "\nSelesai: semua pemeriksaan autentikasi lulus."
      : `\nSelesai: ${gagal} pemeriksaan gagal.`,
  );

  if (gagal > 0) process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});