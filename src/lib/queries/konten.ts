import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { query, queryOne } from "@/lib/db";
import type {
  Album,
  AlbumRow,
  ExtracurricularRow,
  MediaDTO,
  MediaRow,
  Photo,
  PhotoRow,
  ProgramRow,
} from "@/lib/db/types";
import { extracurricularToDTO, programToDTO } from "@/lib/db/types";
import { TAG } from "./cache-tags";

/**
 * Kueri program sekolah dan ekstrakurikuler.
 *
 * Bentuknya sengaja dibuat sama karena keduanya dipakai oleh halaman
 * publik dengan cara yang sama: daftar di satu halaman, detail per slug.
 */

/** Baris hasil JOIN: kolom program/ekstrakurikuler + kolom media. */
interface BarisKonten extends ProgramRow, ExtracurricularRow {
  m_id: string | null;
  m_file_id: string | null;
  m_mime: string | null;
  m_width: number | null;
  m_height: number | null;
  m_bytes: number | null;
  m_alt: string | null;
  m_created: number | null;
}

type BarisProgram = BarisKonten;

const KOLOM_PROGRAM = `
  p.id, p.slug, p.name, p.summary, p.description, p.image_media_id,
  p.sort_order, p.is_published, p.updated_at`;

const KOLOM_MEDIA = `
  m.id AS m_id, m.tg_file_id AS m_file_id, m.mime AS m_mime,
  m.width AS m_width, m.height AS m_height, m.bytes AS m_bytes,
  m.alt AS m_alt, m.created_at AS m_created`;

function mediaDari(b: BarisProgram): MediaRow | null {
  if (!b.m_id) return null;
  return {
    id: b.m_id,
    tg_file_id: b.m_file_id,
    tg_file_unique_id: null,
    tg_message_id: null,
    mime: b.m_mime ?? "image/webp",
    width: Number(b.m_width ?? 0),
    height: Number(b.m_height ?? 0),
    bytes: Number(b.m_bytes ?? 0),
    alt: b.m_alt ?? "",
    created_at: Number(b.m_created ?? 0),
  };
}

/* ----------------------------- Program ------------------------------ */

export async function programTerbit() {
  "use cache";
  cacheTag(TAG.programs);
  cacheLife("max");

  const baris = await query<BarisProgram>(
    `SELECT ${KOLOM_PROGRAM}, ${KOLOM_MEDIA}
       FROM programs p
       LEFT JOIN media m ON m.id = p.image_media_id
      WHERE p.is_published = 1
      ORDER BY p.sort_order ASC, p.name ASC`,
  );
  return baris.map((b) => programToDTO(b, mediaDari(b)));
}

export async function programSemua() {
  "use cache";
  cacheTag(TAG.programs);
  cacheLife("max");

  const baris = await query<BarisProgram>(
    `SELECT ${KOLOM_PROGRAM}, ${KOLOM_MEDIA}
       FROM programs p
       LEFT JOIN media m ON m.id = p.image_media_id
      ORDER BY p.sort_order ASC, p.name ASC`,
  );
  return baris.map((b) => programToDTO(b, mediaDari(b)));
}

/** Detail program berdasarkan slug (dipakai halaman publik). */
export async function programBySlug(slug: string) {
  "use cache";
  cacheTag(TAG.programs);
  cacheLife("max");

  const baris = await queryOne<BarisProgram>(
    `SELECT ${KOLOM_PROGRAM}, ${KOLOM_MEDIA}
       FROM programs p
       LEFT JOIN media m ON m.id = p.image_media_id
      WHERE p.slug = ?1 AND p.is_published = 1`,
    [slug],
  );
  return baris ? programToDTO(baris, mediaDari(baris)) : null;
}

/** Satu program untuk form ubah. */
export async function programSatu(id: string) {
  "use cache";
  cacheTag(TAG.programs);
  cacheLife("max");

  const baris = await queryOne<BarisProgram>(
    `SELECT ${KOLOM_PROGRAM}, ${KOLOM_MEDIA}
       FROM programs p
       LEFT JOIN media m ON m.id = p.image_media_id
      WHERE p.id = ?1`,
    [id],
  );
  return baris ? programToDTO(baris, mediaDari(baris)) : null;
}

/** Semua slug program, dipakai sitemap dan cek keunikan. */
export async function semuaSlugProgram(): Promise<string[]> {
  "use cache";
  cacheTag(TAG.programs);
  cacheLife("max");

  const baris = await query<{ slug: string }>("SELECT slug FROM programs");
  return baris.map((r) => r.slug);
}

export async function jumlahProgram(): Promise<number> {
  "use cache";
  cacheTag(TAG.programs);
  cacheLife("max");

  const r = await queryOne<{ c: number }>("SELECT count(*) AS c FROM programs");
  return Number(r?.c ?? 0);
}

/* -------------------------- Ekstrakurikuler ------------------------- */

export async function ekstrakurikulerTerbit() {
  "use cache";
  cacheTag(TAG.extracurriculars);
  cacheLife("max");

  const baris = await query<BarisProgram>(
    `SELECT p.id, p.slug, p.name, p.summary, p.description, p.schedule, p.coach,
            p.image_media_id, p.sort_order, p.is_published, p.updated_at,
            ${KOLOM_MEDIA}
       FROM extracurriculars p
       LEFT JOIN media m ON m.id = p.image_media_id
      WHERE p.is_published = 1
      ORDER BY p.sort_order ASC, p.name ASC`,
  );
  return baris.map((b) => extracurricularToDTO(b, mediaDari(b)));
}

export async function ekstrakurikulerSemua() {
  "use cache";
  cacheTag(TAG.extracurriculars);
  cacheLife("max");

  const baris = await query<BarisProgram>(
    `SELECT p.id, p.slug, p.name, p.summary, p.description, p.schedule, p.coach,
            p.image_media_id, p.sort_order, p.is_published, p.updated_at,
            ${KOLOM_MEDIA}
       FROM extracurriculars p
       LEFT JOIN media m ON m.id = p.image_media_id
      ORDER BY p.sort_order ASC, p.name ASC`,
  );
  return baris.map((b) => extracurricularToDTO(b, mediaDari(b)));
}

export async function ekstrakurikulerBySlug(slug: string) {
  "use cache";
  cacheTag(TAG.extracurriculars);
  cacheLife("max");

  const baris = await queryOne<BarisProgram>(
    `SELECT p.id, p.slug, p.name, p.summary, p.description, p.schedule, p.coach,
            p.image_media_id, p.sort_order, p.is_published, p.updated_at,
            ${KOLOM_MEDIA}
       FROM extracurriculars p
       LEFT JOIN media m ON m.id = p.image_media_id
      WHERE p.slug = ?1 AND p.is_published = 1`,
    [slug],
  );
  return baris ? extracurricularToDTO(baris, mediaDari(baris)) : null;
}

export async function ekstrakurikulerSatu(id: string) {
  "use cache";
  cacheTag(TAG.extracurriculars);
  cacheLife("max");

  const baris = await queryOne<BarisProgram>(
    `SELECT p.id, p.slug, p.name, p.summary, p.description, p.schedule, p.coach,
            p.image_media_id, p.sort_order, p.is_published, p.updated_at,
            ${KOLOM_MEDIA}
       FROM extracurriculars p
       LEFT JOIN media m ON m.id = p.image_media_id
      WHERE p.id = ?1`,
    [id],
  );
  return baris ? extracurricularToDTO(baris, mediaDari(baris)) : null;
}

export async function semuaSlugEkstrakurikuler(): Promise<string[]> {
  "use cache";
  cacheTag(TAG.extracurriculars);
  cacheLife("max");

  const baris = await query<{ slug: string }>(
    "SELECT slug FROM extracurriculars",
  );
  return baris.map((r) => r.slug);
}

export async function jumlahEkstrakurikuler(): Promise<number> {
  "use cache";
  cacheTag(TAG.extracurriculars);
  cacheLife("max");

  const r = await queryOne<{ c: number }>(
    "SELECT count(*) AS c FROM extracurriculars",
  );
  return Number(r?.c ?? 0);
}

/* =====================================================================
   ALBUM & FOTO
   ===================================================================== */

const KOLOM_ALBUM = `
  a.id, a.slug, a.title, a.description, a.cover_media_id,
  a.created_at, a.updated_at`;
const KOLOM_PHOTO = `
  ph.id, ph.album_id, ph.media_id, ph.caption, ph.sort_order,
  ph.created_at`;
const KOLOM_MEDIA_PHOTO = `
  m.id AS m_id, m.tg_file_id AS m_tg_file_id, m.tg_file_unique_id AS m_tg_file_unique_id,
  m.tg_message_id AS m_tg_message_id, m.mime AS m_mime, m.width AS m_width,
  m.height AS m_height, m.bytes AS m_bytes, m.alt AS m_alt, m.created_at AS m_created`;

interface BarisAlbum extends AlbumRow {
  m_id: string | null;
  m_tg_file_id: string | null;
  m_tg_file_unique_id: string | null;
  m_tg_message_id: number | null;
  m_mime: string | null;
  m_width: number | null;
  m_height: number | null;
  m_bytes: number | null;
  m_alt: string | null;
  m_created: number | null;
}

interface BarisPhoto extends PhotoRow {
  m_id: string | null;
  m_tg_file_id: string | null;
  m_mime: string | null;
  m_width: number | null;
  m_height: number | null;
  m_bytes: number | null;
  m_alt: string | null;
  m_created: number | null;
}

function mediaDariAlbum(b: BarisAlbum): MediaDTO | null {
  if (!b.m_id) return null;
  return {
    id: b.m_id,
    tg_file_id: b.m_tg_file_id ?? "",
    tg_file_unique_id: null,
    tg_message_id: null,
    mime: b.m_mime ?? "image/webp",
    width: Number(b.m_width ?? 0),
    height: Number(b.m_height ?? 0),
    bytes: Number(b.m_bytes ?? 0),
    alt: b.m_alt ?? "",
    created_at: Number(b.m_created ?? 0),
  };
}

function mediaDariPhoto(b: BarisPhoto): MediaDTO | null {
  if (!b.m_id) return null;
  return {
    id: b.m_id,
    tg_file_id: b.m_tg_file_id ?? "",
    tg_file_unique_id: null,
    tg_message_id: null,
    mime: b.m_mime ?? "image/webp",
    width: Number(b.m_width ?? 0),
    height: Number(b.m_height ?? 0),
    bytes: Number(b.m_bytes ?? 0),
    alt: b.m_alt ?? "",
    created_at: Number(b.m_created ?? 0),
  };
}

export async function albumTerbit(): Promise<Album[]> {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const baris = await query<BarisAlbum>(`
    SELECT ${KOLOM_ALBUM}, ${KOLOM_MEDIA_PHOTO}
      FROM albums a
      LEFT JOIN media m ON m.id = a.cover_media_id
     ORDER BY a.updated_at DESC
  `);

  // Hitung jumlah foto per album
  const albumIds = baris.map((b) => b.id);
  const counts: Record<string, number> = {};
  if (albumIds.length > 0) {
    const q = `SELECT album_id, count(*) AS c FROM photos WHERE album_id IN (${albumIds.map(() => "?").join(",")}) GROUP BY album_id`;
    const rows = await query<{ album_id: string; c: number }>(q, albumIds);
    for (const r of rows) counts[r.album_id] = Number(r.c);
  }

  return baris.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    description: b.description,
    cover: mediaDariAlbum(b),
    photoCount: counts[b.id] ?? 0,
    updatedAt: Number(b.updated_at),
  }));
}

export async function albumSemua(): Promise<Album[]> {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const baris = await query<BarisAlbum>(`
    SELECT ${KOLOM_ALBUM}, ${KOLOM_MEDIA_PHOTO}
      FROM albums a
      LEFT JOIN media m ON m.id = a.cover_media_id
     ORDER BY a.updated_at DESC
  `);

  return baris.map((b) => ({
    id: b.id,
    slug: b.slug,
    title: b.title,
    description: b.description,
    cover: mediaDariAlbum(b),
    photoCount: 0,
    updatedAt: Number(b.updated_at),
  }));
}

export async function albumBySlug(slug: string): Promise<Album | null> {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const baris = await query<BarisAlbum>(`
    SELECT ${KOLOM_ALBUM}, ${KOLOM_MEDIA_PHOTO}
      FROM albums a
      LEFT JOIN media m ON m.id = a.cover_media_id
     WHERE a.slug = ?
  `, [slug]);

  if (baris.length === 0) return null;

  const b = baris[0];
  const countRow = await queryOne<{ c: number }>(
    "SELECT count(*) AS c FROM photos WHERE album_id = ?",
    [b.id],
  );
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    description: b.description,
    cover: mediaDariAlbum(b),
    photoCount: Number(countRow?.c ?? 0),
    updatedAt: Number(b.updated_at),
  };
}

export async function albumSatu(id: string): Promise<Album | null> {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const baris = await query<BarisAlbum>(`
    SELECT ${KOLOM_ALBUM}, ${KOLOM_MEDIA_PHOTO}
      FROM albums a
      LEFT JOIN media m ON m.id = a.cover_media_id
     WHERE a.id = ?
  `, [id]);

  if (baris.length === 0) return null;
  const b = baris[0];
  const countRow = await queryOne<{ c: number }>(
    "SELECT count(*) AS c FROM photos WHERE album_id = ?",
    [b.id],
  );
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    description: b.description,
    cover: mediaDariAlbum(b),
    photoCount: Number(countRow?.c ?? 0),
    updatedAt: Number(b.updated_at),
  };
}

export async function photoSemua(albumId: string): Promise<Photo[]> {
  const baris = await query<BarisPhoto>(`
    SELECT ${KOLOM_PHOTO}, ${KOLOM_MEDIA_PHOTO}
      FROM photos ph
      INNER JOIN media m ON m.id = ph.media_id
     WHERE ph.album_id = ?
     ORDER BY ph.sort_order ASC, ph.created_at ASC
  `, [albumId]);

  return baris.map((b) => ({
    id: b.id,
    albumId: b.album_id,
    caption: b.caption,
    media: mediaDariPhoto(b)!,
  }));
}

export async function photoSatu(id: string): Promise<Photo | null> {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const baris = await query<BarisPhoto>(`
    SELECT ${KOLOM_PHOTO}, ${KOLOM_MEDIA_PHOTO}
      FROM photos ph
      LEFT JOIN media m ON m.id = ph.media_id
     WHERE ph.id = ?
  `, [id]);

  return baris.length > 0
    ? {
        id: baris[0].id,
        albumId: baris[0].album_id,
        caption: baris[0].caption,
        media: mediaDariPhoto(baris[0])!,
      }
    : null;
}

export async function semuaSlugAlbum(): Promise<string[]> {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const baris = await query<{ slug: string }>("SELECT slug FROM albums");
  return baris.map((r) => r.slug);
}

export async function jumlahAlbum(): Promise<number> {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const r = await queryOne<{ c: number }>("SELECT count(*) AS c FROM albums");
  return Number(r?.c ?? 0);
}
