"use client";

import { useActionState, useState } from "react";
import { AlertCircle } from "lucide-react";
import { ImageUploader, type MediaRef } from "@/components/media/image-uploader";
import { TombolSimpan } from "@/components/admin/form-buttons";
import { Panel } from "@/components/admin/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { simpanLogo, type PengaturanState } from "@/app/admin/(cms)/actions/settings";

/** Kolom unggah logo sekolah. */
export function FormLogo({ awal }: { awal: MediaRef | null }) {
  const [state, formAction] = useActionState<PengaturanState, FormData>(
    simpanLogo,
    undefined,
  );
  const [logo, setLogo] = useState<MediaRef | null>(awal);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" aria-hidden />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Panel className="p-4 sm:p-5">
        <div className="grid gap-5 sm:grid-cols-[180px_1fr]">
          <ImageUploader
            value={logo}
            onChange={setLogo}
            alt="Logo MTs Ma'arif Tieng"
            label="Logo"
            className="aspect-square"
            hint="PNG transparan atau SVG, resolusi tinggi."
          />
          <input type="hidden" name="logo_media_id" value={logo?.id ?? ""} />

          <div className="space-y-2 self-center">
            <p className="text-sm font-medium">Penggunaan logo</p>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>Header dan footer situs</li>
              <li>Favicon pada tab peramban</li>
              <li>Gambar bawaan untuk tautan media sosial</li>
              <li>Logo pada data terstruktur (JSON-LD)</li>
            </ul>
            <p className="text-xs text-muted-foreground">
              Warna tema tidak otomatis diambil dari logo. Atur sendiri di
              bagian Warna tema bila perlu.
            </p>
          </div>
        </div>
      </Panel>

      <TombolSimpan pendingLabel="Menyimpan logo...">
        Simpan logo
      </TombolSimpan>
    </form>
  );
}