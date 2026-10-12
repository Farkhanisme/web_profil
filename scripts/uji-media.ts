/**
 * Uji pipeline media: unggah lewat route admin, lalu ambil lewat proxy
 * `/media/[id]` pada beberapa lebar.
 *
 *   npx tsx scripts/uji-media.ts
 *
 * Membutuhkan server dev berjalan dan kredensial admin di .env.local.
 */

import { request as httpRequest } from "node:http";
import { loadEnv } from "./load-env";

loadEnv();

const PORT = Number(new URL(process.env.BASE_URL ?? "http://localhost:3000").port);
const EMAIL = process.env.ADMIN_EMAIL ?? "";
const SANDI = process.env.ADMIN_PASSWORD ?? "";

interface Balasan {
  status: number;
  setCookie: string[];
  location: string | null;
  buffer: Buffer;
  headers: Record<string, string | string[] | undefined>;
}

function minta(
  jalur: string,
  opsi: {
    method?: string;
    body?: Buffer | string;
    tipe?: string;
    kuki?: string[];
  } = {},
): Promise<Balasan> {
  return new Promise((resolve, reject) => {
    const req = httpRequest(
      { host: "localhost", port: PORT, path: jalur, method: opsi.method ?? "GET" },
      (res) => {
        const bagian: Buffer[] = [];
        res.on("data", (p) => bagian.push(Buffer.from(p)));
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            setCookie: (res.headers["set-cookie"] as string[]) ?? [],
            location: (res.headers.location as string) ?? null,
            headers: res.headers,
            buffer: Buffer.concat(bagian),
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
  const { csrfToken } = JSON.parse(csrf.buffer.toString()) as { csrfToken: string };
  const awal = keKuki(csrf.setCookie);

  const body = new URLSearchParams({
    csrfToken,
    email: EMAIL,
    password: SANDI,
  }).toString();

  const hasil = await minta("/api/auth/callback/credentials", {
    method: "POST",
    body,
    tipe: "application/x-www-form-urlencoded",
    kuki: awal,
  });

  const kuki = [...awal, ...keKuki(hasil.setCookie)];
  if (!kuki.some((k) => k.includes("session-token"))) {
    throw new Error("Gagal login. Cek ADMIN_EMAIL / ADMIN_PASSWORD.");
  }
  return kuki;
}

/** Buat gambar uji berukuran lebar tertentu. */
async function buatGambar(lebar: number, tinggi: number): Promise<Buffer> {
  const sharp = (await import("sharp")).default;
  return sharp({
    create: {
      width: lebar,
      height: tinggi,
      channels: 3,
      background: { r: 4, g: 120, b: 87 },
    },
  })
    .webp()
    .toBuffer();
}

/** Bentuk payload multipart/form-data secara manual. */
function multipart(
  field: string,
  filename: string,
  mime: string,
  data: Buffer,
): { body: Buffer; contentType: string } {
  const batas = "----ujiMediaBoundary1234567890";
  const kepala = Buffer.from(
    `--${batas}\r\n` +
      `Content-Disposition: form-data; name="${field}"; filename="${filename}"\r\n` +
      `Content-Type: ${mime}\r\n\r\n`,
    "utf8",
  );
  const ekor = Buffer.from(`\r\n--${batas}--\r\n`, "utf8");
  return {
    body: Buffer.concat([kepala, data, ekor]),
    contentType: `multipart/form-data; boundary=${batas}`,
  };
}

async function main() {
  console.log("Uji pipeline media\n");

  const kuki = await login();
  console.log("1. Login admin: BERHASIL");

  // Unggah harus ditolak tanpa sesi.
  const tanpaSesi = await minta("/api/admin/media", {
    method: "POST",
    body: multipart("file", "a.webp", "image/webp", await buatGambar(2000, 1200)).body,
    tipe: multipart("file", "a.webp", "image/webp", Buffer.alloc(10)).contentType,
  });
  console.log(
    `2. Unggah tanpa sesi -> status=${tanpaSesi.status} (harus 401)`,
  );

  // Unggah asli.
  const gambar = await buatGambar(2000, 1200);
  const mp = multipart("file", "gedung.webp", "image/webp", gambar);
  const unggah = await minta("/api/admin/media", {
    method: "POST",
    body: mp.body,
    tipe: mp.contentType,
    kuki,
  });
  console.log(
    `3. Unggah 2000x1200 WebP (${(gambar.byteLength / 1024).toFixed(1)} KB) -> status=${unggah.status}`,
  );

  if (unggah.status !== 200) {
    console.log("   BALASAN:", unggah.buffer.toString().slice(0, 300));
    return;
  }

  const data = JSON.parse(unggah.buffer.toString()) as {
    id: string;
    width: number;
    height: number;
    storage: string;
  };
  console.log(
    `   id=${data.id} ukuran=${data.width}x${data.height} penyimpanan=${data.storage}`,
  );

  // Ambil lewat proxy pada berbagai lebar.
  console.log("4. Pengambilan lewat /media/[id]:");
  for (const w of [null, 240, 480, 800, 1600]) {
    const suffix = w === null ? "" : `?w=${w}`;
    const res = await minta(`/media/${data.id}${suffix}`, { kuki });
    const cache = res.headers["cache-control"] ?? "";
    const tipe = res.headers["content-type"] ?? "";
    console.log(
      `   w=${String(w ?? "asis").padEnd(4)} status=${res.status} bytes=${res.buffer.byteLength
        .toString()
        .padStart(7)} tipe=${tipe} cache="${cache}"`,
    );
  }

  // Lebar tidak diizinkan -> diabaikan, bukan error.
  const takDiizinkan = await minta(`/media/${data.id}?w=9999`, { kuki });
  console.log(
    `5. Lebar tidak diizinkan (w=9999) -> status=${takDiizinkan.status} (harus 200, diabaikan)`,
  );

  // Id tidak ada -> placeholder 404.
  const hilang = await minta("/media/tidak-ada-sama-sekali");
  console.log(
    `6. Id tidak dikenal -> status=${hilang.status} bytes=${hilang.buffer.byteLength} (placeholder)`,
  );

  // Pastikan token bot tidak bocor ke klien.
  const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
  if (token) {
    const html = await minta("/");
    const bocor = html.buffer.toString().includes(token);
    console.log(`7. Token bot bocor ke HTML publik: ${bocor} (harus false)`);
  } else {
    console.log("7. Token bot kosong (mode lokal) - pemeriksaan kebocoran dilewati");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
