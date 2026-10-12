"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { assertAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { newId } from "@/lib/ids";
import { nowSeconds } from "@/lib/db/client";
import { slugUnik } from "@/lib/slug";
import { TAG } from "@/lib/queries/cache-tags";
import {
  albumSchema,
  galatPerField,
  kosongkan,
  pilihSampulSchema,
  sisipFotoSchema,
  ubahKeteranganSchema,
} from "@/lib/schemas/album";

/**
 * Server Action modul galeri.
 *
 *Foto disisipkan satu per satu lewat `sisipFoto()` yang dipanggil tepat
 * setelah satu berkas selesai terunggah. Dengan begitu kegagalan satu
 * berkas tidak membatalkan berkas lain di antrean.
 */

export type AlbumState = {
  error?: string;
  fieldErrors?: Record<string, string[]>;
} | undefined;

async function albumAda(id: string): Promise<boolean> {
  const r = await db.execute({ sql: "SELECT id FROM albums WHERE id = ?", args: [id] });
  return r.rows.length > 0;
}

/** True bila media sudah dipakai foto di dalam album ini. */
async function mediaSudahDipakai(albumId: string, mediaId: string): Promise<boolean> {
  const r = await db.execute({
    sql: "SELECT id FROM photos WHERE album_id = ?1 AND media_id = ?2",
    args: [albumId, mediaId],
  });
  return r.rows.length > 0;
}

/* ------------------------------ Album -------------------------------- */

export async function simpanAlbum(
  _state: AlbumState,
  formData: FormData,
): Promise<AlbumState> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();

  const hasil = albumSchema.safeParse({
    title: formData.get("title"),
    slug: formData.get("slug") ?? "",
    description: formData.get("description") ?? "",
    cover_media_id: formData.get("cover_media_id") ?? "",
  });

  if (!hasil.success) {
    return {
      error: "Periksa kembali data yang diisi.",
      fieldErrors: galatPerField(hasil.error),
    };
  }

  const data = hasil.data;
  const slug = data.slug
    ? data.slug
    : await slugUnik(async (k) => {
        const r = await db.execute({
          sql: "SELECT id FROM albums WHERE slug = ?",
          args: [k],
        });
        return r.rows.length > 0;
      }, data.title);

  // Bila cover diisi, pastikan media itu benar-benar ada.
  const cover = kosongkan(data.cover_media_id);
  if (cover) {
    const cek = await db.execute({
      sql: "SELECT id FROM media WHERE id = ?",
      args: [cover],
    });
    if (cek.rows.length === 0) {
      return { error: "Gambar sampul tidak ditemukan." };
    }
  }

  const sekarang = nowSeconds();

  if (id) {
    if (!(await albumAda(id))) return { error: "Album tidak ditemukan." };

    await db.execute({
      sql: `UPDATE albums SET
              title = ?1, slug = ?2, description = ?3,
              cover_media_id = ?4, updated_at = ?5
            WHERE id = ?6`,
      args: [data.title, slug, data.description, cover, sekarang, id],
    });

    updateTag(TAG.albums);
    redirect(`/admin/albums/${id}?saved=1`);
  }

  const baru = newId();
  await db.execute({
    sql: `INSERT INTO albums (id, slug, title, description, cover_media_id, created_at, updated_at)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6)`,
    args: [baru, slug, data.title, data.description, cover, sekarang],
  });

  updateTag(TAG.albums);
  redirect(`/admin/albums/${baru}?created=1`);
}

/**
 * Hapus album. Foto di dalamnya ikut terhapus karena batasan
 * `ON DELETE CASCADE` pada tabel photos. Baris media dibiarkan.
 */
export async function hapusAlbum(formData: FormData): Promise<void> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await db.execute({ sql: "DELETE FROM albums WHERE id = ?", args: [id] });

  updateTag(TAG.albums);
  redirect("/admin/albums?deleted=1");
}

/* -------------------------------- Foto ------------------------------- */

/**
 * Sisipkan satu foto ke album.
 *
 * Dipanggil satu per satu setelah unggah berhasil, sehingga satu
 * kegagalan tidak menghentikan foto lain.
 */
export async function sisipFoto(
  masukan: { albumId: string; mediaId: string; caption?: string },
): Promise<{ ok: boolean; galat?: string }> {
  await assertAdmin();

  const hasil = sisipFotoSchema.safeParse({
    albumId: masukan.albumId,
    mediaId: masukan.mediaId,
    caption: masukan.caption ?? "",
  });

  if (!hasil.success) {
    return { ok: false, galat: hasil.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { albumId, mediaId, caption } = hasil.data;

  if (!(await albumAda(albumId))) {
    return { ok: false, galat: "Album tidak ditemukan." };
  }

  const media = await db.execute({
    sql: "SELECT id FROM media WHERE id = ?",
    args: [mediaId],
  });
  if (media.rows.length === 0) {
    return { ok: false, galat: "Gambar tidak ditemukan." };
  }

  // Foto yang sama tidak diunggah dua kali ke album yang sama.
  if (await mediaSudahDipakai(albumId, mediaId)) {
    return { ok: false, galat: "Foto ini sudah ada di album tersebut." };
  }

  const akhir = await db.execute({
    sql: "SELECT coalesce(max(sort_order), 0) AS n FROM photos WHERE album_id = ?",
    args: [albumId],
  });
  const urutan = Number((akhir.rows[0] as unknown as { n: number }).n) + 1;

  await db.execute({
    sql: `INSERT INTO photos (id, album_id, media_id, caption, sort_order, created_at)
          VALUES (?1, ?2, ?3, ?4, ?5, ?6)`,
    args: [newId(), albumId, mediaId, caption, urutan, nowSeconds()],
  });

  // Album ikut berubah karena jumlah fotonya bertambah.
  await db.execute({
    sql: "UPDATE albums SET updated_at = ?1 WHERE id = ?2",
    args: [nowSeconds(), albumId],
  });

  updateTag(TAG.albums);
  return { ok: true };
}

/** Ubah keterangan satu foto. */
export async function ubahKeterangan(masukan: {
  photoId: string;
  caption: string;
}): Promise<{ ok: boolean; galat?: string }> {
  await assertAdmin();

  const hasil = ubahKeteranganSchema.safeParse(masukan);
  if (!hasil.success) {
    return { ok: false, galat: hasil.error.issues[0]?.message ?? "Data tidak valid." };
  }

  await db.execute({
    sql: "UPDATE photos SET caption = ?1 WHERE id = ?2",
    args: [hasil.data.caption, hasil.data.photoId],
  });

  updateTag(TAG.albums);
  return { ok: true };
}

/** Hapus satu foto dari album. Baris media dibiarkan. */
export async function hapusFoto(formData: FormData): Promise<void> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  // media_id ditangkap lebih dulu: setelah baris dihapus, subquery
  // tidak akan menemukan apa pun.
  const foto = await db.execute({
    sql: "SELECT album_id, media_id FROM photos WHERE id = ?",
    args: [id],
  });
  if (foto.rows.length === 0) return;

  const baris = foto.rows[0] as unknown as { album_id: string; media_id: string };

  await db.execute({ sql: "DELETE FROM photos WHERE id = ?", args: [id] });

  // Bila sampul album menunjuk foto yang dihapus, sampul dikosongkan
  // supaya halaman publik tidak memakai gambar yang sudah tidak ada.
  await db.execute({
    sql: `UPDATE albums SET cover_media_id = NULL, updated_at = ?1
           WHERE id = ?2 AND cover_media_id = ?3`,
    args: [nowSeconds(), baris.album_id, baris.media_id],
  });

  updateTag(TAG.albums);
}

/** Jadikan salah satu foto sebagai sampul album. */
export async function pilihSampul(masukan: {
  albumId: string;
  mediaId: string;
}): Promise<{ ok: boolean; galat?: string }> {
  await assertAdmin();

  const hasil = pilihSampulSchema.safeParse(masukan);
  if (!hasil.success) {
    return { ok: false, galat: hasil.error.issues[0]?.message ?? "Data tidak valid." };
  }

  const { albumId, mediaId } = hasil.data;

  if (!(await albumAda(albumId))) {
    return { ok: false, galat: "Album tidak ditemukan." };
  }

  const media = kosongkan(mediaId);

  // Sampul hanya boleh menunjuk foto yang benar-benar ada di album ini.
  if (media) {
    const cek = await db.execute({
      sql: "SELECT id FROM photos WHERE album_id = ?1 AND media_id = ?2",
      args: [albumId, media],
    });
    if (cek.rows.length === 0) {
      return { ok: false, galat: "Sampul harus menunjuk salah satu foto di album ini." };
    }
  }

  await db.execute({
    sql: "UPDATE albums SET cover_media_id = ?1, updated_at = ?2 WHERE id = ?3",
    args: [media, nowSeconds(), albumId],
  });

  updateTag(TAG.albums);
  return { ok: true };
}
