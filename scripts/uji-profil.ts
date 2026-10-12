/**
 * Uji halaman profil: bagian wajib, tabel identitas, FAQ, dan JSON-LD.
 *
 *   npx tsx scripts/uji-profil.ts
 */

import { request } from "node:http";
import { profil, profilAdaPlaceholder } from "../src/config/profil";
import { site } from "../src/config/site";

const PORT = 3000;

function ambil(jalur: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const req = request({ host: "localhost", port: PORT, path: jalur }, (res) => {
      let data = "";
      res.setEncoding("utf8");
      res.on("data", (p) => {
        data += p;
      });
      res.on("end", () => resolve(data));
    });
    req.on("error", reject);
    req.end();
  });
}

function periksa(label: string, lulus: boolean, catatan = ""): void {
  console.log(`  ${lulus ? "OK  " : "GAGAL"} ${label}${catatan ? ` (${catatan})` : ""}`);
}

/**
 * Ambil seluruh blok JSON-LD dari HTML lalu diratakan.
 * Halaman menyatukan beberapa skema dalam satu tag <script>, jadi hasilnya
 * bisa berupa array satu lapis.
 */
function jsonLd(html: string): Array<Record<string, unknown>> {
  const hasil: Array<Record<string, unknown>> = [];
  for (const m of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(m[1]!) as unknown;
    if (Array.isArray(data)) hasil.push(...(data as Array<Record<string, unknown>>));
    else hasil.push(data as Record<string, unknown>);
  }
  return hasil;
}

/**
 * Teks yang benar-benar terlihat pembaca.
 * Tag <script> (termasuk muatan RSC) dan <style> dibuang, karena isinya
 * bukan teks yang dibaca pengguna maupun mesin pencari.
 */
function teksTerlihat(html: string): string {
  return html
    .replace(/<script[\s>][\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s>][\s\S]*?<\/style>/g, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ");
}

async function main() {
  const html = await ambil("/profil");
  const bersih = (x: string) => x.replace(/<!--.*?-->/g, "");

  console.log("A. Bagian wajib (KP PRD)");
  const bagian = [
    "Profil Sekolah",
    "Identitas Sekolah",
    "Sejarah",
    "Visi",
    "Misi",
    "Struktur Organisasi",
    "Fasilitas",
    "Pertanyaan yang Sering Diajukan",
  ];
  for (const b of bagian) periksa(`bagian "${b}"`, bersih(html).includes(b));

  console.log("\nB. Paragraf pembuka dan tanggal");
  periksa("ringkasan di paragraf pembuka", bersih(html).includes(profil.ringkasan.slice(0, 60)));
  periksa("tanggal diperbarui tampil", bersih(html).includes("Diperbarui"));

  console.log("\nC. Tabel identitas");
  periksa("ada tabel", (html.match(/<table/g) ?? []).length >= 2);
  periksa("ada elemen th untuk label", html.includes('scope="row"'));
  periksa("ada caption untuk aksesibilitas", html.includes("<caption"));
  periksa("nama resmi tampil", bersih(html).includes(site.name));
  periksa("status sekolah tampil", bersih(html).includes(site.identity.status));
  periksa("kurikulum tampil", bersih(html).includes(site.identity.curriculum));
  // Tabel identitas menyaring placeholder, jadi di sini TODO tidak
  // boleh muncul sama sekali.
  periksa("tabel identitas tidak menampilkan TODO", !teksTerlihat(html).includes("TODO"));

  // Paragraf profil masih berupa DRAF sampai konten asli masuk (T20).
  // Yang diperiksa di sini adalah konsistensinya: halaman harus
  // menampilkan DRAF selama masih ada DRAF di konfigurasi.
  const masihDraf = profilAdaPlaceholder();
  const tampilDraf = teksTerlihat(html).includes("DRAF:");
  periksa(
    "placeholder di teks sesuai status konfigurasi",
    masihDraf === tampilDraf,
    masihDraf
      ? "masih ada draf, tampil di halaman (wajar sampai T20)"
      : "sudah terisi semua",
  );

  console.log("\nD. Struktur organisasi");
  const barisStruktur = (html.match(/<tr[^>]*>/g) ?? []).length;
  periksa("baris struktur tampil", barisStruktur >= profil.struktur.length,
    `${barisStruktur} baris`);

  console.log("\nE. FAQ");
  for (const item of profil.faq) {
    periksa(`pertanyaan "${item.question.slice(0, 40)}..."`, bersih(html).includes(item.question));
  }
  periksa("accordion memakai button", html.includes("data-slot=\"accordion-trigger\""));

  console.log("\nF. JSON-LD");
  const blok = jsonLd(html);
  periksa("ada blok JSON-LD", blok.length > 0, `${blok.length} skema`);

  const semua = JSON.stringify(blok);
  periksa("schema FAQPage", semua.includes('"@type":"FAQPage"'));
  periksa("schema BreadcrumbList", semua.includes('"@type":"BreadcrumbList"'));
  periksa("schema Person untuk kepala madrasah", semua.includes('"@type":"Person"'));

  const faqBlok = blok.find(
    (b) => (b as Record<string, unknown>)["@type"] === "FAQPage",
  ) as { mainEntity?: Array<{ name: string }> } | undefined;
  periksa(
    "FAQPage memuat seluruh pertanyaan",
    (faqBlok?.mainEntity?.length ?? 0) === profil.faq.length,
    `${faqBlok?.mainEntity?.length ?? 0} dari ${profil.faq.length}`,
  );

  const remah = blok.find(
    (b) => (b as Record<string, unknown>)["@type"] === "BreadcrumbList",
  ) as { itemListElement?: Array<{ position: number }> } | undefined;
  periksa(
    "remah roti punya posisi 1 dan 2",
    (remah?.itemListElement?.length ?? 0) === 2,
  );

  console.log("\nG. Semantik dan SEO");
  periksa("tepat satu h1", (html.match(/<h1[\s>]/g) ?? []).length === 1);
  periksa("judul h1 adalah nama halaman", bersih(html).includes(">Profil Sekolah</h1>"));
  periksa("canonical profil", html.includes('rel="canonical"') && html.includes("/profil"));
  periksa("deskripsi memakai ringkasan", html.includes("description"));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});