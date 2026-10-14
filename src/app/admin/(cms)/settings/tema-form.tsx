"use client";

import { useActionState, useState } from "react";
import { AlertCircle, Check, RotateCcw } from "lucide-react";
import {
  BAWAAN,
  PRESET,
  PRESET_KETIGA,
  hitungTema,
  kontrasDenganPutih,
  KONTRAS_MINIMUM,
  normalisasiHex,
} from "@/lib/color";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel } from "@/components/admin/ui";
import { simpanTema, kembalikanWarnaBawaan, type PengaturanState } from "@/app/admin/(cms)/actions/settings";

/**
 * Pemilih warna tema dengan pratinjau langsung.
 *
 * Pratinjau memakai variabel CSS yang sama dengan situs, sehingga apa
 * yang dilihat admin persis seperti hasil akhir di halaman publik.
 */

function BarberPemilih({
  id,
  label,
  nilai,
  onUbah,
  galat,
}: {
  id: string;
  label: string;
  nilai: string;
  onUbah: (v: string) => void;
  galat?: string;
}) {
  const sah = /^#[0-9a-fA-F]{6}$/.test(nilai);
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={sah ? nilai : "#000000"}
          onChange={(e) => onUbah(e.target.value)}
          aria-label={`${label} - pemilih warna`}
          className="size-10 shrink-0 cursor-pointer rounded-lg border bg-background p-1"
        />
        <Input
          id={id}
          value={nilai}
          onChange={(e) => onUbah(e.target.value)}
          className="font-mono uppercase"
          spellCheck={false}
          aria-invalid={Boolean(galat) || !sah}
          maxLength={7}
        />
      </div>
      {galat ? <p className="text-xs font-medium text-destructive">{galat}</p> : null}
    </div>
  );
}

function Pratinjau({ primary, accent }: { primary: string; accent: string }) {
  const t = hitungTema(primary, accent);

  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{
        // Variabel yang sama dengan milik situs publik.
        ["--brand" as string]: t.primary,
        ["--brand-hover" as string]: t.primaryHover,
        ["--brand-soft" as string]: t.primarySoft,
        ["--on-brand" as string]: t.onPrimary,
        ["--brand-accent" as string]: t.accent,
      }}
    >
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <span className="size-5 rounded" style={{ background: t.primary }} />
        <span className="text-sm font-semibold">Nama Madrasah</span>
        <span
          className="ml-auto rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{ background: t.accentSoft, color: t.accent }}
        >
          Draft
        </span>
      </div>

      <div className="space-y-2 p-3">
        {/*
          Pratinjau visual, bukan bagian dari kerangka dokumen. styled
          seperti judul bagian publik, tetapi memakai <p> supaya tidak
          ikut masuk ke urutan heading pembaca layar.
        */}
        <p className="text-sm font-semibold">Judul bagian</p>
        <p className="text-xs opacity-70">
          Contoh teks isi paragraf untuk memeriksa keterbacaan.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <span
            className="rounded-md px-2.5 py-1 text-xs font-medium"
            style={{ background: t.primary, color: t.onPrimary }}
          >
            Tombol utama
          </span>
          <span
            className="rounded-md px-2.5 py-1 text-xs font-medium"
            style={{ background: t.primaryHover, color: t.onPrimary }}
          >
            Tombol ditekan
          </span>
          <span
            className="rounded-md px-2.5 py-1 text-xs font-medium"
            style={{ background: t.primarySoft, color: t.primary }}
          >
            Latar tipis
          </span>
          <span
            className="rounded-md border px-2.5 py-1 text-xs font-medium"
            style={{ borderColor: t.primary, color: t.primary }}
          >
            Batas
          </span>
        </div>
      </div>
    </div>
  );
}

export function FormTema({
  awal,
}: {
  awal: { primary: string; accent: string; alt: string };
}) {
  const [state, formAction] = useActionState<PengaturanState, FormData>(
    simpanTema,
    undefined,
  );
  const [primary, setPrimary] = useState(awal.primary);
  const [accent, setAccent] = useState(awal.accent);
  const [alt, setAlt] = useState(awal.alt);

  const galatPrimary = state?.fieldErrors?.theme_primary?.[0];
  const galatAccent = state?.fieldErrors?.theme_accent?.[0];
  const galatAlt = state?.fieldErrors?.theme_alt?.[0];
  const kontras = kontrasDenganPutih(primary);

  return (
    <form action={formAction} className="space-y-4">
      {state?.error ? (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" aria-hidden />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Panel className="p-4 sm:p-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <BarberPemilih
            id="theme_primary"
            label="Warna utama"
            nilai={primary}
            onUbah={setPrimary}
            galat={galatPrimary}
          />
          <BarberPemilih
            id="theme_accent"
            label="Warna aksen"
            nilai={accent}
            onUbah={setAccent}
            galat={galatAccent}
          />
          <BarberPemilih
            id="theme_alt"
            label="Warna ketiga"
            nilai={alt}
            onUbah={setAlt}
            galat={galatAlt}
          />
        </div>

        <input type="hidden" name="theme_primary" value={primary} />
        <input type="hidden" name="theme_accent" value={accent} />
        <input type="hidden" name="theme_alt" value={alt} />

        <div className="mt-4 flex items-center gap-2 text-xs">
          {kontras >= KONTRAS_MINIMUM ? (
            <>
              <Check className="size-3.5 text-primary" aria-hidden />
              <span className="text-muted-foreground">
                Kontras warna utama terhadap teks putih {kontras.toFixed(2)}:1
                (minimal {KONTRAS_MINIMUM}:1)
              </span>
            </>
          ) : (
            <>
              <AlertCircle className="size-3.5 text-destructive" aria-hidden />
              <span className="font-medium text-destructive">
                Kontras {kontras.toFixed(2)}:1 belum cukup, warna utama akan
                ditolak saat disimpan.
              </span>
            </>
          )}
        </div>
      </Panel>

      {/* Pratinjau langsung */}
      <Panel className="p-4 sm:p-5">
        <p className="mb-3 text-sm font-medium">Pratinjau</p>
        <Pratinjau primary={primary} accent={accent} />
      </Panel>

      {/* Pilihan cepat untuk warna ketiga */}
      <Panel className="p-4 sm:p-5">
        <p className="mb-1 text-sm font-medium">Pilihan warna ketiga</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Warna ini dipakai sebagai blok warna tambahan. Semua pilihan sudah
          lolos uji kontras terhadap teks terang dan gelap.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET_KETIGA.map((p) => (
            <Button
              key={p.nama}
              type="button"
              variant={normalisasiHex(p.alt) === normalisasiHex(alt) ? "default" : "outline"}
              size="sm"
              onClick={() => setAlt(p.alt)}
              className="gap-2"
            >
              <span
                className="size-3.5 rounded-full border"
                style={{ background: p.alt }}
              />
              {p.nama}
            </Button>
          ))}
        </div>
      </Panel>

      {/* Preset */}
      <Panel className="p-4 sm:p-5">
        <p className="mb-1 text-sm font-medium">Pilihan siap pakai</p>
        <p className="mb-3 text-xs text-muted-foreground">
          Semua pilihan sudah lolos uji kontras. Klik untuk memakai.
        </p>
        <div className="flex flex-wrap gap-2">
          {PRESET.map((p) => {
            const aktif = normalisasiHex(p.primary) === normalisasiHex(primary);
            return (
              <Button
                key={p.nama}
                type="button"
                variant={aktif ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setPrimary(p.primary);
                  setAccent(p.accent);
                }}
                className="gap-2"
                style={aktif ? undefined : { borderColor: p.primary }}
              >
                <span
                  className="size-3.5 rounded-full border"
                  style={{ background: p.primary }}
                />
                {p.nama}
              </Button>
            );
          })}
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="submit" className="bg-primary hover:bg-primary-hover">
          Simpan warna
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setPrimary(BAWAAN.primary);
            setAccent(BAWAAN.accent);
            setAlt(BAWAAN.alt);
          }}
        >
          <RotateCcw className="size-4" aria-hidden />
          Kembalikan ke bawaan
        </Button>
      </div>
    </form>
  );
}

/** Tombol kembalikan ke bawaan yang langsung menyimpan ke server. */
export function TombolResetTema() {
  return (
    <form action={kembalikanWarnaBawaan}>
      <Button type="submit" variant="outline">
        <RotateCcw className="size-4" aria-hidden />
        Simpan warna bawaan
      </Button>
    </form>
  );
}