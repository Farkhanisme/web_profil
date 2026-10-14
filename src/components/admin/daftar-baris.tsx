"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

/**
 * Editor daftar baris yang bisa ditambah dan dihapus.
 *
 * Dipakai untuk tiga modul sekaligus: struktur organisasi, fasilitas, dan
 * pertanyaan umum. Semuanya bentuknya sama — beberapa baris, tiap baris
 * punya dua kolom, urutan baris adalah urutan tampilnya.
 *
 * Nama field sengaja sama antar modul bagian pertama (`nama`, `pertanyaan`,
 * dst.) supaya Server Action cukup `getAll()` tanpa perlu tahu asal form.
 * Baris yang kosong seluruhnya dibuang server, jadi pengelola boleh
 * menyisakan baris kosong di akhir daftar tanpa merusak isi.
 */
export function DaftarBaris({
  kolom,
  awal,
  tambahLabel = "Tambah baris",
  kosong = "Belum ada baris. Tekan tombol di bawah untuk menambah.",
}: {
  kolom: { nama: string; label: string; placeholder?: string; area?: boolean }[];
  /** Nilai awal: array per kolom, mis. [["Bapak A", "Kepala Madrasah"]]. */
  awal: string[][];
  tambahLabel?: string;
  kosong?: string;
}) {
  const [baris, setBaris] = useState<string[][]>(() =>
    awal.length > 0
      ? awal
      : kolom.map(() => kolom.map(() => "")),
  );

  const ubah = (barisIndex: number, kolomIndex: number, nilai: string) => {
    setBaris((lama) =>
      lama.map((b, i) =>
        i === barisIndex
          ? b.map((v, k) => (k === kolomIndex ? nilai : v))
          : b,
      ),
    );
  };

  const tambah = () =>
    setBaris((lama) => [...lama, kolom.map(() => "")]);

  const hapus = (barisIndex: number) =>
    setBaris((lama) =>
      lama.length === 1
        ? lama
        : lama.filter((_, i) => i !== barisIndex),
    );

  const terisi = baris.some((b) => b.some((v) => v.trim().length > 0));

  return (
    <div className="space-y-3">
      {!terisi ? (
        <p className="rounded-lg bg-muted px-4 py-6 text-center text-sm text-muted-foreground">
          {kosong}
        </p>
      ) : null}

      {baris.map((b, i) => (
        <div
          key={i}
          className="grid gap-2 rounded-lg border bg-card p-3 sm:grid-cols-[1fr_1fr_auto] sm:items-start"
        >
          {kolom.map((k, kIndex) => (
            <div key={k.nama} className="space-y-1">
              <label
                htmlFor={`${k.nama}-${i}`}
                className="text-xs font-medium text-muted-foreground"
              >
                {k.label}
              </label>
              {k.area ? (
                <Textarea
                  id={`${k.nama}-${i}`}
                  name={k.nama}
                  rows={3}
                  value={b[kIndex]}
                  placeholder={k.placeholder}
                  onChange={(e) => ubah(i, kIndex, e.target.value)}
                />
              ) : (
                <Input
                  id={`${k.nama}-${i}`}
                  name={k.nama}
                  value={b[kIndex]}
                  placeholder={k.placeholder}
                  onChange={(e) => ubah(i, kIndex, e.target.value)}
                />
              )}
            </div>
          ))}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => hapus(i)}
            disabled={baris.length === 1}
            aria-label={`Hapus baris ${i + 1}`}
            className="mt-6 text-muted-foreground hover:text-destructive sm:mt-6"
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      ))}

      <Button type="button" variant="outline" size="sm" onClick={tambah}>
        <Plus className="size-4" aria-hidden />
        {tambahLabel}
      </Button>
    </div>
  );
}