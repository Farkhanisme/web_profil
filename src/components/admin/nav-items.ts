import {
  FolderOpen,
  Building2,
  GraduationCap,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Palette,
  School,
  Sparkles,
  Users,
} from "lucide-react";

export interface ItemNav {
  href: string;
  label: string;
  ikon: typeof LayoutDashboard;
  /** Menampilkan jumlah pesan baru di samping label. */
  lencana?: number;
}

/** Susunan menu CMS. */
export const MENU_ADMIN = [
  { href: "/admin", label: "Dasbor", ikon: LayoutDashboard },
  { href: "/admin/identitas", label: "Identitas", ikon: Building2 },
  { href: "/admin/profil", label: "Profil Madrasah", ikon: School },
  { href: "/admin/staff", label: "Guru dan Staf", ikon: Users },
  { href: "/admin/programs", label: "Program", ikon: GraduationCap },
  { href: "/admin/extracurriculars", label: "Ekstrakurikuler", ikon: Sparkles },
  { href: "/admin/albums", label: "Galeri", ikon: Images },
  { href: "/admin/messages", label: "Pesan Masuk", ikon: Mail },
  { href: "/admin/settings", label: "Pengaturan", ikon: Palette },
] as const;

export { FolderOpen, LogOut };
