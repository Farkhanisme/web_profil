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
import { Textarea } from "@/components/ui/textarea";
import { simpanAlbum, type AlbumState } from "@/app/admin/(cms)/actions/albums";

/** Formulir album: judul, slug, deskripsi, dan gambar sampul opsional. */
export function FormAlbum({
  id,
  awal,
}: {
  id?: string;
  awal?: {
    title: string;
    slug: string;
    description: string;
    cover: MediaRef | null;
  };
}) {
  const [state, formAction] = useActionState<AlbumState, FormData>(
    simpanAlbum,
    undefined,
  );
  const [cover, setCover] = useState<MediaRef | null>(awal?.cover ?? null);
  const [slug, setSlug] = useState(awal?.slug ?? "");
  const [manual, setManual] = useState(Boolean(awal?.slug));

  const galat = (f: string) => state?.fieldErrors?.[f]?.[0];

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
        <div className="grid gap-5 sm:grid-cols-[220px_1fr]">
          <div>
            <ImageUploader
              value={cover}
              onChange={setCover}
              alt={awal?.title ?? ""}
              label="Gambar sampul"
              hint="Boleh dikosongkan. Bisa diganti dari salah satu foto di dalam album."
            />
            <input type="hidden" name="cover_media_id" value={cover?.id ?? ""} />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">
                Judul album <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                name="title"
                required
                maxLength={140}
                defaultValue={awal?.title ?? ""}
                onChange={(e) => {
                  if (!manual) setSlug(buatSlug(e.target.value));
                }}
                placeholder="Contoh: Kegiatan Belajar di Kelas"
                aria-invalid={Boolean(galat("title"))}
              />
              {galat("title") ? (
                <p className="text-xs font-medium text-destructive">{galat("title")}</p>
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
                  setManual(true);
                }}
                placeholder="dibuat otomatis dari judul"
                className="font-mono text-sm"
                aria-invalid={Boolean(galat("slug"))}
              />
              <p className="text-xs text-muted-foreground">
                Alamat halaman: <span className="font-mono">/galeri/{slug || "..."}</span>
              </p>
              {galat("slug") ? (
                <p className="text-xs font-medium text-destructive">{galat("slug")}</p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi album</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                maxLength={2000}
                defaultValue={awal?.description ?? ""}
                placeholder="Konteks singkat tentang kegiatan pada album ini."
              />
            </div>
          </div>
        </div>
      </Panel>

      <div className="flex items-center gap-2">
        <TombolSimpan />
        <Link
          href="/admin/albums"
          className="rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          Batal
        </Link>
      </div>
    </form>
  );
}
