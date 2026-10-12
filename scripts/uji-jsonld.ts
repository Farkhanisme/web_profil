/**
 * Uji data terstruktur (JSON-LD) dan berkas GEO.
 *
 *   npx tsx scripts/uji-jsonld.ts
 */

import { request } from "node:http";

const PORT = 3000;

function ambil(jalur: string): Promise<{ status: number; headers: Record<string, unknown>; teks: string }> {
  return new Promise((resolve, reject) => {
    const req = request({ host: "localhost", port: PORT, path: jalur }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (p) => {
        data += p;
      });
      res.on("end", () =>
        resolve({ status: res.statusCode ?? 0, headers: res.headers, teks: data }),
      );
    });
    req.on("error", reject);
    req.end();
  });
}

function periksa(label: string, lulus: boolean, catatan = ""): void {
  console.log(`  ${lulus ? "OK  " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`);
}

/** Kumpulkan semua skema JSON-LD dari sebuah halaman. */
function jsonLd(html: string): Array<Record<string, unknown>> {
  const hasil: Array<Record<string, unknown>> = [];
  for (const m of html.matchAll(
    /<script type="application\/ld\+json">([\s\S]*?)<\/script>/g,
  )) {
    const data = JSON.parse(m[1]!) as unknown;
    if (Array.isArray(data)) hasil.push(...(data as Array<Record<string, unknown>>));
    else hasil.push(data as Record<string, unknown>);
  }
  return hasil;
}

function tipe(schema: Record<string, unknown>): string {
  return String(schema["@type"] ?? "");
}

async function main() {
  console.log("A. Skema di beranda");
  const beranda = await ambil("/");
  const skemaBeranda = jsonLd(beranda.teks);
  const ada = (t: string) => skemaBeranda.some((s) => tipe(s) === t);

  periksa("ada JSON-LD", skemaBeranda.length > 0, `${skemaBeranda.length} skema`);
  periksa("ada School", ada("School"));
  periksa("ada WebSite", ada("WebSite"));

  const sekolah = skemaBeranda.find((s) => tipe(s) === "School");
  if (sekolah) {
    periksa("School punya nama", typeof sekolah.name === "string");
    periksa("School punya alamat", Boolean(sekolah.address));
    periksa("School punya geo", Boolean(sekolah.geo));
    periksa("School punya jam layanan", Array.isArray(sekolah.openingHoursSpecification));
    periksa(
      "School punya koordinat valid",
      typeof (sekolah.geo as { latitude?: number })?.latitude === "number",
    );
  }

  const situs = skemaBeranda.find((s) => tipe(s) === "WebSite");
  if (situs) {
    periksa("WebSite punya bahasa id-ID", situs.inLanguage === "id-ID");
    periksa("WebSite tertaut ke School", Boolean(situs.publisher));
  }

  console.log("\nB. Skema per halaman");
  const halaman: Array<[string, string]> = [
    ["/profil", "FAQPage"],
    ["/profil", "BreadcrumbList"],
    ["/profil", "Person"],
    ["/kontak", "School"],
    ["/kontak", "FAQPage"],
    ["/kontak", "BreadcrumbList"],
    ["/program", "BreadcrumbList"],
    ["/program/program-1", "BreadcrumbList"],
    ["/ekstrakurikuler/ekstrakurikuler-1", "BreadcrumbList"],
    ["/galeri/kegiatan-sekolah", "ImageGallery"],
    ["/guru", "BreadcrumbList"],
  ];

  const cache = new Map<string, Array<Record<string, unknown>>>();
  for (const [jalur, skema] of halaman) {
    if (!cache.has(jalur)) {
      const r = await ambil(jalur);
      cache.set(jalur, jsonLd(r.teks));
    }
    periksa(
      `${jalur} memuat ${skema}`,
      cache.get(jalur)!.some((s) => tipe(s) === skema),
    );
  }

  console.log("\nC. Validitas bentuk JSON-LD");
  for (const [jalur, skema] of cache) {
    for (const s of skema) {
      const t = tipe(s);
      periksa(
        `${jalur} ${t} punya @context`,
        s["@context"] === "https://schema.org",
      );
    }
  }

  const profil = cache.get("/profil")!;
  const faq = profil.find((s) => tipe(s) === "FAQPage") as
    | { mainEntity?: Array<{ "@type"?: string; name?: string; acceptedAnswer?: unknown }> }
    | undefined;
  periksa(
    "FAQPage punya mainEntity",
    Array.isArray(faq?.mainEntity) && faq.mainEntity.length > 0,
    `${faq?.mainEntity?.length ?? 0} pertanyaan`,
  );
  periksa(
    "setiap pertanyaan punya acceptedAnswer",
    (faq?.mainEntity ?? []).every(
      (q) => q["@type"] === "Question" && Boolean(q.acceptedAnswer) && Boolean(q.name),
    ),
  );

  const remah = profil.find((s) => tipe(s) === "BreadcrumbList") as
    | { itemListElement?: Array<{ "@type"?: string; position?: number; name?: string }> }
    | undefined;
  periksa(
    "remah roti punya posisi berurutan",
    (remah?.itemListElement ?? []).every(
      (i, idx) => i["@type"] === "ListItem" && i.position === idx + 1 && Boolean(i.name),
    ),
  );

  const galeri = cache.get("/galeri/kegiatan-sekolah")!.find(
    (s) => tipe(s) === "ImageGallery",
  ) as { image?: Array<Record<string, unknown>>; numberOfItems?: number } | undefined;
  periksa("ImageGallery punya gambar", Array.isArray(galeri?.image));
  // ImageObject berada di dalam ImageGallery.image, bukan di tingkat atas.
  periksa(
    "ImageGallery memuat ImageObject",
    (galeri?.image ?? []).every((i) => i["@type"] === "ImageObject"),
    `${galeri?.image?.length ?? 0} gambar`,
  );
  periksa(
    "setiap ImageObject punya contentUrl dan ukuran",
    (galeri?.image ?? []).every(
      (i) =>
        typeof i.contentUrl === "string" &&
        typeof i.width === "number" &&
        typeof i.height === "number",
    ),
  );
  periksa(
    "jumlah gambar sesuai numberOfItems",
    (galeri?.image?.length ?? 0) === (galeri?.numberOfItems ?? -1),
    `${galeri?.image?.length ?? 0} gambar`,
  );

  console.log("\nD. Berkas /llms.txt");
  const llms = await ambil("/llms.txt");
  periksa("status 200", llms.status === 200);
  periksa(
    "tipe teks",
    String(llms.headers["content-type"]).includes("text/plain"),
  );
  periksa("diminta untuk diindeks", String(llms.headers["x-robots-tag"]).includes("index"));
  periksa("dimuat dari cache", String(llms.headers["cache-control"]).includes("s-maxage"));
  periksa("berisi judul sekolah", llms.teks.includes("# MTs Ma'arif Tieng"));
  periksa("berisi deskripsi sekolah", llms.teks.includes("madrasah tsanawiyah"));
  periksa("berisi bagian Identitas", llms.teks.includes("## Identitas"));
  periksa("berisi koordinat", /-?\d+\.\d+, \d+\.\d+/.test(llms.teks));
  periksa("berisi jam layanan", llms.teks.includes("Jam layanan"));
  periksa("nama hari bahasa Indonesia", llms.teks.includes("Senin"));
  periksa("berisi daftar halaman penting", llms.teks.includes("## Halaman Penting"));
  periksa("8 halaman dijelaskan", (llms.teks.match(/^- \[/gm) ?? []).length >= 8);
  periksa("tautan ke llms-full.txt", llms.teks.includes("/llms-full.txt"));
  periksa("tautan ke sitemap", llms.teks.includes("/sitemap.xml"));
  periksa("tidak ada placeholder TODO", !llms.teks.includes("TODO"));
  periksa("tidak ada placeholder DRAF", !llms.teks.includes("DRAF:"));
  periksa(
    "semua tautan memakai URL absolut",
    !/\]\(\/[^h]/.test(llms.teks),
  );

  console.log("\nE. Berkas /llms-full.txt");
  const full = await ambil("/llms-full.txt");
  periksa("status 200", full.status === 200);
  periksa("berisi Ringkasan", full.teks.includes("## Ringkasan"));
  periksa("berisi Identitas Sekolah", full.teks.includes("## Identitas Sekolah"));
  periksa("berisi Sejarah", full.teks.includes("## Sejarah"));
  periksa("berisi Visi", full.teks.includes("## Visi"));
  periksa("berisi Misi", full.teks.includes("## Misi"));
  periksa("berisi Struktur Organisasi", full.teks.includes("## Struktur Organisasi"));
  periksa("berisi Fasilitas", full.teks.includes("## Fasilitas"));
  periksa("berisi FAQ", full.teks.includes("## Pertanyaan yang Sering Diajukan"));
  periksa(
    "memuat seluruh pertanyaan FAQ",
    (full.teks.match(/^### /gm) ?? []).length >= 6,
    `${(full.teks.match(/^### /gm) ?? []).length} pertanyaan`,
  );
  periksa("lebih panjang dari llms.txt", full.teks.length > llms.teks.length,
    `${full.teks.length} vs ${llms.teks.length} karakter`);
  periksa("tidak ada placeholder TODO", !full.teks.includes("TODO"));

  console.log("\nF. Keterkaitan antar berkas");
  periksa(
    "llms-full.txt tertaut dari llms.txt",
    llms.teks.includes("/llms-full.txt"),
  );
  periksa(
    "robots.txt mengizinkan /llms.txt",
    !(await ambil("/robots.txt")).teks.includes("Disallow: /llms"),
  );
  const sitemap = await ambil("/sitemap.xml");
  periksa(
    "llms.txt tidak masuk sitemap (bukan halaman)",
    !sitemap.teks.includes("/llms.txt"),
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});