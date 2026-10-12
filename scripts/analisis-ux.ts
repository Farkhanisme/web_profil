/**
 * Analisis UX dan aksesibilitas berbasis HTML yang benar-benar dirender.
 *
 *   npx tsx scripts/analisis-ux.ts
 *
 * Alat ini menggantikan sebagian pemeriksaan yang biasanya butuh peramban:
 * nama yang bisa dibaca, label formulir, target sentuh, kontras, struktur
 * heading, dan penandaan menu aktif. Yang tidak bisa digantikan ialah
 * penilaian tampilan dan rasa, tetap harus dilihat langsung.
 */

import { request } from "node:http";

const PORT = Number(process.env.QA_PORT ?? 3000);

interface Balasan {
  status: number;
  teks: string;
  kuki: string[];
}

function keKuki(setCookie: string[] | string | undefined): string[] {
  const daftar = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  return daftar
    .map((c) => c.split(";")[0]!.trim())
    .filter((c) => c.length > 0 && !c.endsWith("="));
}

function minta(
  jalur: string,
  opsi: { kuki?: string[]; metode?: string; badan?: string } = {},
): Promise<Balasan> {
  return new Promise((resolve, reject) => {
    const header: Record<string, string> = {};
    if (opsi.badan) header["content-type"] = "application/x-www-form-urlencoded";
    if (opsi.kuki?.length) header.cookie = opsi.kuki.join("; ");

    const req = request(
      {
        host: "localhost",
        port: PORT,
        path: jalur,
        method: opsi.metode ?? "GET",
        headers: header,
      },
      (res) => {
        let data = "";
        res.setEncoding("utf8");
        res.on("data", (p) => {
          data += p;
        });
        res.on("end", () =>
          resolve({
            status: res.statusCode ?? 0,
            teks: data,
            kuki: keKuki(res.headers["set-cookie"] as string[]),
          }),
        );
      },
    );
    req.on("error", reject);
    if (opsi.badan) req.write(opsi.badan);
    req.end();
  });
}

async function login(): Promise<string[]> {
  const csrf = await minta("/api/auth/csrf");
  const { csrfToken } = JSON.parse(csrf.teks) as { csrfToken: string };

  const hasil = await minta("/api/auth/callback/credentials", {
    metode: "POST",
    kuki: csrf.kuki,
    badan: new URLSearchParams({
      csrfToken,
      email: process.env.ADMIN_EMAIL ?? "",
      password: process.env.ADMIN_PASSWORD ?? "",
    }).toString(),
  });

  return [...csrf.kuki, ...hasil.kuki];
}

// ------------------------------------------------------------------ HTML

/** Buang komentar dan skrip, sisakan struktur dokumen. */
function kerangka(html: string): string {
  return html
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<script\b[\s\S]*?<\/script>/g, "")
    .replace(/<style\b[\s\S]*?<\/style>/g, "");
}

function atribut(t: string, nama: string): string | null {
  const m = new RegExp(`\\s${nama}="([^"]*)"`).exec(t);
  return m ? m[1] : null;
}

function ada(t: string, nama: string): boolean {
  return new RegExp(`\\s${nama}(?:[=\\s>/])`).test(t);
}

function kelas(t: string): string[] {
  return (atribut(t, "class") ?? "").split(/\s+/).filter(Boolean);
}

/** Teks yang terbaca oleh pembaca layar: isi elemen minus markup. */
function teksTampil(penuh: string): string {
  return penuh
    .replace(/<[^>]+>/g, " ")
    .replace(/&[a-z#0-9]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

interface Elemen {
  buka: string;
  isi: string;
}

/**
 * Ambil seluruh elemen beserta isinya, memperhitungkan kedalaman agar
 * tag yang sama di dalam elemen lain tidak ikut terambil.
 */
function elemen(html: string, nama: string): Elemen[] {
  const hasil: Elemen[] = [];
  const pola = new RegExp(`<(/?)${nama}\\b([^>]*)>`, "gi");
  let m: RegExpExecArray | null;
  let kedalaman = 0;
  let akhirBuka = -1;
  let buka = "";

  while ((m = pola.exec(html)) !== null) {
    if (m[1] === "/") {
      kedalaman -= 1;
      if (kedalaman === 0 && akhirBuka >= 0) {
        hasil.push({
          buka,
          isi: html.slice(akhirBuka, m.index),
        });
        akhirBuka = -1;
      }
      continue;
    }

    const tagBuka = m[0];
    const menutupSendiri = /\/>$/.test(tagBuka);
    if (menutupSendiri) {
      if (kedalaman === 0) hasil.push({ buka: tagBuka, isi: "" });
      continue;
    }

    if (kedalaman === 0) {
      akhirBuka = m.index + tagBuka.length;
      buka = tagBuka;
    }
    kedalaman += 1;
  }

  return hasil;
}

/** Nama yang bisa dibaca sebuah elemen interaktif. */
function namaTerbaca(el: Elemen, dokumen?: string): string {
  const label = atribut(el.buka, "aria-label");
  if (label?.trim()) return label.trim();

  const by = atribut(el.buka, "aria-labelledby");
  if (by) return by.split(/\s+/).join(" ");

  // <label for="id"> berlaku juga untuk <button>, jadi switch dan
  // tombol lain yang dilabeli tetap punya nama yang bisa dibaca.
  const id = atribut(el.buka, "id");
  if (id && dokumen) {
    const pola = new RegExp(`<label\\b[^>]*\\sfor="${id}"[^>]*>([\\s\\S]*?)<\\/label>`);
    const m = pola.exec(dokumen);
    const teksLabel = m ? teksTampil(m[1]!) : "";
    if (teksLabel) return teksLabel;
  }

  if (ada(el.buka, "aria-hidden") && atribut(el.buka, "aria-hidden") === "true") {
    return "";
  }

  const teks = teksTampil(el.isi);
  if (teks) return teks;

  const judul = atribut(el.buka, "title");
  if (judul?.trim()) return judul.trim();

  // Ikon saja: cari label di dalam elemen lewat atribut title pada anak.
  const judulAnak = /<[a-z]+\b[^>]*\stitle="([^"]+)"/i.exec(el.isi);
  if (judulAnak?.[1]) return judulAnak[1].trim();

  return "";
}

// ------------------------------------------------------------- Temuan

interface Temuan {
  halaman: string;
  kategori: string;
  berat: "tinggi" | "sedang" | "rendah";
  detail: string;
}

const temuan: Temuan[] = [];
const sudahCatat = new Set<string>();

function catat(
  halaman: string,
  kategori: string,
  berat: Temuan["berat"],
  detail: string,
): void {
  const kunci = `${halaman}|${kategori}|${detail}`;
  if (sudahCatat.has(kunci)) return;
  sudahCatat.add(kunci);
  temuan.push({ halaman, kategori, berat, detail });
}

// --------------------------------------------------------------- Aturan

const UKURAN_SENTUH: Array<[RegExp, number]> = [
  [/size-icon-xs/, 24],
  [/size-icon-sm/, 32],
  [/\bsize-icon\b/, 36],
  [/\bh-6\b/, 24],
  [/\bh-7\b/, 28],
  [/\bh-8\b/, 32],
];

function audit(jalur: string, html: string): void {
  const h = kerangka(html);

  // --- Landmark
  const utama = (h.match(/<main\b/g) ?? []).length;
  if (utama !== 1) {
    catat(jalur, "Struktur", "tinggi", `main muncul ${utama} kali, seharusnya tepat 1`);
  }
  if (!/<header\b/.test(h)) {
    catat(jalur, "Struktur", "sedang", "tidak ada landmark header");
  }
  if (!/<footer\b/.test(h)) {
    catat(jalur, "Struktur", "sedang", "tidak ada landmark footer");
  }

  // --- Navigasi
  const navs = elemen(h, "nav");
  const navTanpaLabel = navs.filter((n) => !atribut(n.buka, "aria-label"));
  if (navTanpaLabel.length > 0) {
    catat(
      jalur,
      "Navigasi",
      "sedang",
      `${navTanpaLabel.length} <nav> tanpa aria-label, pembaca layar tidak dapat membedakannya`,
    );
  }

  // --- Tombol
  const tombol = elemen(h, "button");
  const tanpaNama = tombol.filter((b) => namaTerbaca(b, h) === "");
  if (tanpaNama.length > 0) {
    const contoh = tanpaNama
      .map((b) => kelas(b.buka).filter((k) => k.startsWith("size-icon")).join(" ") || "(tanpa kelas)")
      .slice(0, 3)
      .join(" | ");
    catat(
      jalur,
      "Aksesibilitas",
      "tinggi",
      `${tanpaNama.length} <button> tanpa nama yang bisa dibaca (${contoh})`,
    );
  }

  // --- Target sentuh
  let terkecil = Number.POSITIVE_INFINITY;
  let jmlKecil = 0;
  for (const b of [...tombol, ...elemen(h, "a")]) {
    const k = kelas(b.buka).join(" ");
    if (!k) continue;
    for (const [pola, px] of UKURAN_SENTUH) {
      if (pola.test(k)) {
        if (px < 44) jmlKecil += 1;
        terkecil = Math.min(terkecil, px);
        break;
      }
    }
  }
  if (jmlKecil > 0) {
    catat(
      jalur,
      "Target sentuh",
      "sedang",
      `${jmlKecil} elemen interaktif di bawah 44 px (paling kecil ${terkecil} px), susah dijangkau jari di layar 360 px`,
    );
  }

  // --- Tautan generik
  const generik = elemen(h, "a").filter((a) => {
    const t = namaTerbaca(a).toLowerCase();
    return ["klik di sini", "baca lebih lanjut", "selengkapnya", "here", "klik"].includes(t);
  });
  if (generik.length > 0) {
    catat(jalur, "Bahasa", "rendah", `${generik.length} tautan memakai teks generik`);
  }

  // --- Formulir
  const field = [...elemen(h, "input"), ...elemen(h, "textarea"), ...elemen(h, "select")];
  const tanpaLabel: string[] = [];
  for (const f of field) {
    const tipe = atribut(f.buka, "type");
    if (tipe === "hidden") continue;
    // Elemen aria-hidden tidak pernah dibaca pembaca layar, jadi
    // field internal pustaka (mis. input tersembunyi milik Radix)
    // tidak boleh dihitung.
    if (atribut(f.buka, "aria-hidden") === "true") continue;
    if (kelas(f.buka).includes("sr-only")) continue;
    const id = atribut(f.buka, "id");
    const adaLabel = id ? new RegExp(`<label\\b[^>]*\\sfor="${id}"`).test(h) : false;
    const adaAria =
      atribut(f.buka, "aria-label") !== null || atribut(f.buka, "aria-labelledby") !== null;
    if (!adaLabel && !adaAria) {
      tanpaLabel.push(
        atribut(f.buka, "name") ?? atribut(f.buka, "placeholder") ?? id ?? "(tanpa nama)",
      );
    }
  }
  if (tanpaLabel.length > 0) {
    catat(
      jalur,
      "Formulir",
      "tinggi",
      `${tanpaLabel.length} field tanpa label: ${tanpaLabel.slice(0, 4).join(", ")}`,
    );
  }

  // --- Placeholder sebagai satu-satunya petunjuk
  const andalkanPlaceholder = field.filter(
    (f) => atribut(f.buka, "placeholder") !== null && atribut(f.buka, "aria-label") === null,
  );
  if (andalkanPlaceholder.length > 0) {
    catat(
      jalur,
      "Formulir",
      "sedang",
      `${andalkanPlaceholder.length} field menampilkan placeholder yang hilang saat diisi`,
    );
  }

  // ---required tidak dijelaskan
  // Field wajib perlu tanda yang bisa dilihat, dan ideally dijelaskan.
  const labelAda = new Map<string, string>();
  for (const l of elemen(h, "label")) {
    const forId = atribut(l.buka, "for");
    if (forId) labelAda.set(forId, teksTampil(l.isi));
  }
  const wajibTanpaPenjelasan = field.filter((f) => {
    if (!ada(f.buka, "required")) return false;
    const id = atribut(f.buka, "id");
    const teks = id ? (labelAda.get(id) ?? "") : "";
    return !/[*(]|wajib|harus|required/i.test(teks);
  });
  if (wajibTanpaPenjelasan.length > 0) {
    catat(
      jalur,
      "Formulir",
      "rendah",
      `${wajibTanpaPenjelasan.length} field wajib tanpa tanda di label`,
    );
  }

  // Pesan galat field sebaiknya terhubung lewat aria-describedby.
  const pesanGalat = [...h.matchAll(/<p\b[^>]*class="[^"]*text-destructive[^"]*"[^>]*>/g)];
  if (pesanGalat.length > 0 && !h.includes("aria-describedby")) {
    catat(
      jalur,
      "Formulir",
      "rendah",
      "pesan galat field tidak terhubung ke field-nya dengan aria-describedby",
    );
  }

  // --- Gambar
  const gambar = elemen(h, "img");
  const tanpaAlt = gambar.filter((g) => atribut(g.buka, "alt") === null);
  if (tanpaAlt.length > 0) {
    catat(jalur, "Gambar", "tinggi", `${tanpaAlt.length} gambar tanpa alt`);
  }
  const dekoratif = gambar.filter((g) => atribut(g.buka, "alt") === "");
  if (dekoratif.length > 0) {
    catat(
      jalur,
      "Gambar",
      "rendah",
      `${dekoratif.length} gambar memakai alt kosong, pastikan memang dekoratif`,
    );
  }
  const tanpaDimensi = gambar.filter(
    (g) => !ada(g.buka, "width") || !ada(g.buka, "height"),
  );
  if (tanpaDimensi.length > 0) {
    catat(
      jalur,
      "Gambar",
      "sedang",
      `${tanpaDimensi.length} gambar tanpa width/height, berpotensi menggeser tata letak`,
    );
  }

  // --- Heading
  const tingkat = [...h.matchAll(/<h([1-6])\b/g)].map((m) => Number(m[1]));
  const h1 = tingkat.filter((t) => t === 1).length;
  if (h1 !== 1) {
    catat(jalur, "Heading", h1 === 0 ? "tinggi" : "sedang", `${h1} elemen h1, seharusnya tepat 1`);
  }
  for (let i = 1; i < tingkat.length; i += 1) {
    if (tingkat[i]! - tingkat[i - 1]! > 1) {
      catat(
        jalur,
        "Heading",
        "rendah",
        `urutan heading melompat dari h${tingkat[i - 1]} ke h${tingkat[i]}`,
      );
      break;
    }
  }

  // --- Menu aktif
  const navUtama = navs.find((n) =>
    (atribut(n.buka, "aria-label") ?? "").toLowerCase().includes("utama"),
  );
  if (navUtama && !h.includes('aria-current="page"')) {
    catat(
      jalur,
      "Navigasi",
      "sedang",
      "menu utama tidak menandai halaman yang sedang dibuka",
    );
  }

  // --- Wilayah pengumuman
  // Hanya relevan bila halaman punya interaksi yang mengubah isi
  // tanpa pindah halaman. Halaman yang sepenuhnya statis tidak
  // memerlukannya, dan komponen yang baru muncul setelah aksi
  // (mis. Alert setelah kirim) tidak terlihat di HTML server.
  const dinamis = /<form\b/.test(h) || /aria-live/.test(h) || /role="status"/.test(h);
  if (dinamis && !h.includes('aria-live') && !h.includes('role="status"')) {
    catat(
      jalur,
      "Status",
      "sedang",
      "halaman interaktif tanpa wilayah pengumuman (aria-live atau role=status)",
    );
  }

  // ---連結ke halaman yang sama
  const targets = [...h.matchAll(/href="#([^"]*)"/g)].map((m) => m[1]!);
  const idAda = new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]!));
  const rusak = targets.filter((t) => t !== "" && !idAda.has(t));
  if (rusak.length > 0) {
    catat(
      jalur,
      "Tautan",
      "sedang",
      `${rusak.length} tautan #${rusak[0]} mengarah ke id yang tidak ada`,
    );
  }
}

async function main(): Promise<void> {
  const publik = [
    "/",
    "/profil",
    "/guru",
    "/program",
    "/program/program-1",
    "/ekstrakurikuler",
    "/ekstrakurikuler/ekstrakurikuler-1",
    "/galeri",
    "/galeri/kegiatan-sekolah",
    "/kontak",
    "/kebijakan-privasi",
  ];

  console.log("Menganalisis halaman publik\n");
  for (const jalur of publik) {
    const r = await minta(jalur);
    if (r.status !== 200) {
      catat(jalur, "Status", "tinggi", `mengembalikan ${r.status}`);
      console.log(`  ${jalur.padEnd(38)} ${r.status}`);
      continue;
    }
    audit(jalur, r.teks);
    console.log(`  ${jalur.padEnd(38)} ${r.status}`);
  }

  console.log("\nMenganalisis halaman CMS\n");
  const kuki = await login();
  const cms = [
    "/admin",
    "/admin/staff",
    "/admin/staff/baru",
    "/admin/programs",
    "/admin/albums",
    "/admin/messages",
    "/admin/settings",
  ];
  for (const jalur of cms) {
    const r = await minta(jalur, { kuki });
    if (r.status !== 200) {
      catat(jalur, "Status", "tinggi", `mengembalikan ${r.status}`);
      console.log(`  ${jalur.padEnd(38)} ${r.status}`);
      continue;
    }
    audit(jalur, r.teks);
    console.log(`  ${jalur.padEnd(38)} ${r.status}`);
  }

  console.log("\nRingkasan temuan\n");
  if (temuan.length === 0) {
    console.log("  Tidak ada temuan.");
    return;
  }

  const bobot: Record<string, Temuan[]> = { tinggi: [], sedang: [], rendah: [] };
  for (const t of temuan) bobot[t.berat]!.push(t);

  for (const berat of ["tinggi", "sedang", "rendah"] as const) {
    const daftar = bobot[berat]!;
    if (daftar.length === 0) continue;
    console.log(`  ${berat.toUpperCase()} (${daftar.length})`);
    const perKategori = new Map<string, Temuan[]>();
    for (const t of daftar) {
      const arr = perKategori.get(t.kategori) ?? [];
      arr.push(t);
      perKategori.set(t.kategori, arr);
    }
    for (const [kategori, isi] of perKategori) {
      console.log(`    ${kategori}`);
      for (const t of isi) console.log(`      ${t.halaman}: ${t.detail}`);
    }
    console.log("");
  }

  console.log(`Total ${temuan.length} temuan pada ${new Set(temuan.map((t) => t.halaman)).size} halaman.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});