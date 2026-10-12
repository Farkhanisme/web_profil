"use client";

import { useActionState, useEffect, useRef } from "react";
import { useFormStatus } from "react-dom";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { kirimPesan, type KontakState } from "@/app/(public)/kontak/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { site } from "@/config/site";

function TombolKirim() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="h-11 w-full bg-primary text-primary-foreground transition-colors hover:bg-primary-hover sm:w-auto"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          Mengirim...
        </>
      ) : (
        <>
          <Send className="size-4" aria-hidden />
          Kirim Pesan
        </>
      )}
    </Button>
  );
}

export function FormKontak() {
  const [state, formAction] = useActionState<KontakState, FormData>(
    kirimPesan,
    undefined,
  );
  const formRef = useRef<HTMLFormElement>(null);

  // Setelah berhasil, kosongkan isi formulir.
  useEffect(() => {
    if (state?.sukses) formRef.current?.reset();
  }, [state]);

  const galat = (f: string) => state?.fieldErrors?.[f]?.[0];

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      {state?.sukses ? (
        <Alert role="status">
          <CheckCircle2 className="size-4" aria-hidden />
          <AlertDescription>
            Terima kasih. Pesan Anda sudah kami terima dan akan dibaca
            pengelola sekolah.
          </AlertDescription>
        </Alert>
      ) : null}

      {state?.error ? (
        <Alert variant="destructive" role="alert">
          <AlertCircle className="size-4" aria-hidden />
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="kontak-nama">
          Nama <span className="text-destructive">*</span>
        </Label>
        <Input
          id="kontak-nama"
          name="name"
          required
          maxLength={120}
          placeholder="Nama Anda"
          aria-invalid={Boolean(galat("name"))}
        />
        {galat("name") ? (
          <p className="text-xs font-medium text-destructive">{galat("name")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="kontak-kontak">
          Email atau nomor telepon <span className="text-destructive">*</span>
        </Label>
        <Input
          id="kontak-kontak"
          name="contact"
          required
          maxLength={160}
          placeholder="contoh: 081234567890 atau nama@email.com"
          aria-invalid={Boolean(galat("contact"))}
        />
        <p className="text-xs text-muted-foreground">
          Dipakai pengelola untuk membalas pesan Anda.
        </p>
        {galat("contact") ? (
          <p className="text-xs font-medium text-destructive">{galat("contact")}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="kontak-isi">
          Pesan <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="kontak-isi"
          name="body"
          required
          rows={6}
          maxLength={3000}
          placeholder="Tulis pertanyaan atau keterangan yang ingin Anda sampaikan."
          aria-invalid={Boolean(galat("body"))}
        />
        {galat("body") ? (
          <p className="text-xs font-medium text-destructive">{galat("body")}</p>
        ) : null}
      </div>

      {/*
        Honeypot. Disembunyikan dari pengguna tetapi tetap diterima
        peramban, sehingga bot yang mengisi semua kolom akan tersaring.
      */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <Label htmlFor="kontak-website">Jangan diisi</Label>
        <Input
          id="kontak-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          defaultValue=""
        />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <TombolKirim />
        <p className="text-xs text-muted-foreground">
          Data Anda hanya dipakai untuk membalas pesan ini.{" "}
          <a href="/kebijakan-privasi" className="underline hover:text-foreground">
            Kebijakan privasi
          </a>
          .
        </p>
      </div>

      {site.contact.phone && !site.contact.phone.startsWith("TODO") ? (
        <p className="text-sm text-muted-foreground">
          lebih suka menelepon?{" "}
          <a
            href={`tel:${site.contact.phone.replace(/\s/g, "")}`}
            className="font-medium text-primary hover:underline"
          >
            {site.contact.phone}
          </a>
        </p>
      ) : null}
    </form>
  );
}