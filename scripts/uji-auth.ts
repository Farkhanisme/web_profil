/**
 * Uji alur autentikasi admin terhadap server yang sedang berjalan.
 *
 *   npx tsx scripts/uji-auth.ts
 *
 * Pakai node:http langsung (bukan fetch) supaya header Set-Cookie bisa
 * dibaca apa adanya.
 */

import { request as httpRequest } from "node:http";

const BASE = process.env.BASE_URL ?? "http://localhost:3000";
const HOST = "localhost";
const PORT = Number(new URL(BASE).port || 3000);

interface Balasan {
  status: number;
  lokasi: string | null;
  setCookie: string[];
  teks: string;
}

function minta(
  jalur: string,
  opsi: { method?: string; body?: string; tipe?: string; kuki?: string[] } = {},
): Promise<Balasan> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      { host: HOST, port: PORT, path: jalur, method: opsi.method ?? "GET" },
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

  let halaman = "?";
  if (dash.teks.includes("Dasbor")) halaman = "DASBOR (berhasil)";
  else if (dash.teks.includes("Masuk ke CMS")) halaman = "LOGIN (ditolak)";

  return {
    email,
    dapatSesi,
    statusCallback: hasil.status,
    statusAdmin: dash.status,
    halaman,
  };
}

async function main() {
  console.log(`Menguji ${BASE}\n`);

  const tanpaSesi = await minta("/admin");
  console.log("1. /admin tanpa login");
  console.log(`   status=${tanpaSesi.status} lokasi=${tanpaSesi.lokasi}`);

  const halamanLogin = await minta("/admin/login");
  console.log(
    `2. /admin/login tanpa login -> status=${halamanLogin.status} (harus 200)`,
  );

  const email = process.env.ADMIN_EMAIL ?? "admin@mtsmaariftieng.sch.id";
  const sandiBenar = process.env.ADMIN_PASSWORD ?? "";

  console.log("");
  const salah = await cobaLogin(email, "pasti-salah-123");
  console.log("3. Login dengan kata sandi salah");
  console.log(
    `   statusCallback=${salah.statusCallback} dapatSesi=${salah.dapatSesi} halaman=${salah.halaman}`,
  );

  const emailAneh = await cobaLogin("entah@tidakada.sch.id", "apa-saja-aja");
  console.log("4. Login dengan email tidak terdaftar");
  console.log(
    `   statusCallback=${emailAneh.statusCallback} dapatSesi=${emailAneh.dapatSesi} halaman=${emailAneh.halaman}`,
  );

  if (sandiBenar) {
    const benar = await cobaLogin(email, sandiBenar);
    console.log("5. Login dengan kredensial benar");
    console.log(
      `   statusCallback=${benar.statusCallback} dapatSesi=${benar.dapatSesi} halaman=${benar.halaman}`,
    );
  } else {
    console.log("5. Dilewati: ADMIN_PASSWORD tidak ada di environment.");
  }

  console.log("\n6. Uji batas percobaan login (5x per 15 menit)");
  for (let i = 1; i <= 7; i += 1) {
    const r = await cobaLogin(email, `salah-ke-${i}`);
    console.log(`   percobaan ke-${i}: statusCallback=${r.statusCallback} halaman=${r.halaman}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
