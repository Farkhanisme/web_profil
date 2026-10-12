/**
 * Uji SEO teknis: metadata per halaman, sitemap, robots, 404, dan
 * header keamanan.
 *
 *   npx tsx scripts/uji-seo.ts
 */

import { request } from "node:http";

const PORT = 3000;

interface Balasan {
  status: number;
  headers: Record<string, string | string[] | undefined>;
  teks: string;
}

function ambil(jalur: string): Promise<Balasan> {
  return new Promise((resolve, reject) => {
    const req = request(
      { host: "localhost", port: PORT, path: jalur },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (p) => {
          data += p;
        });
        res.on("end", () =>
          resolve({ status: res.statusCode ?? 0, headers: res.headers, teks: data }),
        );
      },
    );
    req.on("error", reject);
    req.end();
  });
}

function periksa(label: string, lulus: boolean, catatan = ""): void {
  console.log(`  ${lulus ? "OK  " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`);
}

function isi(html: string, pola: RegExp): string {
  const m = pola.exec(html);
  return m ? decodeEntitas(m[1] ?? m[0]) : "";
}

/**
 * Dekode entitas HTML.
 *
 * Panjang atribut pada berkas HTML lebih besar daripada teks aslinya:
 * "Ma&#x27;arif" menempati 9 karakter padahal hanya 1. Tanpa pemdecodean,
 * pengukuran panjang judul dan deskripsi menjadi menyesatkan.
 */
function decodeEntitas(teks: string): string {
  return teks
    .replace(/&#x27;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ");
}

const HALAMAN = [
  "/",
  "/profil",
  "/guru",
  "/program",
  "/ekstrakurikuler",
  "/galeri",
  "/kebijakan-privasi",
  "/program/program-1",
  "/ekstrakurikuler/ekstrakurikuler-1",
  "/galeri/kegiatan-sekolah",
];

async function main() {
  console.log("A. Metadata setiap halaman");

  const semuaJudul = new Set<string>();
  const semuaDeskripsi = new Set<string>();

  for (const jalur of HALAMAN) {
    const r = await ambil(jalur);
    const judulTeks = isi(r.teks, /<title>([^<]*)<\/title>/);
    const deskripsiTeks = isi(r.teks, /<meta name="description" content="([^"]*)"/);
    const canonical = isi(r.teks, /<link rel="canonical" href="([^"]*)"/);

    console.log(`\n  ${jalur}`);
    periksa("status 200", r.status === 200, `status ${r.status}`);
    periksa("ada title", judulTeks.length > 0);
    periksa(
      "judul maksimal 60 karakter",
      judulTeks.length > 0 && judulTeks.length <= 60,
      `${judulTeks.length} karakter`,
    );
    periksa(
      "deskripsi 140 sampai 160 karakter",
      deskripsiTeks.length >= 140 && deskripsiTeks.length <= 160,
      `${deskripsiTeks.length} karakter`,
    );
    periksa("ada canonical", canonical.length > 0, canonical);
    periksa(
      "canonical sesuai halaman",
      canonical.endsWith(jalur === "/" ? "" : jalur),
      canonical,
    );
    periksa("ada og:title", r.teks.includes('property="og:title"'));
    periksa("ada og:description", r.teks.includes('property="og:description"'));
    periksa("ada og:locale id_ID", r.teks.includes("id_ID"));
    periksa("ada og:image", r.teks.includes('property="og:image"'));
    periksa("twitter card large image", r.teks.includes("summary_large_image"));
    periksa(
      "lebar og:image diizinkan",
      !/\/media\/[^"?]+\?w=(?!240|480|800|1600)/.test(r.teks),
    );

    semuaJudul.add(judulTeks);
    semuaDeskripsi.add(deskripsiTeks);
  }

  console.log("\nB. Keunikan metadata");
  periksa(
    "judul unik per halaman",
    semuaJudul.size === HALAMAN.length,
    `${semuaJudul.size} dari ${HALAMAN.length}`,
  );
  periksa(
    "deskripsi unik per halaman",
    semuaDeskripsi.size === HALAMAN.length,
    `${semuaDeskripsi.size} dari ${HALAMAN.length}`,
  );

  console.log("\nC. sitemap.xml");
  const sitemap = await ambil("/sitemap.xml");
  periksa("status 200", sitemap.status === 200);
  periksa("format XML benar", sitemap.teks.trimStart().startsWith("<?xml"));
  periksa("ada urlset", sitemap.teks.includes("<urlset"));
  const urls = [...sitemap.teks.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]!);
  periksa("berisi URL", urls.length > 0, `${urls.length} URL`);
  periksa("ada halaman statis", urls.some((u) => u.endsWith("/profil")));
  periksa("ada detail program", urls.some((u) => u.includes("/program/program-")));
  periksa(
    "ada detail ekstrakurikuler",
    urls.some((u) => u.includes("/ekstrakurikuler/ekstrakurikuler-")),
  );
  periksa("ada detail album", urls.some((u) => u.includes("/galeri/")));
  periksa("tidak ada halaman admin", !urls.some((u) => u.includes("/admin")));
  periksa("tidak ada halaman login", !urls.some((u) => u.includes("/login")));
  periksa("tidak ada URL per guru", !urls.some((u) => u.includes("/guru/")));
  periksa("ada lastmod", sitemap.teks.includes("<lastmod>"));
  periksa("ada changefreq", sitemap.teks.includes("<changefreq>"));
  periksa("ada priority", sitemap.teks.includes("<priority>"));

  console.log("\nD. robots.txt");
  const robots = await ambil("/robots.txt");
  periksa("status 200", robots.status === 200);
  periksa(
    "tipe teks benar",
    String(robots.headers["content-type"]).includes("text/plain"),
  );
  periksa(
    "ada User-Agent *",
    /user-agent:\s*\*/i.test(robots.teks),
  );
  periksa("izinkan semua", /allow:\s*\//i.test(robots.teks));
  periksa("larang /admin", /disallow:\s*\/admin/i.test(robots.teks));
  periksa("larang /api", /disallow:\s*\/api\//i.test(robots.teks));
  periksa("tunjuk ke sitemap", /sitemap:\s*https?:\/\//i.test(robots.teks));
  for (const bot of ["GPTBot", "Google-Extended", "PerplexityBot", "ClaudeBot"]) {
    periksa(`izinkan ${bot}`, robots.teks.includes(bot));
  }

  console.log("\nE. Halaman 404");
  const salah = await ambil("/halaman-yang-tidak-ada");
  periksa("status 404", salah.status === 404);
  periksa("tampil angka 404", salah.teks.includes("404"));
  periksa("ada tawaran menu", salah.teks.includes("Galeri"));
  periksa(
    "404 offers tautan kontak",
    salah.teks.includes("/kontak"),
  );

  console.log("\nF. Header keamanan");
  const beranda = await ambil("/");
  const h = beranda.headers;
  periksa(
    "Content-Security-Policy",
    Boolean(h["content-security-policy"]),
    String(h["content-security-policy"]).slice(0, 50) + "...",
  );
  periksa("X-Content-Type-Options", h["x-content-type-options"] === "nosniff");
  periksa("Referrer-Policy", Boolean(h["referrer-policy"]), String(h["referrer-policy"]));
  periksa("X-Frame-Options", h["x-frame-options"] === "DENY");
  periksa("Permissions-Policy", Boolean(h["permissions-policy"]));
  periksa("Strict-Transport-Security", Boolean(h["strict-transport-security"]));

  console.log("\nG. Bahasa dan viewport");
  periksa("lang=id", beranda.teks.includes('lang="id"'));
  periksa("charset utf-8", beranda.teks.includes('charSet="utf-8"'));
  periksa("viewport responsif", beranda.teks.includes("width=device-width"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});