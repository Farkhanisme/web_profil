import Link from "next/link";
import {
  Building2,
  GraduationCap,
  Images,
  Mail,
  School,
  Sparkles,
  Users,
} from "lucide-react";
import { requireAdmin } from "@/lib/auth/dal";
import { jumlahStaff } from "@/lib/queries/staff";
import {
  jumlahEkstrakurikuler,
  jumlahProgram,
} from "@/lib/queries/konten";
import { jumlahAlbum } from "@/lib/queries/albums";
import { pesanBelumDibaca } from "@/lib/queries/messages";
import { KepalaHalaman } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

/**
 * Dasbor CMS.
 *
 * Dua hal yang paling sering ditanya pengelola: "berapa yang sudah
 * terisi?" dan "saya mau ubah apa?". Karena itu dasbor menampilkan angka
 * isi tiap modul dan pintasan langsung ke form yang paling sering dibuka.
 *
 * Landmark <main> dibuat sekali oleh AdminShell, jadi halaman ini tidak
 * menambahkannya.
 */
export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  const [staff, program, ekstra, album, belumDibaca] = await Promise.all([
    jumlahStaff(),
    jumlahProgram(),
    jumlahEkstrakurikuler(),
    jumlahAlbum(),
    pesanBelumDibaca(),
  ]);

  const kartu = [
    { href: "/admin/identitas", label: "Identitas", nilai: null, ikon: Building2 },
    { href: "/admin/profil", label: "Profil Madrasah", nilai: null, ikon: School },
    { href: "/admin/staff", label: "Guru dan Staf", nilai: staff, ikon: Users },
    { href: "/admin/programs", label: "Program", nilai: program, ikon: GraduationCap },
    {
      href: "/admin/extracurriculars",
      label: "Ekstrakurikuler",
      nilai: ekstra,
      ikon: Sparkles,
    },
    { href: "/admin/albums", label: "Album Galeri", nilai: album, ikon: Images },
    { href: "/admin/messages", label: "Pesan Masuk", nilai: belumDibaca, ikon: Mail },
  ];

  return (
    <>
      <KepalaHalaman
        judul="Dasbor"
        deskripsi="Kelola isi situs dari sini. Perubahan langsung terlihat di halaman publik."
      />

      <p className="mb-6 text-sm text-muted-foreground">
        Masuk sebagai {admin.email}.
      </p>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {kartu.map((k) => (
          <li key={k.href}>
            <Link
              href={k.href}
              className="flex h-full flex-col gap-2 rounded-xl border bg-card p-4 transition-colors hover:bg-muted"
            >
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <k.ikon className="size-4" aria-hidden />
                {k.label}
              </span>
              {k.nilai === null ? (
                <span className="font-semibold text-primary">Isi sekarang</span>
              ) : (
                <span className="text-2xl font-bold tabular-nums">
                  {k.nilai}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {k.href === "/admin/messages" ? "belum dibaca" : "item"}
                  </span>
                </span>
              )}
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-8 flex flex-wrap gap-2">
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/identitas">Isi identitas sekolah</Link>
        </Button>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/profil">Tulis profil dan sejarah</Link>
        </Button>
      </div>
    </>
  );
}