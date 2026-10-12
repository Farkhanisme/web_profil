import {
  GraduationCap,
  Images,
  Home,
  Mail,
  School,
  Sparkles,
  Users,
} from "lucide-react";

/**
 * Menu situs publik.
 *
 * Dipakai bersama oleh navigasi desktop, menu seluler, footer, dan
 * breadcrumb, sehingga satu perubahan cukup di satu tempat.
 */
export const MENU_PUBLIK = [
  { href: "/", label: "Beranda", ikon: Home },
  { href: "/profil", label: "Profil", ikon: School },
  { href: "/guru", label: "Guru dan Staf", ikon: Users },
  { href: "/program", label: "Program", ikon: GraduationCap },
  { href: "/ekstrakurikuler", label: "Ekstrakurikuler", ikon: Sparkles },
  { href: "/galeri", label: "Galeri", ikon: Images },
  { href: "/kontak", label: "Kontak", ikon: Mail },
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