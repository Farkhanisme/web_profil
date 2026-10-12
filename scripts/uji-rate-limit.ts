/**
 * Uji batas login: 6 percobaan salah berturut-turut.
 * Seharusnya percobaan ke-6 ditolak karena kuota 5 per 15 menit habis,
 * lalu kredensial benar juga ditolak karena IP sedang terkunci.
 *
 *   npx tsx scripts/uji-rate-limit.ts
 */

import { request as httpRequest } from "node:http";

const PORT = Number(new URL(process.env.BASE_URL ?? "http://localhost:3000").port);

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
    const req = httpRequest(
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

const keKuki = (setCookie: string[]) =>
  setCookie.map((c) => c.split(";")[0]!).filter(Boolean);

async function coba(email: string, password: string) {
  const csrf = await minta("/api/auth/csrf");
  const { csrfToken } = JSON.parse(csrf.teks) as { csrfToken: string };
  const awal = keKuki(csrf.setCookie);

  const hasil = await minta("/api/auth/callback/credentials", {
    method: "POST",
    body: new URLSearchParams({ csrfToken, email, password }).toString(),
    tipe: "application/x-www-form-urlencoded",
    kuki: awal,
  });

  const dapatSesi = keKuki(hasil.setCookie).some((k) => k.includes("session-token"));
  return { dapatSesi, lokasi: hasil.status };
}

async function main() {
  const email = process.env.ADMIN_EMAIL ?? "admin@mtsmaariftieng.sch.id";
  const sandiBenar = process.env.ADMIN_PASSWORD ?? "";

  console.log("Uji batas login (kuota 5 per 15 menit)\n");

  for (let i = 1; i <= 6; i += 1) {
    const r = await coba(email, `kata-sandi-salah-${i}`);
    console.log(
      `  percobaan salah ke-${i}: dapatSesi=${r.dapatSesi} (harus false)`,
    );
  }

  console.log("\n  sekarang mencoba kredensial benar dari IP yang sama...");
  const terkunci = await coba(email, sandiBenar);
  console.log(
    `  dapatSesi=${terkunci.dapatSesi} (harus false karena IP terkunci)`,
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
