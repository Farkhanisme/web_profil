/**
 * Uji formulir kontak: honeypot, validasi, rate limit, dan halaman.
 *
 *   npx tsx scripts/uji-kontak.ts
 */

import { request } from "node:http";
import { loadEnv } from "./load-env";
import { createDb, nowSeconds } from "../src/lib/db/client";
import { newId } from "../src/lib/ids";
import { periksaPesan, teksNotifikasi } from "../src/lib/kontak";
import { BATAS_PESAN_PER_JAM, JENDELA_PESAN_DETIK } from "../src/lib/kontak";
import { hashIp } from "../src/lib/ip";

loadEnv();

const PORT = 3000;

function ambil(jalur: string): Promise<{ status: number; teks: string }> {
  return new Promise((resolve, reject) => {
    const req = request({ host: "localhost", port: PORT, path: jalur }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (p) => {
        data += p;
      });
      res.on("end", () => resolve({ status: res.statusCode ?? 0, teks: data }));
    });
    req.on("error", reject);
    req.end();
  });
}

function periksa(label: string, lulus: boolean, catatan = ""): void {
  console.log(`  ${lulus ? "OK  " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`);
}

/** Susun FormData dengan isi yang diminta. */
function form(nilai: Record<string, string>): FormData {
  const fd = new FormData();
  fd.set("name", nilai.name ?? "");
  fd.set("contact", nilai.contact ?? "");
  fd.set("body", nilai.body ?? "");
  fd.set("website", nilai.website ?? "");
  return fd;
}

const SAH = {
  name: "Budi Santoso",
  contact: "081234567890",
  body: "Mau bertanya soal pendaftaran siswa baru tahun depan.",
};

async function main() {
  console.log("A. Honeypot (KP PRD: pesan spam diabaikan)");

  const spam = periksaPesan(
    form({ ...SAH, website: "http://iklan.example" }),
  );
  periksa("honeypot terisi -> ditandai spam", spam.jenis === "spam");
  periksa(
    "honeypot kosong -> bukan spam",
    periksaPesan(form(SAH)).jenis === "sah",
  );
  periksa(
    "honeypot berisi spasi saja -> dianggap kosong",
    periksaPesan(form({ ...SAH, website: "   " })).jenis === "sah",
    "spasi kosong bukan bukti bot",
  );

  console.log("\nB. Validasi isi");
  periksa("pesan sah diterima", periksaPesan(form(SAH)).jenis === "sah");

  const namaPendek = periksaPesan(form({ ...SAH, name: "B" }));
  periksa("nama terlalu pendek ditolak", namaPendek.jenis === "salah");
  periksa(
    "pesan nama ada di fieldErrors",
    namaPendek.jenis === "salah" && Boolean(namaPendek.fieldErrors.name),
  );

  const kontakSalah = periksaPesan(form({ ...SAH, contact: "bukan kontak" }));
  periksa("kontak tidak valid ditolak", kontakSalah.jenis === "salah");

  const emailValid = periksaPesan(
    form({ ...SAH, contact: "budi@email.com" }),
  );
  periksa("email sah diterima", emailValid.jenis === "sah");

  const isiPendek = periksaPesan(form({ ...SAH, body: "pendek" }));
  periksa("pesan terlalu pendek ditolak", isiPendek.jenis === "salah");

  console.log("\nC. Penyimpanan ke database");
  const db = createDb();
  await db.execute("DELETE FROM messages");

  // Meniru langkah penyimpan yang dilakukan Server Action.
  const sah = periksaPesan(form(SAH));
  if (sah.jenis !== "sah") throw new Error("data uji tidak sah");

  await db.execute({
    sql: `INSERT INTO messages (id, name, contact, body, is_read, ip_hash, created_at)
          VALUES (?1, ?2, ?3, ?4, 0, ?5, ?6)`,
    args: [
      newId(),
      sah.nama,
      sah.kontak,
      sah.isi,
      hashIp("127.0.0.1"),
      nowSeconds(),
    ],
  });

  const tersimpan = await db.execute("SELECT name, is_read FROM messages");
  periksa("pesan tersimpan", tersimpan.rows.length === 1);
  periksa("pesan baru berstatus belum dibaca", tersimpan.rows[0]?.is_read === 0);

  console.log("\nD. Notifikasi Telegram");
  const teks = teksNotifikasi("Budi Santoso", "081234567890", SAH.body);
  periksa("notifikasi memuat nama", teks.includes("Budi Santoso"));
  periksa("notifikasi memuat kontak", teks.includes("081234567890"));
  periksa("notifikasi memuat isi", teks.includes(SAH.body));

  const panjang = teksNotifikasi("a", "b", "x".repeat(2000));
  periksa("isi panjang dipotong", panjang.length < 800, `${panjang.length} karakter`);

  console.log("\nE. Rate limit pesan");
  periksa("batas 5 pesan per jam", BATAS_PESAN_PER_JAM === 5);
  periksa("jendela 1 jam", JENDELA_PESAN_DETIK === 3600);

  await db.execute("DELETE FROM rate_limits WHERE key LIKE 'kontak:%'");
  const kunci = `kontak:${hashIp("10.0.0.1")}`;
  const hasil: boolean[] = [];
  for (let i = 0; i < BATAS_PESAN_PER_JAM + 2; i += 1) {
    const now = nowSeconds();
    const r = await db.execute({
      sql: `INSERT INTO rate_limits (key, count, window_start) VALUES (?1, 1, ?2)
            ON CONFLICT(key) DO UPDATE SET
              count = CASE WHEN rate_limits.window_start <= ?3 THEN 1
                           ELSE rate_limits.count + 1 END,
              window_start = CASE WHEN rate_limits.window_start <= ?3 THEN ?2
                                 ELSE rate_limits.window_start END
            RETURNING count`,
      args: [kunci, now, now - JENDELA_PESAN_DETIK],
    });
    hasil.push(Number(r.rows[0]?.count) <= BATAS_PESAN_PER_JAM);
  }
  periksa("lima percobaan pertama lolos", hasil.slice(0, 5).every(Boolean));
  periksa("percobaan keenam ditolak", !hasil[5]);
  periksa("percobaan ketujuh ditolak", !hasil[6]);
  await db.execute("DELETE FROM rate_limits WHERE key LIKE 'kontak:%'");

  console.log("\nF. Halaman kontak");
  const halaman = await ambil("/kontak");
  periksa("halaman 200", halaman.status === 200);
  periksa("ada kolom nama", halaman.teks.includes('name="name"'));
  periksa("ada kolom kontak", halaman.teks.includes('name="contact"'));
  periksa("ada kolom pesan", halaman.teks.includes('name="body"'));
  periksa("honeypot ada", halaman.teks.includes('name="website"'));
  periksa(
    "honeypot disembunyikan dari pengguna",
    /aria-hidden[^>]*class="[^"]*left-\[-9999px\]/.test(halaman.teks) ||
      (halaman.teks.includes("left-[-9999px]") && halaman.teks.includes("aria-hidden")),
  );
  periksa("peta tertanam", halaman.teks.includes("output=embed"));
  periksa("peta lazy", /<iframe[^>]*loading="lazy"/.test(halaman.teks));
  periksa("tautan Google Maps", halaman.teks.includes("google.com/maps/search"));
  periksa("schema School", halaman.teks.includes('"@type":"School"'));
  periksa("schema FAQPage", halaman.teks.includes('"@type":"FAQPage"'));
  periksa("jam layanan tampil", halaman.teks.includes("Jam layanan"));
  periksa("tautan kebijakan privasi", halaman.teks.includes("/kebijakan-privasi"));
  periksa("peta punya judul aksesibel", halaman.teks.includes("Peta lokasi"));

  console.log("\nG. Kebersihan data uji");
  await db.execute("DELETE FROM messages");
  const sisa = await db.execute("SELECT count(*) AS c FROM messages");
  periksa("pesan uji dibersihkan", Number(sisa.rows[0].c) === 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});