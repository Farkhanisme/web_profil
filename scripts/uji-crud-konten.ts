/**
 * Uji modul program dan ekstrakurikuler: slug otomatis, keunikan slug,
 * validasi skema, tampilan halaman, dan proteksi.
 *
 *   npx tsx scripts/uji-crud-konten.ts
 */

import { request } from "node:http";
import { loadEnv } from "./load-env";
import { createDb, nowSeconds } from "../src/lib/db/client";
import { buatSlug, slugValid } from "../src/lib/slug";
import { programSchema, ekstrakurikulerSchema } from "../src/lib/schemas/konten";

loadEnv();

const PORT = 3000;

interface Balasan {
  status: number;
  setCookie: string[];
  teks: string;
}

/**
 * React menyisipkan komentar `<!-- -->` di antara dua teks yang berdekatan
 * saat merender di server. Komentar itu dibuang sebelum pencarian supaya
 * pemeriksaan teks tidak salah menilai.
 */
function teksBersih(html: string): string {
  return html.replace(/<!--.*?-->/g, "");
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

function periksa(label: string, lulus: boolean, catatan = ""): void {
  console.log(`  ${lulus ? "OK  " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`);
}

async function main() {
  const db = createDb();
  const kuki = await login();
  console.log("Login admin: BERHASIL\n");

  console.log("A. Pembuatan slug");
  const contohSlug: Array<[string, string]> = [
    ["Program Pembelajaran Tematik", "program-pembelajaran-tematik"],
    ["Rohani Islam (ROIS)", "rohani-islam-rois"],
    ["  Pramuka  ", "pramuka"],
    ["Ekstrakurikuler Pramuka -- intensively!", "ekstrakurikuler-pramuka-intensively"],
    ["Bahasa & Sastra", "bahasa-sastra"],
    ["--", ""],
  ];
  for (const [masuk, harap] of contohSlug) {
    const hasil = buatSlug(masuk);
    periksa(`"${masuk}" -> "${harap}"`, hasil === harap, `hasil "${hasil}"`);
  }
  periksa("slug valid dikenali", slugValid("program-pembelajaran-tematik"));
  periksa("slug dengan spasi ditolak", !slugValid("ada spasi"));
  periksa("slug dengan huruf besar ditolak", !slugValid("AdaHurufBesar"));
  periksa(
    "slug panjang dipangkas ke 80",
    buatSlug("a".repeat(200)).length === 80,
    `panjang ${buatSlug("a".repeat(200)).length}`,
  );

  console.log("\nB. Skema Zod");
  const dasar = {
    name: "Program Pembelajaran Tematik",
    slug: "program-pembelajaran-tematik",
    summary: "Ringkasan singkat.",
    description: "Deskripsi lengkap.",
    image_media_id: "",
    is_published: true,
  };
  periksa("program valid diterima", programSchema.safeParse(dasar).success);
  periksa(
    "slug tidak valid ditolak",
    !programSchema.safeParse({ ...dasar, slug: "Ada Spasi" }).success,
  );
  periksa(
    "nama terlalu pendek ditolak",
    !programSchema.safeParse({ ...dasar, name: "ab" }).success,
  );
  periksa(
    "ekstrakurikuler valid diterima",
    ekstrakurikulerSchema.safeParse({ ...dasar, schedule: "Sabtu", coach: "Budi" })
      .success,
  );

  console.log("\nC. Keunikan slug di database");
  await db.execute("DELETE FROM programs");
  await db.execute("DELETE FROM extracurriculars");

  await db.execute({
    sql: `INSERT INTO programs (id, slug, name, sort_order, is_published, updated_at)
          VALUES ('p1', 'literasi', 'Program Literasi', 1, 1, ?1)`,
    args: [nowSeconds()],
  });
  periksa("slug pertama tersimpan", true);

  // INSERT kedua dengan slug sama harus gagal karena ada UNIQUE.
  let ditolak = false;
  try {
    await db.execute({
      sql: `INSERT INTO programs (id, slug, name, sort_order, is_published, updated_at)
            VALUES ('p2', 'literasi', 'Duplikat', 2, 1, ?1)`,
      args: [nowSeconds()],
    });
  } catch {
    ditolak = true;
  }
  periksa("slug ganda ditolak oleh batasan UNIQUE", ditolak);

  const jumlah = await db.execute("SELECT count(*) AS c FROM programs");
  periksa("hanya satu baris tersimpan", Number(jumlah.rows[0].c) === 1);

  console.log("\nD. Tampilan halaman CMS");
  const daftar = await minta("/admin/programs", { kuki });
  periksa("daftar memuat program", daftar.teks.includes("Program Literasi"));
  periksa("slug tampil di daftar", teksBersih(daftar.teks).includes("/program/literasi"));

  const form = await minta("/admin/programs/baru", { kuki });
  periksa("form tambah punya kolom slug", form.teks.includes('name="slug"'));
  periksa("form tambah punya kolom ringkasan", form.teks.includes('name="summary"'));

  const formEks = await minta("/admin/extracurriculars/baru", { kuki });
  periksa("form ekstra punya kolom jadwal", formEks.teks.includes('name="schedule"'));
  periksa("form ekstra punya kolom pembina", formEks.teks.includes('name="coach"'));

  const programForm = await minta("/admin/programs/baru", { kuki });
  periksa(
    "form program tidak punya kolom jadwal",
    !programForm.teks.includes('name="schedule"'),
  );

  const ubah = await minta("/admin/programs/p1", { kuki });
  periksa("form ubah terisi", ubah.teks.includes("Program Literasi"));

  const salah = await minta("/admin/programs/id-palsu", { kuki });
  periksa("id tidak ada -> 404", salah.status === 404, `status ${salah.status}`);

  console.log("\nE. Proteksi");
  for (const p of ["/admin/programs", "/admin/extracurriculars"]) {
    const r = await minta(p);
    periksa(`${p} tanpa sesi dialihkan`, r.status === 307, `status ${r.status}`);
  }

  console.log("\nF. Kebersihan");
  await db.execute("DELETE FROM programs");
  await db.execute("DELETE FROM extracurriculars");
  const sisa = await db.execute(
    "SELECT count(*) AS c FROM programs",
  );
  periksa("tabel programs dikosongkan", Number(sisa.rows[0].c) === 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
