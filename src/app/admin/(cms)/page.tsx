import { requireAdmin } from "@/lib/auth/dal";

export default async function AdminDashboardPage() {
  const admin = await requireAdmin();

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold tracking-tight">Dasbor</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Masuk sebagai {admin.email}.
      </p>
    </main>
  );
}
