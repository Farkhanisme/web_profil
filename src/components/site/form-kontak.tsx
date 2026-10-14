"use client";

import { useActionState, useEffect, useRef } from "react";
import type { KontakState } from "@/app/kontak/actions";
import { kirimPesan } from "@/app/kontak/actions";

/**
 * Formulir kontak.
 *
 * Tiga hal yang penting untuk audiens orang tua:
 *   - Validasi server dikembalikan per-field, jadi pesan salah menunjukkan
 *     field yang tepat, bukan satu kalimat umum di bawah tombol.
 *   - Field pertama yang salah menerima fokus supaya pengguna tidak
 *     mencari-cari asal kesalahannya.
 *   - Ada honeypot tersembunyi (`website`): bot mengisinya, manusia tidak
 *     pernah melihatnya, dan pesan bot tidak pernah menyentuh database.
 */
const KELAS_ISIAN =
  "min-h-12 w-full rounded-xl border border-input bg-putih px-4 text-tinta placeholder:text-tinta-3 aria-[invalid=true]:border-destructive";

export function FormKontak() {
  const [state, action, pending] = useActionState<KontakState, FormData>(
    kirimPesan,
    undefined,
  );

  const formRef = useRef<HTMLFormElement>(null);
  const sukses = state?.sukses === true;

  useEffect(() => {
    if (!state?.fieldErrors) return;
    const pertama = Object.keys(state.fieldErrors)[0];
    if (!pertama) return;
    const el = formRef.current?.querySelector<HTMLElement>(`[name="${pertama}"]`);
    el?.focus();
  }, [state]);

  const galat = (field: string) => state?.fieldErrors?.[field]?.[0];

  return (
    <form ref={formRef} action={action} className="space-y-4" noValidate>
      <div>
        <label htmlFor="nama" className="mb-1.5 block text-sm font-semibold">
          Nama <span className="text-jingga">*</span>
        </label>
        <input
          id="nama"
          name="name"
          type="text"
          required
          autoComplete="name"
          aria-invalid={Boolean(galat("name"))}
          aria-describedby={galat("name") ? "galat-nama" : undefined}
          className={KELAS_ISIAN}
          placeholder="Nama Anda"
        />
        {galat("name") && (
          <p id="galat-nama" className="mt-1.5 text-sm font-semibold text-destructive">
            {galat("name")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="kontak" className="mb-1.5 block text-sm font-semibold">
          Nomor telepon atau email <span className="text-jingga">*</span>
        </label>
        <input
          id="kontak"
          name="contact"
          type="text"
          required
          autoComplete="tel"
          inputMode="tel"
          aria-invalid={Boolean(galat("contact"))}
          aria-describedby={galat("contact") ? "galat-kontak" : undefined}
          className={KELAS_ISIAN}
          placeholder="08... atau email"
        />
        {galat("contact") && (
          <p id="galat-kontak" className="mt-1.5 text-sm font-semibold text-destructive">
            {galat("contact")}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="pesan" className="mb-1.5 block text-sm font-semibold">
          Pesan <span className="text-jingga">*</span>
        </label>
        <textarea
          id="pesan"
          name="body"
          required
          rows={5}
          aria-invalid={Boolean(galat("body"))}
          aria-describedby={galat("body") ? "galat-pesan" : "bantuan-pesan"}
          className="w-full rounded-xl border border-input bg-putih px-4 py-3 text-tinta placeholder:text-tinta-3 aria-[invalid=true]:border-destructive"
          placeholder="Tulis pertanyaan Anda, minimal 10 karakter."
        />
        {galat("body") ? (
          <p id="galat-pesan" className="mt-1.5 text-sm font-semibold text-destructive">
            {galat("body")}
          </p>
        ) : (
          <p id="bantuan-pesan" className="mt-1.5 text-sm text-tinta-3">
            Minimal 10 karakter, maksimal 3.000 karakter.
          </p>
        )}
      </div>

      {/*
        Jebakan bot. Field ini disembunyikan dari manusia dan dihapus dari
        urutan fokus; bot yang mengisi form secara otomatis akan mengisinya
        dan pesan tidak disimpan.
      */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {state?.error && (
        <p
          role="alert"
          className="rounded-xl bg-jingga-muda px-4 py-3 text-sm font-semibold text-jingga-tua"
        >
          {state.error}
        </p>
      )}

      {sukses && (
        <p
          role="status"
          className="rounded-xl bg-hijau-muda px-4 py-3 text-sm font-semibold text-hijau-tua"
        >
          Pesan terkirim. Terima kasih, kami akan membalas lewat kontak yang
          Anda tuliskan.
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="tombol bg-jingga text-white hover:bg-jingga-tua disabled:opacity-60"
      >
        {pending ? "Mengirim..." : "Kirim pesan"}
      </button>
    </form>
  );
}