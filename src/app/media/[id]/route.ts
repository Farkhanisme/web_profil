import sharp from "sharp";
import { db } from "@/lib/db";
import type { MediaRow } from "@/lib/db/types";
import { mediaClient, parseLebar } from "@/lib/media";

/** Placeholder 1x1 WebP transparan, dipakai saat gambar gagal diambil. */
const PLACEHOLDER = Buffer.from(
  "UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==",
  "base64",
);

/** Lebar memuat penuh. Tanpa w, berkas asli dikirim apa adanya. */
const LEBAR_PENUH = 1600;

function headerCacheImmutable(): Record<string, string> {
  return {
    // Imagery tidak pernah berubah pada id yang sama: setiap unggahan
    // mendapat id baru, jadi cache ini selalu benar.
    "Cache-Control": "public, max-age=31536000, immutable",
    "Content-Type": "image/webp",
    // Aman: berkas keluar dari route ini tanpa data pengguna.
    "Cross-Origin-Resource-Policy": "cross-origin",
  };
}

/**
 * Proxy gambar.
 *
 * Menampilkan `<img src="/media/{id}?w=480">`. Token bot tidak pernah
 * muncul di HTML maupun URL sisi klien karena semua pengambilan berkas
 * terjadi di server.
 */
export async function GET(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
): Promise<Response> {
  const { id } = await ctx.params;
  const lebarDiminta = parseLebar(
    new URL(request.url).searchParams.get("w"),
  );

  const baris = await db.execute({
    sql: "SELECT id, tg_file_id, mime, width, height, bytes, alt FROM media WHERE id = ?",
    args: [id],
  });

  const media = baris.rows[0] as unknown as MediaRow | undefined;
  if (!media) {
    return new Response(PLACEHOLDER, { status: 404, headers: headerCacheImmutable() });
  }

  try {
    const client = mediaClient();
    const buffer = await client.load({
      fileId: media.tg_file_id,
      messageId: media.tg_message_id,
    });

    const lebar =
      lebarDiminta ??
      (media.width > LEBAR_PENUH ? LEBAR_PENUH : (media.width || LEBAR_PENUH));

    // Tanpa w: kirim berkas apa adanya supaya browser pun tidak
    // melakukan dekode ulang yang tidak perlu.
    if (lebarDiminta === null && media.width > LEBAR_PENUH) {
      const resized = await sharp(buffer)
        .resize({ width: LEBAR_PENUH, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      return new Response(new Uint8Array(resized), {
        status: 200,
        headers: headerCacheImmutable(),
      });
    }

    if (lebarDiminta !== null) {
      const thumbnail = await sharp(buffer)
        .resize({ width: lebar, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      return new Response(new Uint8Array(thumbnail), {
        status: 200,
        headers: headerCacheImmutable(),
      });
    }

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: headerCacheImmutable(),
    });
  } catch (error) {
    // Gambar tidak terjangkau: kirim placeholder supaya halaman publik
    // tetap utuh, bukan rusak.
    console.error(`Gagal mengambil media ${id}:`, error);
    return new Response(PLACEHOLDER, { status: 404, headers: headerCacheImmutable() });
  }
}
