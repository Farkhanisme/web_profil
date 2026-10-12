import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionAdmin } from "@/lib/auth/dal";
import { site } from "@/config/site";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Masuk",
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Sudah masuk? Langsung ke dasbor.
  const admin = await getSessionAdmin();
  if (admin) redirect("/admin");

  const params = await searchParams;
  const redirectTo =
    typeof params.redirectTo === "string" ? params.redirectTo : undefined;

  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-12">
      <div className="w-full animate-fade-up space-y-6">
        <div className="text-center">
          <p className="text-sm font-medium text-primary">{site.name}</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            Panel pengelola
          </h1>
        </div>

        <div className="flex justify-center">
          <LoginForm redirectTo={redirectTo} />
        </div>

        <p className="text-center text-xs text-muted-foreground">
          Lupa kata sandi? Hubungi operator sekolah.
        </p>
      </div>
    </main>
  );
}
