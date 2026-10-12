/**
 * Tipe baris tabel dan bentuk DTO yang dipakai halaman publik.
 *
 * Baris database (suffix `Row`) mengikuti apa adanya SQLite: integer 0/1
 * untuk boolean dan angka untuk waktu. Bentuk yang lebih ramah (`Staff`,
 * `Program`, dst.) sudah dikonversi dan itulah yang dipakai komponen React.
 */

import { toBool } from "./client";

export interface AdminRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: number;
}

export interface MediaRow {
  id: string;
  /** NULL berarti berkas disimpan lokal (mode pengembangan) */
  tg_file_id: string | null;
  tg_file_unique_id: string | null;
  tg_message_id: number | null;
  mime: string;
  width: number;
  height: number;
  bytes: number;
  alt: string;
  created_at: number;
}

export interface StaffRow {
  id: string;
  name: string;
  position: string;
  subject: string;
  photo_media_id: string | null;
  sort_order: number;
  is_published: number;
  created_at: number;
  updated_at: number;
}

export interface ProgramRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  image_media_id: string | null;
  sort_order: number;
  is_published: number;
  updated_at: number;
}

export interface ExtracurricularRow {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  schedule: string;
  coach: string;
  image_media_id: string | null;
  sort_order: number;
  is_published: number;
  updated_at: number;
}

export interface AlbumRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover_media_id: string | null;
  created_at: number;
  updated_at: number;
}

export interface PhotoRow {
  id: string;
  album_id: string;
  media_id: string;
  caption: string;
  sort_order: number;
  created_at: number;
}

export interface MessageRow {
  id: string;
  name: string;
  contact: string;
  body: string;
  is_read: number;
  ip_hash: string;
  created_at: number;
}

export interface RateLimitRow {
  key: string;
  count: number;
  window_start: number;
}

/* ------------------------------------------------------------------ */
/* Bentuk yang dipakai komponen React                                  */
/* ------------------------------------------------------------------ */

export interface MediaDTO {
  id: string;
  width: number;
  height: number;
  alt: string;
}

export interface Staff {
  id: string;
  name: string;
  position: string;
  subject: string;
  photo: MediaDTO | null;
}

export interface Program {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  image: MediaDTO | null;
  updatedAt: number;
}

export interface Extracurricular {
  id: string;
  slug: string;
  name: string;
  summary: string;
  description: string;
  schedule: string;
  coach: string;
  image: MediaDTO | null;
  updatedAt: number;
}

export interface Album {
  id: string;
  slug: string;
  title: string;
  description: string;
  cover: MediaDTO | null;
  photoCount: number;
  updatedAt: number;
}

export interface Photo {
  id: string;
  albumId: string;
  caption: string;
  media: MediaDTO;
}

export interface ContactMessage {
  id: string;
  name: string;
  contact: string;
  body: string;
  isRead: boolean;
  createdAt: number;
}

/* ------------------------------------------------------------------ */
/* Pemetaan baris -> DTO                                              */
/* ------------------------------------------------------------------ */

export function mediaToDTO(row: MediaRow | null | undefined): MediaDTO | null {
  if (!row) return null;
  return { id: row.id, width: row.width, height: row.height, alt: row.alt };
}

export function staffToDTO(
  row: StaffRow,
  photo: MediaRow | null,
): Staff {
  return {
    id: row.id,
    name: row.name,
    position: row.position,
    subject: row.subject,
    photo: mediaToDTO(photo),
  };
}

export function programToDTO(
  row: ProgramRow,
  image: MediaRow | null,
): Program {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    image: mediaToDTO(image),
    updatedAt: row.updated_at,
  };
}

export function extracurricularToDTO(
  row: ExtracurricularRow,
  image: MediaRow | null,
): Extracurricular {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    summary: row.summary,
    description: row.description,
    schedule: row.schedule,
    coach: row.coach,
    image: mediaToDTO(image),
    updatedAt: row.updated_at,
  };
}

export function albumToDTO(row: AlbumRow, cover: MediaRow | null): Album {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    cover: mediaToDTO(cover),
    photoCount: 0,
    updatedAt: row.updated_at,
  };
}

export function photoToDTO(row: PhotoRow, media: MediaRow): Photo {
  return {
    id: row.id,
    albumId: row.album_id,
    caption: row.caption,
    media: {
      id: media.id,
      width: media.width,
      height: media.height,
      alt: media.alt,
    },
  };
}

export function messageToDTO(row: MessageRow): ContactMessage {
  return {
    id: row.id,
    name: row.name,
    contact: row.contact,
    body: row.body,
    isRead: toBool(row.is_read),
    createdAt: row.created_at,
  };
}
