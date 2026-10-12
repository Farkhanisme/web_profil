import { NextResponse } from "next/server";
import { auth } from "@/auth";

/**
 * Pemeriksaan optimistis sebelum halaman admin dirender.
 *
 * Ini BUKAN satu-satunya pengaman: setiap Server Action dan Route Handler
 * admin juga memanggil `requireAdmin()` atau `assertAdmin()` di server.
 * Fungsi ini hanya menghemat render untuk pengunjung yang jelas belum login,
 * dan tidak pernah menyentuh database.
 */
export default auth((request) => {
  const pathname = request.nextUrl.pathname;

  // Halaman login sendiri harus tetap bisa diakses.
  if (pathname === "/admin/login") return NextResponse.next();

  if (!request.auth) {
    const url = new URL("/admin/login", request.nextUrl);
    url.searchParams.set("redirectTo", pathname + request.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
