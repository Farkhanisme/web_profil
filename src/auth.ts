/**
 * Konfigurasi Auth.js (NextAuth v5) untuk satu admin.
 *
 * Sesi berupa JWT yang disimpan pada cookie `httpOnly`, berlaku 7 hari.
 * Provider Credentials memverifikasi email + password terhadap tabel
 * `admins` memakai bcryptjs.
 *
 * Pembatas laju login dipasang DI DALAM `authorize`, bukan di Server
 * Action, sehingga tetap berlaku walau formulir dikirim langsung ke
 * endpoint Auth.js tanpa melewati UI.
 */

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { compare } from "bcryptjs";
import { db } from "@/lib/db";
import {
  consumeRateLimit,
  kunciRateLimit,
  resetRateLimit,
} from "@/lib/rate-limit";
import type { AdminRow } from "@/lib/db/types";

/** Batas login: 5 percobaan per 15 menit per alamat IP. */
export const BATAS_LOGIN = 5;
export const JENDELA_LOGIN_DETIK = 15 * 60;

const kredensialSchema = z.object({
  email: z.email({ error: "Format email tidak valid." }),
  password: z.string().min(1, { error: "Kata sandi wajib diisi." }),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      name: "Email dan kata sandi",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Kata sandi", type: "password" },
      },
      async authorize(raw) {
        const hasil = kredensialSchema.safeParse(raw);
        // Pesan sengaja generik agar tidak membocorkan email mana yang terdaftar.
        if (!hasil.success) return null;

        const kunci = await kunciRateLimit("login");

        // Tolak sebelum menyentuh kredensial bila kuota sudah habis.
        const limit = await consumeRateLimit(kunci, BATAS_LOGIN, JENDELA_LOGIN_DETIK);
        if (!limit.ok) return null;

        const email = hasil.data.email.trim().toLowerCase();

        const admin = await db.execute({
          sql: "SELECT id, email, password_hash, created_at FROM admins WHERE email = ?",
          args: [email],
        });

        const row = admin.rows[0] as unknown as AdminRow | undefined;
        if (!row) return null;

        const cocok = await compare(hasil.data.password, row.password_hash);
        if (!cocok) return null;

        // Berhasil: reset penghitung supaya percobaan gagal sebelumnya
        // tidak ikut menumpuk mengunci akun yang sah.
        await resetRateLimit(kunci);

        return { id: row.id, email: row.email };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) token.sub = user.id;
      return token;
    },
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});
