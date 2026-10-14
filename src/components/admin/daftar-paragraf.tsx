"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/**
 * Editor daftar paragraf bebas (sejarah, misi, teks sambutan).
 *
 * Berbeda dari `DaftarBaris` yang dua kolom, di sini tiap elemen hanya
 * satu textarea panjang. Urutan elemen adalah urutan tampilnya, dan
 * elemen kosong dibuang server.
 */
export function DaftarParagraf({
  name,
  awal,
  label,
  placeholder,
  tambahLabel = "Tambah paragraf",
  kosong = "Belum ada paragraf. Tekan tombol di bawah untuk menambah.",
  baris = 3,
}: {
  /** Nama field yang dikirim, mis. "sejarah". */
  name: string;
  awal: string[];
  label: string;
  placeholder?: string;
  tambahLabel?: string;
  kosong?: string;
  baris?: number;
}) {
  const [paragraf, setParagraf] = useState<string[]>(() =>
    awal.length > 0 ? awal : [""],
  );

  const ubah = (i: number, nilai: string) =>
    setParagraf((lama) => lama.map((v, k) => (k === i ? nilai : v)));

  const hapus = (i: number) =>
    setParagraf((lama) =>
      lama.length === 1 ? lama : lama.filter((_, k) => k !== i),
    );

  const terisi = paragraf.some((p) => p.trim().length > 0);

  return (
    <div className="space-y-3">
      {!terisi ? (
        <p className="rounded-lg bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
          {kosong}
        </p>
      ) : null}

      {paragraf.map((p, i) => (
        <div key={i} className="space-y-1">
          <label
            htmlFor={`${name}-${i}`}
            className="text-xs font-medium text-muted-foreground"
          >
            {label} {i + 1}
          </label>
          <div className="flex gap-2">
            <Textarea
              id={`${name}-${i}`}
              name={name}
              rows={baris}
              value={p}
              placeholder={placeholder}
              onChange={(e) => ubah(i, e.target.value)}
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => hapus(i)}
              disabled={paragraf.length === 1}
              aria-label={`Hapus ${label.toLowerCase()} ${i + 1}`}
              className="mt-5 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
          </div>
        </div>
      ))}

      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setParagraf((lama) => [...lama, ""])}
      >
        <Plus className="size-4" aria-hidden />
        {tambahLabel}
      </Button>
    </div>
  );
}