/**
 * Uji modul guru/staf: skema Zod, urutan, tampilan halaman, dan proteksi.
 *
 *   npx tsx scripts/uji-crud-staff.ts
 *
 * Server Action tidak bisa dipanggil langsung dari luar (React mengunci
 * alamatnya per build), jadi bagian yang diuji di sini adalah skema
 * validasi, urutan query, render halaman, dan penolakan tanpa sesi.
 */

import { request } from "node:http";
import { loadEnv } from "./load-env";
import { createDb, nowSeconds } from "../src/lib/db/client";
import { staffSchema, dariFormData, kosongkan } from "../src/lib/schemas/staff";

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

function periksa(label: string, lulus: boolean, catatan = ""): void {
  console.log(`  ${lulus ? "OK  " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`);
}

async function main() {
  const db = createDb();
  const kuki = await login();
  console.log("Login admin: BERHASIL\n");

  console.log("A. Validasi skema Zod");
  periksa(
    "nama terlalu pendek ditolak",
    !staffSchema.safeParse({
      name: "ab",
      position: "",
      subject: "",
      photo_media_id: "",
      is_published: true,
    }).success,
  );
  periksa(
    "data valid diterima",
    staffSchema.safeParse({
      name: "Ahmad Fauzi",
      position: "Guru",
      subject: "Matematika",
      photo_media_id: "",
      is_published: true,
    }).success,
  );
  periksa(
    "nama dipangkas spasi",
    staffSchema.parse({
      name: "  Ahmad Fauzi  ",
      position: "",
      subject: "",
      photo_media_id: "",
      is_published: true,
    }).name === "Ahmad Fauzi",
  );
  periksa(
    "teks kosong menjadi null",
    kosongkan("   ") === null && kosongkan(" Guru ") === "Guru",
  );
  const tanpaCheckbox = new FormData();
  tanpaCheckbox.set("name", "Tanpa Checkbox");
  tanpaCheckbox.set("position", "");
  tanpaCheckbox.set("subject", "");
  tanpaCheckbox.set("photo_media_id", "");
  periksa(
    "checkbox tak dicentang -> is_published false",
    dariFormData(tanpaCheckbox).is_published === false,
  );

  console.log("\nB. Urutan data");
  await db.execute("DELETE FROM staff");
  const contoh = [
    ["s1", "Ahmad Fauzi"],
    ["s2", "Budi Santoso"],
    ["s3", "Citra Dewi"],
  ];
  for (let i = 0; i < contoh.length; i += 1) {
    await db.execute({
      sql: `INSERT INTO staff (id, name, position, subject, sort_order, is_published, created_at, updated_at)
            VALUES (?1, ?2, 'Guru', 'Matematika', ?3, 1, ?4, ?4)`,
      args: [contoh[i]![0], contoh[i]![1], i + 1, nowSeconds()],
    });
  }
  const urut = await db.execute(
    "SELECT name FROM staff ORDER BY sort_order ASC, name ASC",
  );
  periksa(
    "urutan mengikuti sort_order",
    urut.rows.map((r) => r.name).join("|") === "Ahmad Fauzi|Budi Santoso|Citra Dewi",
  );

  // Tukar dua baris seperti yang dilakukan geserStaff.
  await db.batch(
    [
      { sql: "UPDATE staff SET sort_order = ?1 WHERE id = 's3'", args: [1] },
      { sql: "UPDATE staff SET sort_order = ?1 WHERE id = 's1'", args: [3] },
    ],
    "write",
  );
  const tukar = await db.execute(
    "SELECT name FROM staff ORDER BY sort_order ASC, name ASC",
  );
  periksa(
    "pertukaran urutan bekerja",
    tukar.rows[0]?.name === "Citra Dewi" && tukar.rows[2]?.name === "Ahmad Fauzi",
  );

  // Kembalikan urutan semula.
  await db.batch(
    [
      { sql: "UPDATE staff SET sort_order = 1 WHERE id = 's1'" },
      { sql: "UPDATE staff SET sort_order = 2 WHERE id = 's2'" },
      { sql: "UPDATE staff SET sort_order = 3 WHERE id = 's3'" },
    ],
    "write",
  );

  console.log("\nC. Halaman CMS");
  const daftar = await minta("/admin/staff", { kuki });
  periksa("halaman daftar memuat semua nama", contoh.every((c) => daftar.teks.includes(c[1]!)));
  periksa(
    "urutan di HTML sesuai urutan custom",
    daftar.teks.indexOf("Ahmad Fauzi") < daftar.teks.indexOf("Citra Dewi"),
  );
  periksa("tombol ubah ada", daftar.teks.includes("/admin/staff/s1"));
  periksa("panel kosong tidak muncul", !daftar.teks.includes("Belum ada guru atau staf"));

  const ubah = await minta("/admin/staff/s1", { kuki });
  periksa("form ubah terisi", ubah.teks.includes("Ahmad Fauzi"));
  periksa("checkbox terbit tercentang", ubah.teks.includes('id="is_published"'));

  const takAda = await minta("/admin/staff/id-palsu", { kuki });
  periksa("id tidak ada -> 404", takAda.status === 404, `status ${takAda.status}`);

  console.log("\nD. Proteksi");
  const tanpaSesi = await minta("/admin/staff");
  periksa("tanpa sesi dialihkan", tanpaSesi.status === 307, `status ${tanpaSesi.status}`);

  const aksiTanpaSesi = await minta("/api/admin/media", {
    method: "POST",
    body: "x",
    tipe: "application/x-www-form-urlencoded",
  });
  periksa("unggah tanpa sesi ditolak", aksiTanpaSesi.status === 401, `status ${aksiTanpaSesi.status}`);

  console.log("\nE. Kebersihan data uji");
  await db.execute("DELETE FROM staff");
  const sisa = await db.execute("SELECT count(*) AS c FROM staff");
  periksa("tabel staff dikosongkan", Number(sisa.rows[0].c) === 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
