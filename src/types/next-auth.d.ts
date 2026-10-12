/**
 * Deklarasi augmentasi untuk tipe sesi Auth.js.
 * Menambahkan `id` pada `session.user` yang berasal dari token JWT.
 */

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    sub?: string;
  }
}
