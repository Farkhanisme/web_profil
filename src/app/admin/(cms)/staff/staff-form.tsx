"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { ImageUploader, type MediaRef } from "@/components/media/image-uploader";
import { TombolSimpan } from "@/components/admin/form-buttons";
import { Panel } from "@/components/admin/ui";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { simpanStaff, type StaffState } from "@/app/admin/(cms)/actions/staff";

/**
 * Formulir guru/staf, dipakai untuk tambah dan ubah.
 *
 * `id` kosong berarti mode tambah.
 */
export function FormStaff({
  id,
  awal,
}: {
  id?: string;
  awal?: {
    name: string;
    position: string;
    subject: string;
    photo: MediaRef | null;
    isPublished: boolean;
  };
}) {
  const [state, formAction] = useActionState<StaffState, FormData>(
    simpanStaff,
    undefined,
  );
  const [foto, setFoto] = useState<MediaRef | null>(awal?.photo ?? null);
  const [terbit, setTerbit] = useState(awal?.isPublished ?? true);

  const galat = (field: string): string | undefined =>
    state?.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-5">
      {id ? <input type="hidden" name="id" value={id} /> : null}

      {state?.error ? (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" aria-hidden />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Panel className="p-4 sm:p-5">
        <div className="grid gap-5 sm:grid-cols-[200px_1fr]">
          <ImageUploader
            value={foto}
            onChange={setFoto}
            alt={awal?.name ?? ""}
            label="Foto"
            className="aspect-[3/4]"
            hint="Disarankan foto potret, maksimal 1600 px."
          />
          {/* Kolom media_id dikirim sebagai input tersembunyi. */}
          <input type="hidden" name="photo_media_id" value={foto?.id ?? ""} />

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                defaultValue={awal?.name ?? ""}
                required
                maxLength={120}
                placeholder="Nama lengkap dan gelar"
                aria-invalid={Boolean(galat("name"))}
                aria-describedby={galat("name") ? "galat-name" : undefined}
              />
              {galat("name") ? (
                <p id="galat-name" className="text-xs font-medium text-destructive">
                  {galat("name")}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">Jabatan</Label>
              <Input
                id="position"
                name="position"
                defaultValue={awal?.position ?? ""}
                maxLength={120}
                placeholder="Guru Matematika, Kepala Madrasah, dan lain-lain"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Mata pelajaran</Label>
              <Input
                id="subject"
                name="subject"
                defaultValue={awal?.subject ?? ""}
                maxLength={160}
                placeholder="Matematika, Fikih, Bahasa Indonesia, dan lain-lain"
              />
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-0.5">
            <Label htmlFor="is_published" className="text-base">
              Tampilkan di halaman publik
            </Label>
            <p className="text-sm text-muted-foreground">
              Matikan sementara bila data belum siap ditayangkan.
            </p>
          </div>
          <Switch
            id="is_published"
            checked={terbit}
            onCheckedChange={setTerbit}
          />
          {terbit ? (
            <input type="hidden" name="is_published" value="on" />
          ) : null}
        </div>
      </Panel>

      <div className="flex items-center gap-2">
        <TombolSimpan />
        <Link
          href="/admin/staff"
          className="rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
