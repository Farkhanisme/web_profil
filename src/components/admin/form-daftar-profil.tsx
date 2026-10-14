"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Panel } from "@/components/admin/ui";
import { TombolSimpan } from "@/components/admin/form-buttons";
import { DaftarBaris } from "@/components/admin/daftar-baris";
import type { ProfilState } from "@/app/admin/(cms)/actions/profil";

/**
 * Formulir daftar berulang untuk modul profil.
 *
 * Satu komponen melayani tiga halaman (struktur, fasilitas, pertanyaan
 * umum) karena bentuknya identik: daftar baris yang bisa ditambah dan
 * dihapus. Server Action-nya diteruskan sebagai prop supaya setiap
 * modul tetap punya aturan penyimpanan sendiri di server.
 */
export function FormDaftarProfil({
  action,
  kolom,
  awal,
  tambahLabel,
  kosong,
  labelSimpan,
}: {
  action: (state: ProfilState, formData: FormData) => Promise<ProfilState>;
  kolom: { nama: string; label: string; placeholder?: string; area?: boolean }[];
  /** Nilai awal: satu baris per elemen, dalam urutan kolom. */
  awal: string[][];
  tambahLabel: string;
  kosong: string;
  labelSimpan: string;
}) {
  const [state, formAction] = useActionState<ProfilState, FormData>(
    action,
    undefined,
  );

  return (
    <form action={formAction} className="space-y-5">
      {state?.error ? (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" aria-hidden />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Panel className="p-4 sm:p-5">
        <DaftarBaris
          kolom={kolom}
          awal={awal}
          tambahLabel={tambahLabel}
          kosong={kosong}
        />
      </Panel>

      <TombolSimpan>{labelSimpan}</TombolSimpan>
    </form>
  );
}