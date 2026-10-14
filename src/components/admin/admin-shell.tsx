"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ExternalLink, LogOut, Menu } from "lucide-react";
import { MENU_ADMIN } from "@/components/admin/nav-items";
import { logoutAction } from "@/app/admin/login/actions";
import { site } from "@/config/site";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/**
 * Kerangka CMS.
 *
 * Mobile first: di layar sempit menu berupa sheet yang slid dari kiri,
 * di layar lebar menjadi sidebar tetap. Tidak ada dependensi JavaScript
 * berat, animasi hanya pada transform/opacity.
 */

function TautanMenu({
  href,
  label,
  ikon: Ikon,
  onNavigate,
}: {
  href: string;
  label: string;
  ikon: typeof MENU_ADMIN[number]["ikon"];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  // "/admin" hanya aktif persis, submenu aktif saat diawali jalurnya.
  const aktif = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={aktif ? "page" : undefined}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        aktif
          ? "bg-primary-soft text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Ikon className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{label}</span>
    </Link>
  );
}

function IsiMenu({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1" aria-label="Menu CMS">
      {MENU_ADMIN.map((item) => (
        <TautanMenu key={item.href} {...item} onNavigate={onNavigate} />
      ))}
    </nav>
  );
}

function Keluar() {
  return (
    <form action={logoutAction}>
      <button
        type="submit"
        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <LogOut className="size-4 shrink-0" aria-hidden />
        Keluar
      </button>
    </form>
  );
}

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [buka, setBuka] = useState(false);

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Bilah atas (mobile) */}
      <header className="sticky top-0 z-30 flex items-center gap-3 border-b bg-background/95 px-4 py-3 backdrop-blur lg:hidden">
        <Sheet open={buka} onOpenChange={setBuka}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Buka menu">
              <Menu className="size-5" aria-hidden />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b px-5 py-4 text-left">
              <SheetTitle className="text-base">{site.name}</SheetTitle>
              <p className="text-xs text-muted-foreground">Panel pengelola</p>
            </SheetHeader>
            <div className="flex h-[calc(100dvh-73px)] flex-col justify-between p-3">
              <IsiMenu onNavigate={() => setBuka(false)} />
              <div className="space-y-1">
                <Separator className="mb-2" />
                <Keluar />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        <span className="truncate text-sm font-semibold">{site.name}</span>
        <Button asChild variant="ghost" size="sm" className="ml-auto">
          <Link href="/" target="_blank" rel="noreferrer">
            Lihat situs
            <ExternalLink className="size-3.5" aria-hidden />
          </Link>
        </Button>
      </header>

      {/* Sidebar (desktop) */}
      <aside className="hidden w-64 shrink-0 border-r bg-background lg:flex lg:flex-col">
        <div className="border-b px-5 py-4">
          <p className="truncate text-sm font-semibold">{site.name}</p>
          <p className="text-xs text-muted-foreground">Panel pengelola</p>
        </div>
        <div className="flex flex-1 flex-col justify-between p-3">
          <IsiMenu />
          <div className="space-y-1">
            <Separator className="mb-2" />
            <Keluar />
            <Button asChild variant="ghost" size="sm" className="w-full justify-start text-muted-foreground">
              <Link href="/" target="_blank" rel="noreferrer">
                Lihat situs
                <ExternalLink className="size-3.5" aria-hidden />
              </Link>
            </Button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
