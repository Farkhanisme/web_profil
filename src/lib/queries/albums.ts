import "server-only";

import { cacheLife, cacheTag } from "next/cache";
import { query, queryOne } from "@/lib/db";
import type { AlbumRow, MediaRow } from "@/lib/db/types";
import { TAG } from "./cache-tags";

/**
 * Kueri album galeri dan foto di dalamnya.
 *
 * Foto diambil lengkap (tanpa pagination) karena satu album di sekolah
 * jarang berisi ratusan foto, dan halaman detailnya memakai lazy loading
 * di sisi peramban.
 */

interface BarisAlbum extends AlbumRow {
  jumlah_foto: number;
  c_id: string | null;
  c_file_id: string | null;
  c_mime: string | null;
  c_width: number | null;
  c_height: number | null;
  c_bytes: number | null;
  c_alt: string | null;
  c_created: number | null;
}

const KOLOM_SAMPUL = `
  c.id AS c_id, c.tg_file_id AS c_file_id, c.mime AS c_mime,
  c.width AS c_width, c.height AS c_height, c.bytes AS c_bytes,
  c.alt AS c_alt, c.created_at AS c_created`;

function mediaDari(
  id: string | null,
  fileId: string | null,
  mime: string | null,
  width: number | null,
  height: number | null,
  bytes: number | null,
  alt: string | null,
  dibuat: number | null,
): MediaRow | null {
  if (!id) return null;
  return {
    id,
    tg_file_id: fileId,
    tg_file_unique_id: null,
    tg_message_id: null,
    mime: mime ?? "image/webp",
    width: Number(width ?? 0),
    height: Number(height ?? 0),
    bytes: Number(bytes ?? 0),
    alt: alt ?? "",
    created_at: Number(dibuat ?? 0),
  };
}

function keDTO(b: BarisAlbum) {
  return {
    id: b.id,
    slug: b.slug,
    title: b.title,
    description: b.description,
    cover: mediaDari(
      b.c_id,
      b.c_file_id,
      b.c_mime,
      b.c_width,
      b.c_height,
      b.c_bytes,
      b.c_alt,
      b.c_created,
    ),
    photoCount: Number(b.jumlah_foto ?? 0),
    updatedAt: b.updated_at,
  };
}

/** Semua album beserta jumlah fotonya, untuk halaman daftar galeri. */
export async function albumSemua() {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const baris = await query<BarisAlbum>(
    `SELECT a.id, a.slug, a.title, a.description, a.cover_media_id,
            a.created_at, a.updated_at,
            (SELECT count(*) FROM photos p WHERE p.album_id = a.id) AS jumlah_foto,
            ${KOLOM_SAMPUL}
       FROM albums a
       LEFT JOIN media c ON c.id = a.cover_media_id
      ORDER BY a.updated_at DESC`,
  );
  return baris.map(keDTO);
}

/** Satu album. Null bila id tidak ada. */
export async function albumSatu(id: string) {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const baris = await queryOne<BarisAlbum>(
    `SELECT a.id, a.slug, a.title, a.description, a.cover_media_id,
            a.created_at, a.updated_at,
            (SELECT count(*) FROM photos p WHERE p.album_id = a.id) AS jumlah_foto,
            ${KOLOM_SAMPUL}
       FROM albums a
       LEFT JOIN media c ON c.id = a.cover_media_id
      WHERE a.id = ?1`,
    [id],
  );
  return baris ? keDTO(baris) : null;
}

/** Satu album berdasarkan slug (dipakai halaman publik). */
export async function albumBySlug(slug: string) {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const baris = await queryOne<BarisAlbum>(
    `SELECT a.id, a.slug, a.title, a.description, a.cover_media_id,
            a.created_at, a.updated_at,
            (SELECT count(*) FROM photos p WHERE p.album_id = a.id) AS jumlah_foto,
            ${KOLOM_SAMPUL}
       FROM albums a
       LEFT JOIN media c ON c.id = a.cover_media_id
      WHERE a.slug = ?1`,
    [slug],
  );
  return baris ? keDTO(baris) : null;
}

/** Foto-foto dalam satu album, urut sesuai urutan yang diatur. */
export async function fotoAlbum(albumId: string) {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const baris = await query<{
    id: string;
    album_id: string;
    caption: string;
    sort_order: number;
    created_at: number;
    m_id: string;
    m_mime: string;
    m_width: number;
    m_height: number;
    m_bytes: number;
    m_alt: string;
    m_created: number;
  }>(
    `SELECT p.id, p.album_id, p.caption, p.sort_order, p.created_at,
            m.id AS m_id, m.mime AS m_mime, m.width AS m_width,
            m.height AS m_height, m.bytes AS m_bytes, m.alt AS m_alt,
            m.created_at AS m_created
       FROM photos p
       JOIN media m ON m.id = p.media_id
      WHERE p.album_id = ?1
      ORDER BY p.sort_order ASC, p.created_at ASC`,
    [albumId],
  );

  return baris.map((b) => ({
    id: b.id,
    albumId: b.album_id,
    caption: b.caption,
    media: {
      id: b.m_id,
      mime: b.m_mime,
      width: Number(b.m_width),
      height: Number(b.m_height),
      bytes: Number(b.m_bytes),
      alt: b.m_alt,
      createdAt: Number(b.m_created),
    },
  }));
}

/** Enam foto terbaru untuk cuplikan di beranda. */
export async function fotoTerbaru(jumlah = 6) {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const baris = await query<{
    id: string;
    media_id: string;
    caption: string;
    m_mime: string;
    m_width: number;
    m_height: number;
    m_alt: string;
  }>(
    `SELECT p.id, p.media_id, p.caption,
            m.mime AS m_mime, m.width AS m_width, m.height AS m_height,
            m.alt AS m_alt
       FROM photos p
       JOIN media m ON m.id = p.media_id
      ORDER BY p.created_at DESC
      LIMIT ?1`,
    [jumlah],
  );

  return baris.map((b) => ({
    id: b.id,
    mediaId: b.media_id,
    caption: b.caption,
    width: Number(b.m_width),
    height: Number(b.m_height),
    alt: b.m_alt,
  }));
}

export async function jumlahAlbum(): Promise<number> {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const r = await queryOne<{ c: number }>("SELECT count(*) AS c FROM albums");
  return Number(r?.c ?? 0);
}

export async function jumlahFoto(): Promise<number> {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const r = await queryOne<{ c: number }>("SELECT count(*) AS c FROM photos");
  return Number(r?.c ?? 0);
}

/** Semua slug album, dipakai sitemap. */
export async function semuaSlugAlbum(): Promise<string[]> {
  "use cache";
  cacheTag(TAG.albums);
  cacheLife("max");

  const baris = await query<{ slug: string }>("SELECT slug FROM albums");
  return baris.map((r) => r.slug);
}

export type BarisFoto = Awaited<ReturnType<typeof fotoAlbum>>[number];
export type DTOAlbum = Awaited<ReturnType<typeof albumSemua>>[number];
