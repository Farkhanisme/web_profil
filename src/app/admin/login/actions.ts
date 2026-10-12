"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { signIn, signOut, BATAS_LOGIN, JENDELA_LOGIN_DETIK } from "@/auth";
import { kunciRateLimit, peekRateLimit } from "@/lib/rate-limit";

const formLoginSchema = z.object({
  email: z.email({ error: "Format email tidak valid." }),
  password: z.string().min(1, { error: "Kata sandi wajib diisi." }),
  redirectTo: z.string().optional(),
});

export type LoginState = {
  error?: string;
} | undefined;

/**
 * Pesan yang sama untuk email tidak dikenal maupun password salah,
 * supaya halaman login tidak bisa dipakai menebak email mana yang terdaftar.
 */
const PESAN_GAGAL = "Email atau kata sandi salah.";

/** Terima hanya path internal, tolak URL absolut untuk mencegah open redirect. */
function tujuanAman(tujuan: string | undefined): string {
  if (!tujuan) return "/admin";
  if (!tujuan.startsWith("/")) return "/admin";
  if (tujuan.startsWith("//")) return "/admin";
  return tujuan;
}

export async function loginAction(
  _state: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const hasil = formLoginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    redirectTo: formData.get("redirectTo") ?? undefined,
  });

  if (!hasil.success) {
    return { error: hasil.error.issues[0]?.message ?? "Data tidak valid." };
  }

  // Periksa apakah IP ini sedang terkunci, agar bisa memberi tahu sisa
  // waktu tanpa membuat pengguna menebak-nebak. Penghitungan sebenarnya
  // terjadi di dalam `authorize()` milik Auth.js.
  const kunci = await kunciRateLimit("login");
  const status = await peekRateLimit(kunci, BATAS_LOGIN, JENDELA_LOGIN_DETIK);

  if (!status.ok) {
    const menit = Math.max(1, Math.ceil(status.retryAfter / 60));
    return {
      error: `Terlalu banyak percobaan. Coba lagi dalam ${menit} menit.`,
    };
  }

  try {
    await signIn("credentials", {
      email: hasil.data.email,
      password: hasil.data.password,
      redirect: false,
    });
  } catch {
    // Semua kegagalan (email salah, password salah, akun tidak ada,
    // maupun IP sedang terkunci) dijawab dengan pesan yang sama.
    return { error: PESAN_GAGAL };
  }

  redirect(tujuanAman(hasil.data.redirectTo));
}

export async function logoutAction(): Promise<void> {
  await signOut({ redirect: false });
  redirect("/admin/login");
}
