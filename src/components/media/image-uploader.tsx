"use client";

import { useCallback, useId, useRef, useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { GalatGambar, kompresGambar, ukuranRingkas } from "@/lib/image-compress";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * Kolom unggah gambar untuk formulir CMS.
 *
 * Dipakai oleh modul guru/staf, program, ekstrakurikuler, album, dan
 * pengaturan logo. Setiap modul memakai komponen yang sama ini.
 *
 * Alur: pilih berkas -> kompres di browser (WebP, sisi terpanjang maks
 * 1600 px, target < 1 MB) -> unggah satu berkas per permintaan -> id media
 * dikembalikan ke pemanggil untuk disimpan bersama formulir.
 */

export interface MediaRef {
  id: string;
  width: number;
  height: number;
}

interface ImageUploaderProps {
  /** Media yang sudah tersimpan (untuk mode ubah). */
  value?: MediaRef | null;
  /** Dipanggil saat unggah berhasil, atau null saat gambar dihapus. */
  onChange: (value: MediaRef | null) => void;
  /** Teks alternatif; sekaligus mengisi kolom alt di tabel media. */
  alt?: string;
  /** Nama berkas pada input, wajib bila dipakai di dalam <form>. */
  name?: string;
  label?: string;
  /** Rasio tampilan, mis. "aspect-[4/3]". */
  className?: string;
  disabled?: boolean;
  /** Keterangan kecil di bawah kolom. */
  hint?: string;
}

type Fase = "idle" | "mengompresi" | "mengunggah" | "galat";

export function ImageUploader({
  value = null,
  onChange,
  alt = "",
  name,
  label = "Foto",
  className,
  disabled = false,
  hint = "JPG, PNG, atau WebP. Maksimal 15 MB. Dikonversi otomatis ke WebP.",
}: ImageUploaderProps) {
  const idInput = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const [fase, setFase] = useState<Fase>("idle");
  const [progres, setProgres] = useState(0);
  const [galat, setGalat] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [seret, setSeret] = useState(false);

  const kirim = useCallback(
    async (file: File) => {
      setGalat(null);
      setInfo(null);
      setFase("mengompresi");
      setProgres(10);

      try {
        const hasil = await kompresGambar(file);
        setFase("mengunggah");
        setProgres(35);
        setInfo(
          ` dikompres: ${ukuranRingkas(hasil.ukuranAsli)} menjadi ${ukuranRingkas(hasil.ukuranAkhir)}`,
        );

        const form = new FormData();
        form.append("file", hasil.file);
        form.append("alt", alt || file.name.replace(/\.[^.]+$/, ""));

        const res = await fetch("/api/admin/media", { method: "POST", body: form });
        const data = (await res.json()) as {
          id?: string;
          width?: number;
          height?: number;
          error?: string;
        };

        if (!res.ok || !data.id) {
          throw new Error(data.error ?? "Gagal mengunggah gambar.");
        }

        onChange({
          id: data.id,
          width: data.width ?? hasil.width,
          height: data.height ?? hasil.height,
        });
        setProgres(100);
        setFase("idle");
      } catch (kesalahan) {
        setGalat(
          kesalahan instanceof GalatGambar || kesalahan instanceof Error
            ? kesalahan.message
            : "Gagal memproses gambar.",
        );
        setFase("galat");
      }
    },
    [alt, onChange],
  );

  const terimaBerkas = useCallback(
    (daftar: FileList | null) => {
      const file = daftar?.[0];
      if (!file || disabled) return;
      void kirim(file);
    },
    [disabled, kirim],
  );

  const hapus = useCallback(() => {
    onChange(null);
    setGalat(null);
    setInfo(null);
    setProgres(0);
    if (inputRef.current) inputRef.current.value = "";
  }, [onChange]);

  const sibuk = fase === "mengompresi" || fase === "mengunggah";
  const adaGambar = Boolean(value);

  return (
    <div className="space-y-2">
      <label htmlFor={idInput} className="text-sm font-medium">
        {label}
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!disabled) setSeret(true);
        }}
        onDragLeave={() => setSeret(false)}
        onDrop={(e) => {
          e.preventDefault();
          setSeret(false);
          if (!disabled) terimaBerkas(e.dataTransfer.files);
        }}
        className={cn(
          "relative overflow-hidden rounded-lg border border-dashed transition-colors",
          seret ? "border-primary bg-primary-soft" : "border-border bg-muted/40",
          disabled && "opacity-60",
        )}
      >
        {/* Pratinjau gambar yang sudah tersimpan */}
        {adaGambar ? (
          <div className={cn("relative", className ?? "aspect-[4/3]")}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/media/${value!.id}?w=480`}
              alt={alt || label}
              width={value!.width}
              height={value!.height}
              className="h-full w-full object-cover"
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={hapus}
              disabled={disabled || sibuk}
              aria-label="Hapus gambar"
              className="absolute right-2 top-2 size-8 rounded-full bg-background/90 shadow-sm backdrop-blur"
            >
              <X className="size-4" aria-hidden />
            </Button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={disabled || sibuk}
            className={cn(
              "flex w-full flex-col items-center justify-center gap-2 px-4 py-8 text-center transition-colors hover:bg-muted",
              className ?? "aspect-[4/3]",
            )}
          >
            {sibuk ? (
              <Loader2 className="size-6 animate-spin text-primary" aria-hidden />
            ) : (
              <ImagePlus className="size-6 text-muted-foreground" aria-hidden />
            )}
            <span className="text-sm font-medium">
              {fase === "mengompresi"
                ? "Mengompres..."
                : fase === "mengunggah"
                  ? "Mengunggah..."
                  : "Pilih gambar"}
            </span>
            <span className="text-xs text-muted-foreground">
              atau seret ke sini
            </span>
          </button>
        )}

        <input
          ref={inputRef}
          id={idInput}
          name={name}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/svg+xml"
          className="sr-only"
          disabled={disabled || sibuk}
          onChange={(e) => {
            terimaBerkas(e.target.files);
            e.target.value = "";
          }}
        />
      </div>

      {sibuk ? (
        <div className="space-y-1">
          <Progress value={progres} className="h-1.5" />
          <p className="text-xs text-muted-foreground">{progres}%</p>
        </div>
      ) : null}

      {adaGambar && !sibuk ? (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <CheckCircle2 className="size-3.5 text-primary" aria-hidden />
          Gambar tersimpan
          {info ? `,${info}` : ""}
        </p>
      ) : null}

      {galat ? (
        <p role="alert" className="text-xs font-medium text-destructive">
          {galat}
        </p>
      ) : null}

      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
