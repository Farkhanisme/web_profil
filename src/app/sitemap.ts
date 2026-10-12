import type { MetadataRoute } from "next";
import { baseUrl } from "@/config/site";
import {
  semuaSlugEkstrakurikuler,
  semuaSlugProgram,
} from "@/lib/queries/konten";
import { semuaSlugAlbum } from "@/lib/queries/albums";
import { profil } from "@/config/profil";

/**
 * Peta situs.
 *
 * Halaman statis dan halaman detail program, ekstrakurikuler, serta album
 * ikut dicantumkan. Daftar guru sengaja TIDAK dimasukkan satu per satu:
 * terlalu banyak halaman dengan nilai yang serupa tidak membantu
 * penemuan, dan tidak ada slug untuk setiap orang.
 *
 * `lastModified` diambil dari data, bukan dari waktu build.
 */

type Frekuensi =
  | "always"
  | "hourly"
  | "daily"
  | "weekly"
  | "monthly"
  | "yearly"
  | "never";

/** [jalur, prioritas, frekuensi perubahan] */
const HALAMAN_STATIS: Array<[string, number, Frekuensi]> = [
  ["/", 1.0, "daily"],
  ["/profil", 0.9, "monthly"],
  ["/guru", 0.8, "weekly"],
  ["/program", 0.8, "weekly"],
  ["/ekstrakurikuler", 0.8, "weekly"],
  ["/galeri", 0.7, "weekly"],
  ["/kontak", 0.7, "monthly"],
  ["/kebijakan-privasi", 0.3, "yearly"],
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dasar = baseUrl();

  const tanggalProfil = Math.floor(
    Date.parse(`${profil.updatedAt}T00:00:00Z`) / 1000,
  );

  const statis: MetadataRoute.Sitemap = HALAMAN_STATIS.map(
    ([jalur, prioritas, frekuensi]) => ({
      url: `${dasar}${jalur === "/" ? "" : jalur}`,
      lastModified: jalur === "/profil" ? new Date(tanggalProfil * 1000) : new Date(),
      changeFrequency: frekuensi,
      priority: prioritas,
    }),
  );

  const [slugProgram, slugEkstra, slugAlbumDaftar] = await Promise.all([
    semuaSlugProgram(),
    semuaSlugEkstrakurikuler(),
    semuaSlugAlbum(),
  ]);

  const detailProgram: MetadataRoute.Sitemap = slugProgram.map((slug) => ({
    url: `${dasar}/program/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const detailEkstra: MetadataRoute.Sitemap = slugEkstra.map((slug) => ({
    url: `${dasar}/ekstrakurikuler/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const detailAlbum: MetadataRoute.Sitemap = slugAlbumDaftar.map((slug) => ({
    url: `${dasar}/galeri/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...statis, ...detailProgram, ...detailEkstra, ...detailAlbum];
}