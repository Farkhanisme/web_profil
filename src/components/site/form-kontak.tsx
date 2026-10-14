"use client";

import { useActionState } from "react";
import type { HasilKontak } from "@/app/kontak/actions";
import { kirimPesan } from "@/app/kontak/actions";

const awal: HasilKontak = { ok: false, pesan: "" };

export function FormKontak() {
  const [state, action, pending] = useActionState(kirimPesan, awal);

  return (
    <form action={action} className="space-y-4" noValidate>
      <div>
        <label htmlFor="nama" className="mb-1.5 block text-sm font-semibold">
          Nama <span className="text-jingga">*</span>
        </label>
        <input
          id="nama"
          name="nama"
          type="text"
          required
          autoComplete="name"
          className="min-h-12 w-full rounded-xl border border-garis bg-putih px-4 text-tinta"
          placeholder="Nama Anda"
        />
      </div>
      <div>
        <label htmlFor="kontak" className="mb-1.5 block text-sm font-semibold">
          Nomor telepon / email <span className="text-jingga">*</span>
        </label>
        <input
          id="kontak"
          name="kontak"
          type="text"
          required
          autoComplete="tel"
          className="min-h-12 w-full rounded-xl border border-garis bg-putih px-4 text-tinta"
          placeholder="08... atau email"
        />
      </div>
      <div>
        <label htmlFor="pesan" className="mb-1.5 block text-sm font-semibold">
          Pesan <span className="text-jingga">*</span>
        </label>
        <textarea
          id="pesan"
          name="pesan"
          required
          rows={5}
          className="w-full rounded-xl border border-garis bg-putih px-4 py-3 text-tinta"
          placeholder="Tulis pertanyaan Anda"
        />
      </div>

      {state.pesan && (
        <p
          role="status"
          className={`rounded-xl px-4 py-3 text-sm font-semibold ${
            state.ok
              ? "bg-hijau-muda text-hijau-tua"
              : "bg-jingga-muda text-jingga-tua"
          }`}
        >
          {state.pesan}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center rounded-full bg-jingga px-6 py-3 font-judul font-bold text-white transition-colors hover:bg-jingga-tua disabled:opacity-60"
      >
        {pending ? "Mengirim..." : "Kirim pesan"}
      </button>
    </form>
  );
}
