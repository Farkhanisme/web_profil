/**
 * Nama tag cache.
 *
 * Disimpan di satu tempat supaya kueri (yang memasang tag) dan Server
 * Action (yang membatalkannya) tidak pernah salah eja.
 *
 * Catatan: nilai tag disimpan apa adanya di penyimpanan cache, jadi jangan
 * pernah menyertakan data pribadi atau rahasia di sini.
 */
export const TAG = {
  staff: "staff",
  programs: "programs",
  extracurriculars: "extracurriculars",
  albums: "albums",
  settings: "settings",
  /** Identitas sekolah, kontak, dan isi halaman profil. */
  profil: "profil",
  messages: "messages",
} as const;

export type NamaTag = (typeof TAG)[keyof typeof TAG];
