"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Panel } from "@/components/admin/ui";
import { TombolSimpan } from "@/components/admin/form-buttons";
import { DaftarParagraf } from "@/components/admin/daftar-paragraf";
import {
  simpanProfilTeks,
  type ProfilState,
} from "@/app/admin/(cms)/actions/profil";
import type { IsiProfil } from "@/lib/konten";

/**
 * Formulir teks halaman Profil: ringkasan, sejarah, visi, misi, dan
 * sambutan kepala madrasah.
 *
 * Kolom yang dibiarkan kosong tidak tampil di halaman publik. Jadi
 * pengelola boleh menyimpan sebagian dulu tanpa membuat halaman setengah
 * jadi terlihat oleh pengunjung.
 */
export function FormProfilTeks({ profil }: { profil: IsiProfil }) {
  const [state, formAction] = useActionState<ProfilState, FormData>(
    simpanProfilTeks,
    undefined,
  );

  const galat = (field: string) => state?.fieldErrors?.[field]?.[0];

  return (
    <form action={formAction} className="space-y-5">
      {state?.error ? (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" aria-hidden />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <Panel className="space-y-2 p-4 sm:p-5">
        <Label htmlFor="ringkasan">
          Ringkasan profil <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="ringkasan"
          name="ringkasan"
          rows={3}
          defaultValue={profil.ringkasan}
          maxLength={1000}
          placeholder="Dua sampai tiga kalimat yang menjelaskan madrasah ini."
        />
        <p className="text-xs text-muted-foreground">
          Kalimat ini muncul di beranda sebagai pengantar profil.
        </p>
        {galat("ringkasan") ? (
          <p className="text-xs font-medium text-destructive">
            {galat("ringkasan")}
          </p>
        ) : null}
      </Panel>

      <Panel className="space-y-3 p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Sejarah</h2>
          <p className="text-sm text-muted-foreground">
            Satu paragraf per kali. Urutan paragraf mengikuti urutan di sini.
          </p>
        </div>
        <DaftarParagraf
          name="sejarah"
          label="Paragraf sejarah"
          awal={profil.sejarah}
          baris={4}
          placeholder="mis. Madrasah ini berdiri pada tahun 1998 atas Figs. inisiatif warga..."
        />
      </Panel>

      <Panel className="space-y-4 p-4 sm:p-5">
        <h2 className="text-lg font-semibold tracking-tight">
          Visi dan misi
        </h2>
        <div className="space-y-2">
          <Label htmlFor="visi">Visi</Label>
          <Textarea
            id="visi"
            name="visi"
            rows={2}
            defaultValue={profil.visi}
            maxLength={1000}
            placeholder="Satu kalimat tentang cita-cita madrasah."
          />
        </div>
        <div className="space-y-3">
          <Label>Misi</Label>
          <DaftarParagraf
            name="misi"
            label="Butir misi"
            awal={profil.misi}
            baris={2}
            placeholder="mis. Membiasakan siswa disiplin belajar harian."
            tambahLabel="Tambah butir misi"
          />
        </div>
      </Panel>

      <Panel className="space-y-4 p-4 sm:p-5">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Sambutan kepala madrasah
          </h2>
          <p className="text-sm text-muted-foreground">
            Isi nama dan jabatan dulu. Bagian sambutan baru tampil di beranda
            bila nama sudah diisi.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sambutan_nama">Nama dan gelar</Label>
            <Input
              id="sambutan_nama"
              name="sambutan_nama"
              defaultValue={profil.sambutan.nama}
              maxLength={160}
              placeholder="mis. H. Ahmad Fauzi, S.Pd.I."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="jabatan">Jabatan</Label>
            <Input
              id="jabatan"
              name="jabatan"
              defaultValue={profil.sambutan.jabatan}
              maxLength={120}
              placeholder="Kepala Madrasah"
            />
          </div>
        </div>
        <div className="space-y-3">
          <Label>Teks sambutan</Label>
          <DaftarParagraf
            name="sambutan_teks"
            label="Paragraf sambutan"
            awal={profil.sambutan.teks}
            baris={4}
            placeholder="Pembuka, isi, dan penutup. Dua paragraf sudah cukup untuk beranda."
          />
        </div>
      </Panel>

      <TombolSimpan>Simpan teks profil</TombolSimpan>
    </form>
  );
}