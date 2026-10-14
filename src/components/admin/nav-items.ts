import {
  FolderOpen,
  GraduationCap,
  Images,
  LayoutDashboard,
  LogOut,
  Mail,
  Palette,
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
  { href: "/admin/staff", label: "Guru dan Staf", ikon: Users },
  { href: "/admin/programs", label: "Program", ikon: GraduationCap },
  { href: "/admin/extracurriculars", label: "Ekstrakurikuler", ikon: Sparkles },
  { href: "/admin/albums", label: "Galeri", ikon: Images },
  { href: "/admin/messages", label: "Pesan Masuk", ikon: Mail },
  { href: "/admin/settings", label: "Pengaturan", ikon: Palette },
] as const;

export { FolderOpen, LogOut };
