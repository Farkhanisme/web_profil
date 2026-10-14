import { Home, School, Users, UserPlus } from "lucide-react";

/**
 * Menu situs publik.
 *
 * Ringkas: empat tujuan yang benar-benar dipakai orang tua. Menu yang
 * panjang justru memperlambat orang tua yang terbiasa dengan
 * empat tab di WhatsApp.
 *
 * Ikon memakai lucide-react agar konsisten dengan stroke yang sama.
 */
export const MENU_PUBLIK = [
  { href: "/", label: "Beranda", ikon: Home },
  { href: "/profil", label: "Profil", ikon: School },
  { href: "/guru", label: "Guru dan Staf", ikon: Users },
  { href: "/#daftar", label: "Daftar", ikon: UserPlus },
] as const;

/**
 * Semua halaman publik, untuk footer dan halaman 404.
 *
 * Menu utama (`MENU_PUBLIK`) sengaja hanya empat tujuan supaya tidak
 * berdesakan di ponsel. Semua halaman tetap harus bisa dijangkau, jadi
 * footer memakai daftar lengkap ini. Tanpa daftar ini, halaman program,
 * ekstrakurikuler, galeri, dan kontak menjadi halaman yatim: tidak ada
 * satu pun tautan masuk dari halaman lain.
 */
export const HALAMAN_PUBLIK = [
  { href: "/profil", label: "Profil Madrasah" },
  { href: "/guru", label: "Guru dan Staf" },
  { href: "/program", label: "Program Sekolah" },
  { href: "/ekstrakurikuler", label: "Ekstrakurikuler" },
  { href: "/galeri", label: "Galeri Foto" },
  { href: "/kontak", label: "Kontak dan Pendaftaran" },
  { href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
] as const;

/** Label breadcrumb untuk segmen URL yang tidak bisa ditebak. */
export const LABEL_JALUR: Record<string, string> = {
  profil: "Profil",
  guru: "Guru dan Staf",
  program: "Program",
  ekstrakurikuler: "Ekstrakurikuler",
  galeri: "Galeri",
  kontak: "Kontak",
  "kebijakan-privasi": "Kebijakan Privasi",
};

/** Ubah segmen URL menjadi label yang enak dibaca. */
export function labelSegmen(segmen: string): string {
  const kunci = segmen.toLowerCase();
  return (
    LABEL_JALUR[kunci] ??
    kunci
      .split("-")
      .map((k) => k.charAt(0).toUpperCase() + k.slice(1))
      .join(" ")
  );
}