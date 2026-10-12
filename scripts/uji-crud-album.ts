/**
 * Uji modul galeri.
 *
 * Fokus pada dua kriteria penerimaan PRD:
 *   1. Banyak foto bisa masuk dalam satu sesi unggah.
 *   2. Kegagalan satu berkas tidak membatalkan berkas lain.
 *
 *   npx tsx scripts/uji-crud-album.ts
 */

import { request } from "node:http";
import sharp from "sharp";
import { loadEnv } from "./load-env";
import { createDb, nowSeconds } from "../src/lib/db/client";
import { newId } from "../src/lib/ids";
import { albumSchema } from "../src/lib/schemas/album";

loadEnv();

const PORT = 3000;

interface Balasan {
  status: number;
  setCookie: string[];
  teks: string;
}

function minta(
  jalur: string,
  opsi: { method?: string; body?: string | Buffer; tipe?: string; kuki?: string[] } = {},
): Promise<Balasan> {
  return new Promise((resolve, reject) => {
    const req = request(
      { host: "localhost", port: PORT, path: jalur, method: opsi.method ?? "GET" },
      (res) => {
        const bagian: Buffer[] = [];
        res.on("data", (p) => bagian.push(Buffer.from(p)));
        res.on("end", () => {
          const teks = Buffer.concat(bagian);
          resolve({
            status: res.statusCode ?? 0,
            setCookie: (res.headers["set-cookie"] as string[]) ?? [],
            teks: teks.toString("utf8"),
          });
        });
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

/** Unggah satu berkas lewat route media, mengembalikan id media. */
async function unggah(
  kuki: string[],
  data: Buffer,
  nama: string,
): Promise<string | null> {
  const batas = "----ujiGaleri1234567890";
  const kepala = Buffer.from(
    `--${batas}\r\n` +
      `Content-Disposition: form-data; name="file"; filename="${nama}"\r\n` +
      `Content-Type: image/webp\r\n\r\n`,
    "utf8",
  );
  const ekor = Buffer.from(`\r\n--${batas}--\r\n`, "utf8");

  const res = await minta("/api/admin/media", {
    method: "POST",
    body: Buffer.concat([kepala, data, ekor]),
    tipe: `multipart/form-data; boundary=${batas}`,
    kuki,
  });

  if (res.status !== 200) return null;
  return (JSON.parse(res.teks) as { id?: string }).id ?? null;
}

async function gambar(lebar: number, tinggi: number): Promise<Buffer> {
  return sharp({
    create: { width: lebar, height: tinggi, channels: 3, background: { r: 20, g: 130, b: 95 } },
  })
    .webp()
    .toBuffer();
}

/** Simpan foto ke album, meniru apa yang dilakukan sisipFoto(). */
async function sisip(db: Awaited<ReturnType<typeof createDb>>, albumId: string, mediaId: string) {
  const akhir = await db.execute({
    sql: "SELECT coalesce(max(sort_order), 0) AS n FROM photos WHERE album_id = ?",
    args: [albumId],
  });
  const urutan = Number((akhir.rows[0] as unknown as { n: number }).n) + 1;
  await db.execute({
    sql: `INSERT INTO photos (id, album_id, media_id, caption, sort_order, created_at)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    args: [newId(), albumId, mediaId, `Foto ${urutan}`, urutan, nowSeconds()],
  });
}

function periksa(label: string, lulus: boolean, catatan = ""): void {
  console.log(`  ${lulus ? "OK  " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`);
}

async function main() {
  const db = createDb();
  const kuki = await login();
  console.log("Login admin: BERHASIL\n");

  await db.execute("DELETE FROM albums");

  console.log("A. Skema album");
  periksa(
    "judul valid diterima",
    albumSchema.safeParse({ title: "Kegiatan Belajar", slug: "", description: "" }).success,
  );
  periksa(
    "judul terlalu pendek ditolak",
    !albumSchema.safeParse({ title: "ab", slug: "", description: "" }).success,
  );
  periksa(
    "slug dengan huruf besar ditolak",
    !albumSchema.safeParse({ title: "Kegiatan Belajar", slug: "Kegiatan", description: "" })
      .success,
  );
  periksa(
    "slug kosong diterima (dibuat otomatis)",
    albumSchema.safeParse({ title: "Kegiatan Belajar", slug: "", description: "" }).success,
  );

  console.log("\nB. Unggah 10 foto dalam satu sesi");
  const albumId = newId();
  await db.execute({
    sql: `INSERT INTO albums (id, slug, title, description, created_at, updated_at)
          VALUES (?1, 'uji-galeri-besar', 'Album Uji 10 Foto', '', ?2, ?2)`,
    args: [albumId, nowSeconds()],
  });

  const ids: string[] = [];
  const gagal: number[] = [];
  const gambars = await Promise.all(
    Array.from({ length: 10 }, (_, i) => gambar(1200 + i * 10, 800 + i * 10)),
  );

  for (let i = 0; i < gambars.length; i += 1) {
    const id = await unggah(kuki, gambars[i]!, `foto-${i + 1}.webp`);
    if (id) {
      ids.push(id);
      await sisip(db, albumId, id);
    } else {
      gagal.push(i + 1);
    }
  }

  periksa("10 foto terunggah", ids.length === 10, `${ids.length}/10 berhasil`);
  periksa("tidak ada kegagalan", gagal.length === 0, `gagal: ${gagal.join(", ") || "-"}`);

  const jumlah = await db.execute({
    sql: "SELECT count(*) AS c FROM photos WHERE album_id = ?",
    args: [albumId],
  });
  periksa("10 baris photos tersimpan", Number(jumlah.rows[0].c) === 10);

  const urut = await db.execute({
    sql: "SELECT sort_order FROM photos WHERE album_id = ? ORDER BY sort_order",
    args: [albumId],
  });
  const nilaiUrut = urut.rows.map((r) => Number(r.sort_order));
  periksa(
    "urutan foto berurutan 1..10",
    nilaiUrut.join(",") === Array.from({ length: 10 }, (_, i) => i + 1).join(","),
    nilaiUrut.join(","),
  );

  console.log("\nC. Kegagalan satu berkas tidak membatalkan yang lain");
  // Berkas rusak (bukan gambar) pasti ditolak server.
  const rusak = Buffer.from("ini bukan gambar sama sekali", "utf8");
  const idRusak = await unggah(kuki, rusak, "rusak.webp");
  periksa("berkas rusak ditolak", idRusak === null);

  // Berkas di bawah ini tetap harus bisa masuk setelah kegagalan.
  const idSesudahnya = await unggah(kuki, await gambar(900, 600), "setelah-gagal.webp");
  periksa("berkas setelah kegagalan tetap masuk", idSesudahnya !== null);
  if (idSesudahnya) await sisip(db, albumId, idSesudahnya);

  const setelahGagal = await db.execute({
    sql: "SELECT count(*) AS c FROM photos WHERE album_id = ?",
    args: [albumId],
  });
  periksa(
    "semua foto tetap tersimpan",
    Number(setelahGagal.rows[0].c) === 11,
    `${setelahGagal.rows[0].c} foto`,
  );

  console.log("\nD. Album dan sampul");
  await db.execute({
    sql: "UPDATE albums SET cover_media_id = ?1 WHERE id = ?2",
    args: [ids[0]!, albumId],
  });
  const album = await db.execute({
    sql: `SELECT a.cover_media_id,
                 (SELECT count(*) FROM photos p WHERE p.album_id = a.id) AS n
            FROM albums a WHERE a.id = ?`,
    args: [albumId],
  });
  periksa(
    "sampul tertaut ke foto di album",
    album.rows[0]?.cover_media_id === ids[0],
  );
  periksa("jumlah foto pada album = 11", Number(album.rows[0]?.n) === 11);

  console.log("\nE. Keterangan foto");
  const fotoPertama = await db.execute({
    sql: "SELECT id FROM photos WHERE album_id = ? ORDER BY sort_order LIMIT 1",
    args: [albumId],
  });
  const fotoId = (fotoPertama.rows[0] as unknown as { id: string }).id;
  await db.execute({
    sql: "UPDATE photos SET caption = ?1 WHERE id = ?2",
    args: ["Siswa saat praktikum", fotoId],
  });
  const denganKeterangan = await db.execute({
    sql: "SELECT caption FROM photos WHERE id = ?",
    args: [fotoId],
  });
  periksa("keterangan tersimpan", denganKeterangan.rows[0]?.caption === "Siswa saat praktikum");

  console.log("\nF. Hapus album (cascade)");
  await db.execute({ sql: "DELETE FROM albums WHERE id = ?", args: [albumId] });
  const fotoTersisa = await db.execute({
    sql: "SELECT count(*) AS c FROM photos WHERE album_id = ?",
    args: [albumId],
  });
  periksa("foto ikut terhapus", Number(fotoTersisa.rows[0].c) === 0);
  const mediaTersisa = await db.execute({
    sql: "SELECT count(*) AS c FROM media WHERE id = ?",
    args: [ids[0]!],
  });
  periksa("baris media dibiarkan", Number(mediaTersisa.rows[0].c) === 1);

  console.log("\nG. Tampilan halaman CMS");
  const daftar = await minta("/admin/albums", { kuki });
  periksa("halaman album terbuka", daftar.status === 200);
  periksa("pesan album kosong tampil", daftar.teks.includes("Belum ada album"));

  // Buat album sungguhan agar bisa menguji halaman detail.
  const albumUji = newId();
  await db.execute({
    sql: `INSERT INTO albums (id, slug, title, description, created_at, updated_at)
          VALUES (?1, 'album-uji', 'Album Uji Tampilan', '', ?2, ?2)`,
    args: [albumUji, nowSeconds()],
  });
  const detail = await minta(`/admin/albums/${albumUji}`, { kuki });
  periksa("halaman detail terbuka", detail.status === 200);
  periksa("area unggah tampil", detail.teks.includes("Unggah foto"));
  periksa("input multi-file ada", /type="file"[^>]*multiple/.test(detail.teks));
  periksa("pesan album kosong pada detail", detail.teks.includes("Belum ada foto"));

  const salahId = await minta("/admin/albums/id-palsu", { kuki });
  periksa("id album salah -> 404", salahId.status === 404);

  console.log("\nH. Proteksi");
  const tanpaSesi = await minta("/admin/albums");
  periksa("tanpa sesi dialihkan", tanpaSesi.status === 307);

  console.log("\nI. Kebersihan");
  await db.execute("DELETE FROM albums");
  await db.execute("DELETE FROM photos");
  const sisa = await db.execute("SELECT count(*) AS c FROM albums");
  periksa("tabel albums dikosongkan", Number(sisa.rows[0].c) === 0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
