"use server";

import { updateTag } from "next/cache";
import { assertAdmin } from "@/lib/auth/dal";
import { db } from "@/lib/db";
import { TAG } from "@/lib/queries/cache-tags";

/**
 * Server Action modul pesan masuk.
 *
 * Pesan disimpan lebih dulu di database, baru notifikasi dikirim ke
 * Telegram. Bila notifikasi gagal, pesan tetap tersimpan dan admin
 * tetap bisa membacanya lewat CMS.
 */

export async function tandaiDibaca(formData: FormData): Promise<void> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await db.execute({
    sql: "UPDATE messages SET is_read = ?1 WHERE id = ?2",
    args: [formData.get("tandai") === "0" ? 0 : 1, id],
  });

  updateTag(TAG.messages);
}

/** Tandai beberapa pesan sekaligus. */
export async function tandaiSemuaDibaca(): Promise<void> {
  await assertAdmin();
  await db.execute("UPDATE messages SET is_read = 1 WHERE is_read = 0");
  updateTag(TAG.messages);
}

export async function hapusPesan(formData: FormData): Promise<void> {
  await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return;

  await db.execute({ sql: "DELETE FROM messages WHERE id = ?", args: [id] });

  updateTag(TAG.messages);
}