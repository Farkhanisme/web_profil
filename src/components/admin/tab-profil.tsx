import Link from "next/link";

/**
 * Tab di dalam modul profil.
 *
 * Dipisah dari halaman agar keempat halaman modul ini memakai daftar tab
 * yang sama. Penanda halaman aktif diberikan lewat prop `aktif` supaya
 * komponen ini tetap server component (tidak perlu `usePathname`).
 */
const TAB = [
  { href: "/admin/profil", label: "Teks profil" },
  { href: "/admin/profil/struktur", label: "Struktur" },
  { href: "/admin/profil/fasilitas", label: "Fasilitas" },
  { href: "/admin/profil/faq", label: "Pertanyaan umum" },
];

export function TabProfil({ aktif }: { aktif: string }) {
  return (
    <nav aria-label="Bagian profil" className="mb-5">
      <ul className="flex flex-wrap gap-2">
        {TAB.map((t) => {
          const ini = t.href === aktif;
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={ini ? "page" : undefined}
                className={`inline-flex min-h-9 items-center rounded-full border px-4 text-sm font-medium transition-colors ${
                  ini
                    ? "border-primary/30 bg-primary-soft text-primary"
                    : "hover:bg-muted"
                }`}
              >
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}