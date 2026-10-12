"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { ImageUploader, type MediaRef } from "@/components/media/image-uploader";
import { TombolSimpan } from "@/components/admin/form-buttons";
import { Panel } from "@/components/admin/ui";
import { buatSlug } from "@/lib/slug";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { KontenState } from "@/app/admin/(cms)/actions/konten";

/**
 * Formulir yang dipakai modul program dan ekstrakurikuler.
 *
 * Bedanya hanya pada kolom tambahan (jadwal dan pembina), jadi keduanya
 * memakai satu komponen ini agar tidak ada kode yang terduplikasi.
 */

export interface AwalKonten {
  name: string;
  slug: string;
  summary: string;
  description: string;
  image: MediaRef | null;
  isPublished: boolean;
  schedule?: string;
  coach?: string;
}

export function FormKonten({
  id,
  awal,
  action,
  kind,
}: {
  id?: string;
  awal?: AwalKonten;
  action: (state: KontenState, formData: FormData) => Promise<KontenState>;
  kind: "program" | "ekstrakurikuler";
}) {
  const [state, formAction] = useActionState<KontenState, FormData>(action, undefined);
  const [foto, setFoto] = useState<MediaRef | null>(awal?.image ?? null);
  const [terbit, setTerbit] = useState(awal?.isPublished ?? true);
  const [slug, setSlug] = useState(awal?.slug ?? "");
  // Slug mengikuti nama selama admin belum mengubahnya sendiri.
  const [slugDiubahManual, setSlugDiubahManual] = useState(Boolean(awal?.slug));

  const galat = (field: string): string | undefined =>
    state?.fieldErrors?.[field]?.[0];

  const nama = (v: string) => {
    if (!slugDiubahManual) setSlug(buatSlug(v));
  };

  const keTujuan = kind === "program" ? "/admin/programs" : "/admin/extracurriculars";

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
          <div>
            <ImageUploader
              value={foto}
              onChange={setFoto}
              alt={awal?.name ?? ""}
              label="Gambar"
              hint="Ukuran ideal 1600 x 1067 piksel."
            />
            <input type="hidden" name="image_media_id" value={foto?.id ?? ""} />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Nama <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                required
                maxLength={120}
                defaultValue={awal?.name ?? ""}
                onChange={(e) => nama(e.target.value)}
                placeholder={
                  kind === "program"
                    ? "Contoh: Program Pembelajaran Tematik"
                    : "Contoh: Rohani Islam (ROIS)"
                }
                aria-invalid={Boolean(galat("name"))}
              />
              {galat("name") ? (
                <p className="text-xs font-medium text-destructive">{galat("name")}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug URL</Label>
              <Input
                id="slug"
                name="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugDiubahManual(true);
                }}
                placeholder="dibuat otomatis dari nama"
                className="font-mono text-sm"
                aria-invalid={Boolean(galat("slug"))}
              />
              <p className="text-xs text-muted-foreground">
                Alamat halaman: <span className="font-mono">{keTujuan.replace("/admin", "")}/{slug || "..."}</span>
              </p>
              {galat("slug") ? (
                <p className="text-xs font-medium text-destructive">{galat("slug")}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="summary">Ringkasan</Label>
              <Textarea
                id="summary"
                name="summary"
                rows={2}
                maxLength={300}
                defaultValue={awal?.summary ?? ""}
                placeholder="Satu kalimat yang tampil di kartu daftar."
              />
              <p className="text-xs text-muted-foreground">
                Tampil di kartu pada halaman daftar. Maksimal 300 karakter.
              </p>
            </div>
          </div>
        </div>
      </Panel>

      {kind === "ekstrakurikuler" ? (
        <Panel className="grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
          <div className="space-y-2">
            <Label htmlFor="schedule">Jadwal</Label>
            <Input
              id="schedule"
              name="schedule"
              maxLength={160}
              defaultValue={awal?.schedule ?? ""}
              placeholder="Contoh: Sabtu, 14.00-16.00 WITA"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="coach">Pembina</Label>
            <Input
              id="coach"
              name="coach"
              maxLength={120}
              defaultValue={awal?.coach ?? ""}
              placeholder="Nama pembina"
            />
          </div>
        </Panel>
      ) : null}

      <Panel className="p-4 sm:p-5">
        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi lengkap</Label>
          <Textarea
            id="description"
            name="description"
            rows={10}
            defaultValue={awal?.description ?? ""}
            placeholder="Jelaskan program ini secara lengkap. Teks polos tanpa kode HTML."
            className="font-normal"
          />
          <p className="text-xs text-muted-foreground">
            Ditampilkan pada halaman detail. Teks disimpan apa adanya, termasuk pemenggalan baris.
          </p>
        </div>
      </Panel>

      <Panel className="flex items-start justify-between gap-4 p-4 sm:p-5">
        <div className="space-y-0.5">
          <Label htmlFor="is_publish" className="text-base">
            Tampilkan di halaman publik
          </Label>
          <p className="text-sm text-muted-foreground">
            Matikan sementara bila data belum siap ditayangkan.
          </p>
        </div>
        <Switch id="is_publish" checked={terbit} onCheckedChange={setTerbit} />
        {terbit ? <input type="hidden" name="is_published" value="on" /> : null}
      </Panel>

      <div className="flex items-center gap-2">
        <TombolSimpan />
        <Link
          href={keTujuan}
          className="rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
