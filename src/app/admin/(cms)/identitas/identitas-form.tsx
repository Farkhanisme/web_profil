"use client";

import { useActionState } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Panel } from "@/components/admin/ui";
import { TombolSimpan } from "@/components/admin/form-buttons";
import {
  simpanIdentitas,
  type ProfilState,
} from "@/app/admin/(cms)/actions/profil";
import type { IsiSitus } from "@/lib/konten";

/**
 * Satu field: label, input, pesan galat, dan keterangan singkat.
 *
 * Dipisah ke komponen tingkat atas (bukan fungsi di dalam komponen
 * halaman) supaya React Compiler tidak memperlakukannya sebagai komponen
 * yang dibuat ulang setiap render.
 */
function Field({
  nama,
  label,
  awal,
  error,
  placeholder,
  hint,
  type = "text",
  required,
}: {
  nama: string;
  label: string;
  awal: string | number;
  error?: string;
  placeholder?: string;
  hint?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={nama}>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </Label>
      <Input
        id={nama}
        name={nama}
        type={type}
        defaultValue={String(awal ?? "")}
        placeholder={placeholder}
        required={required}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `galat-${nama}` : undefined}
      />
      {error ? (
        <p id={`galat-${nama}`} className="text-xs font-medium text-destructive">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

/**
 * Formulir Identitas Madrasah.
 *
 * Isi form ini dipakai di banyak tempat sekaligus: judul tab, footer,
 * peta, JSON-LD, dan tautan WhatsApp. Karena itu setiap field diberi
 * keterangan singkat tentang akibatnya — pengelola bukan ahli teknis,
 * dan "NPSN" saja tanpa penjelasan membuat ragu.
 */
export function FormIdentitas({ situs }: { situs: IsiSitus }) {
  const [state, formAction] = useActionState<ProfilState, FormData>(
    simpanIdentitas,
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

      <Panel className="space-y-4 p-4 sm:p-5">
        <h2 className="text-lg font-semibold tracking-tight">Nama sekolah</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            nama="name"
            label="Nama sekolah"
            awal={situs.name}
            required
            error={galat("name")}
            hint="Nama resmi, sama seperti tercatat di NPSN/EMIS."
          />
          <Field
            nama="short_name"
            label="Nama navigasi"
            awal={situs.shortName}
            error={galat("short_name")}
            hint="Dipakai pada judul tab dan nama menu."
          />
          <Field
            nama="legal_name"
            label="Nama resmi lengkap"
            awal={situs.legalName}
            error={galat("legal_name")}
            hint="Dipakai di footer dan data terstruktur."
          />
          <Field
            nama="tagline"
            label="Slogan"
            awal={situs.tagline}
            error={galat("tagline")}
            placeholder="Berakhlak, Berilmu, Berprestasi"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Deskripsi singkat</Label>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={situs.description}
            maxLength={400}
            aria-invalid={Boolean(galat("description"))}
            placeholder="Dipakai sebagai deskripsi bawaan di mesin pencari."
          />
          {galat("description") ? (
            <p className="text-xs font-medium text-destructive">
              {galat("description")}
            </p>
          ) : null}
        </div>
      </Panel>

      <Panel className="space-y-4 p-4 sm:p-5">
        <h2 className="text-lg font-semibold tracking-tight">Data resmi</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            nama="identity_status"
            label="Bentuk sekolah"
            awal={situs.identity.status}
            error={galat("identity_status")}
            placeholder="Madrasah Tsanawiyah Swasta"
          />
          <Field
            nama="npsn"
            label="NPSN"
            awal={situs.identity.npsn}
            error={galat("npsn")}
            placeholder="10 digit resmi"
          />
          <Field
            nama="accreditation"
            label="Status akreditasi"
            awal={situs.identity.accreditation}
            error={galat("accreditation")}
            placeholder="mis. A / Unggul / Tidak terakreditasi"
          />
          <Field
            nama="founded_year"
            label="Tahun berdiri"
            awal={situs.identity.foundedYear || ""}
            error={galat("founded_year")}
            placeholder="mis. 1998"
            hint="Kosongkan bila belum diketahui; tahun 0 disembunyikan di situs."
          />
          <Field
            nama="curriculum"
            label="Kurikulum"
            awal={situs.identity.curriculum}
            error={galat("curriculum")}
          />
          <Field
            nama="founder"
            label="Lembaga pengusul"
            awal={situs.identity.founder}
            error={galat("founder")}
            placeholder="mis. LP Ma'arif NU"
          />
        </div>
      </Panel>

      <Panel className="space-y-4 p-4 sm:p-5">
        <h2 className="text-lg font-semibold tracking-tight">
          Alamat dan peta
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            nama="street"
            label="Nama jalan dan nomor"
            awal={situs.address.street}
            error={galat("street")}
          />
          <Field
            nama="village"
            label="Desa atau kelurahan"
            awal={situs.address.village}
            error={galat("village")}
          />
          <Field
            nama="subdistrict"
            label="Kecamatan"
            awal={situs.address.subdistrict}
            error={galat("subdistrict")}
          />
          <Field
            nama="city"
            label="Kabupaten atau kota"
            awal={situs.address.city}
            error={galat("city")}
          />
          <Field
            nama="province"
            label="Provinsi"
            awal={situs.address.province}
            error={galat("province")}
          />
          <Field
            nama="postal_code"
            label="Kode pos"
            awal={situs.address.postalCode}
            error={galat("postal_code")}
          />
          <Field
            nama="geo_lat"
            label="Lintang (latitude)"
            awal={situs.geo.latitude}
            error={galat("geo_lat")}
            placeholder="-7.3975"
            hint="Buka lokasi sekolah di Google Maps, lalu salin angka lintang."
          />
          <Field
            nama="geo_lng"
            label="Bujur (longitude)"
            awal={situs.geo.longitude}
            error={galat("geo_lng")}
            placeholder="109.9736"
            hint="Kosongkan bila belum diukur; peta memakai titik perkiraan."
          />
        </div>
      </Panel>

      <Panel className="space-y-4 p-4 sm:p-5">
        <h2 className="text-lg font-semibold tracking-tight">Kontak</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            nama="phone"
            label="Nomor telepon"
            awal={situs.contact.phone}
            error={galat("phone")}
            placeholder="0271-000000"
            hint="Kosongkan bila belum ada; tombol telepon disembunyikan."
          />
          <Field
            nama="email"
            label="Email sekolah"
            awal={situs.contact.email}
            error={galat("email")}
            placeholder="info@sekolah.sch.id"
          />
          <Field
            nama="whatsapp"
            label="Nomor WhatsApp"
            awal={situs.contact.whatsapp}
            error={galat("whatsapp")}
            placeholder="6281234567890"
            hint="Format internasional tanpa tanda +. Kosongkan dulu bila belum ada: nomor yang keliru membuat orang tua menghubungi orang yang bukan sekolah."
          />
          <Field
            nama="students"
            label="Jumlah siswa"
            awal={situs.stats.students || ""}
            error={galat("students")}
            placeholder="mis. 184"
            hint="Angka saja. Dipakai sebagai data statistik."
          />
        </div>
      </Panel>

      <TombolSimpan>Simpan identitas</TombolSimpan>
    </form>
  );
}