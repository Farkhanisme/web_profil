import Link from "next/link";
import { requireAdmin } from "@/lib/auth/dal";
import { KepalaHalaman } from "@/components/admin/ui";
import { Button } from "@/components/ui/button";

/**
 * Dasbor CMS.
 *
 * Mengikuti pola halaman lain di folder (cms): kepala halaman dari
 * `KepalaHalaman`, isi berupa fragment. Landmark <main> sudah dibuat
 * sekali oleh AdminShell, jadi halaman ini tidak boleh menambahkannya.
 */
export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  return (
    <>
      <KepalaHalaman
        judul="Dasbor"
        deskripsi="Kelola isi situs dari sini. Perubahan langsung terlihat di halaman publik."
      >
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/staff">Guru dan Staf</Link>
        </Button>
      </KepalaHalaman>

      <p className="text-sm text-muted-foreground">
        Masuk sebagai {admin.email}.
      </p>
    </>
  );
}