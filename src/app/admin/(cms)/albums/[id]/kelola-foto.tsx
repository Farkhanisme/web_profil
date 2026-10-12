"use client";

import { useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ImagePlus,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import { useUploadQueue, type ItemAntrean } from "@/components/media/use-upload-queue";
import { sisipFoto, ubahKeterangan, pilihSampul } from "@/app/admin/(cms)/actions/albums";
import { TombolHapus } from "@/components/admin/delete-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

/**
 * Pengelola foto dalam satu album.
 *
 * Unggah berjalan berurutan (Telegram membatasi ~20 pesan per menit).
 * Setiap berkas yang selesai langsung disimpan ke database, sehingga
 * kegagalan satu berkas tidak membatalkan berkas lain dan hasil yang
 * sudah tersimpan tidak hilang saat halaman dimuat ulang.
 */

export interface FotoAlbum {
  id: string;
  caption: string;
  media: {
    id: string;
    width: number;
    height: number;
    alt: string;
  };
}

function BarisAntrean({ item, formatUkuran }: { item: ItemAntrean; formatUkuran: (b: number) => string }) {
  const hampirSelesai = item.status === "selesai";

  return (
    <li className="flex items-center gap-3 rounded-lg border bg-card px-3 py-2">
      <div className="size-10 shrink-0 overflow-hidden rounded bg-muted">
        {item.pratinjau ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.pratinjau} alt="" className="h-full w-full object-cover" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.nama}</p>
        <div className="flex items-center gap-2">
          {item.status === "mengunggah" || item.status === "mengompresi" ? (
            <Progress value={item.progres} className="h-1 max-w-40" />
          ) : null}
          <p className="truncate text-xs text-muted-foreground">
            {item.status === "menunggu"
              ? "Menunggu"
              : item.status === "mengompresi"
                ? "Mengompres..."
                : item.status === "mengunggah"
                  ? `Mengunggah ${item.progres}%`
                  : item.status === "selesai"
                    ? `Selesai - ${formatUkuran(item.ukuranAkhir)}`
                    : "Gagal"}
          </p>
        </div>
        {item.galat ? (
          <p role="alert" className="mt-0.5 text-xs font-medium text-destructive">
            {item.galat}
          </p>
        ) : null}
      </div>

      {hampirSelesai ? (
        <CheckCircle2 className="size-4 shrink-0 text-primary" aria-hidden />
      ) : item.status === "gagal" ? (
        <XCircle className="size-4 shrink-0 text-destructive" aria-hidden />
      ) : null}
    </li>
  );
}

export function KelolaFoto({
  albumId,
  fotoAwal,
  coverAwal,
}: {
  albumId: string;
  fotoAwal: FotoAlbum[];
  coverAwal: string | null;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const { items, tambah, adaProses, formatUkuran } = useUploadQueue();
  const [, mulaiTransisi] = useTransition();
  const [galat, setGalat] = useState<string | null>(null);

  const pilihBerkas = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setGalat(null);

    const hasil = await tambah(
      Array.from(files),
      async ({ mediaId, nama }) => {
        // Foto langsung ditulis ke album begitu satu berkas selesai.
        const balasan = await sisipFoto({
          albumId,
          mediaId,
          caption: nama.replace(/\.[^.]+$/, ""),
        });
        if (!balasan.ok) throw new Error(balasan.galat ?? "Gagal menyimpan foto.");
      },
    );

    if (hasil.pesan) setGalat(hasil.pesan);

    // Daftar foto di server berubah, muat ulang tampilan.
    mulaiTransisi(() => router.refresh());
  };

  const becomeSampul = async (mediaId: string) => {
    setGalat(null);
    const balasan = await pilihSampul({ albumId, mediaId });
    if (!balasan.ok) {
      setGalat(balasan.galat ?? "Gagal memilih sampul.");
      return;
    }
    mulaiTransisi(() => router.refresh());
  };

  return (
    <div className="space-y-5">
      {/* Area unggah */}
      <div
        className="rounded-xl border border-dashed bg-card p-4"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          void pilihBerkas(e.dataTransfer.files);
        }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <ImagePlus className="size-6 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium">Unggah foto</p>
          <p className="max-w-md text-xs text-muted-foreground">
            Pilih beberapa berkas sekaligus, atau seret ke area ini.
            Maksimal 20 foto per satu sesi unggah. Foto dikompres otomatis
            menjadi WebP sebelum diunggah.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={adaProses}
            onClick={() => inputRef.current?.click()}
          >
            {adaProses ? "Sedang mengunggah..." : "Pilih foto"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            disabled={adaProses}
            onChange={(e) => {
              void pilihBerkas(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {galat ? (
        <p role="alert" className="text-sm font-medium text-destructive">
          {galat}
        </p>
      ) : null}

      {items.length > 0 ? (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Antrean unggah ({items.length})
          </p>
          <ul className="space-y-2">
            {items.map((item) => (
              <BarisAntrean key={item.id} item={item} formatUkuran={formatUkuran} />
            ))}
          </ul>
        </div>
      ) : null}

      {/* Daftar foto yang sudah tersimpan */}
      <div>
        <p className="mb-2 text-sm font-medium">
          Foto tersimpan ({fotoAwal.length})
        </p>

        {fotoAwal.length === 0 ? (
          <p className="rounded-lg border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            Belum ada foto di album ini.
          </p>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fotoAwal.map((foto) => (
              <li
                key={foto.id}
                className={cn(
                  "rounded-xl border bg-card p-2",
                  coverAwal === foto.media.id && "ring-2 ring-primary",
                )}
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={`/media/${foto.media.id}?w=480`}
                    alt={foto.caption || foto.media.alt || "Foto kegiatan"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                  {coverAwal === foto.media.id ? (
                    <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                      <Star className="size-3 fill-current" aria-hidden />
                      Sampul
                    </span>
                  ) : null}
                </div>

                <KeteranganFoto
                  photoId={foto.id}
                  awal={foto.caption}
                  onGalat={setGalat}
                />

                <div className="mt-1 flex items-center justify-between">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-xs"
                    disabled={coverAwal === foto.media.id}
                    onClick={() => void becomeSampul(foto.media.id)}
                  >
                    <Star className="size-3.5" aria-hidden />
                    {coverAwal === foto.media.id ? "Sampul album" : "Jadikan sampul"}
                  </Button>

                  <TombolHapus
                    action={hapusFotoAction}
                    id={foto.id}
                    label="Hapus foto"
                    deskripsi="Foto akan dihapus dari album ini."
                  >
                    <Trash2 className="size-4 text-destructive" aria-hidden />
                    <span className="sr-only">Hapus foto</span>
                  </TombolHapus>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

/** Server Action yang dibungkus agar bisa dipakai sebagai prop `action`. */
async function hapusFotoAction(formData: FormData): Promise<void> {
  const { hapusFoto } = await import("@/app/admin/(cms)/actions/albums");
  await hapusFoto(formData);
}

/** Kolom keterangan yang tersimpan saat tombol ditekan atau blur. */
function KeteranganFoto({
  photoId,
  awal,
  onGalat,
}: {
  photoId: string;
  awal: string;
  onGalat: (pesan: string | null) => void;
}) {
  const router = useRouter();
  const [nilai, setNilai] = useState(awal);
  const [tersimpan, setTersimpan] = useState(true);
  const [, mulaiTransisi] = useTransition();

  const simpan = async () => {
    if (nilai === awal) {
      setTersimpan(true);
      return;
    }
    const balasan = await ubahKeterangan({ photoId, caption: nilai });
    if (!balasan.ok) {
      onGalat(balasan.galat ?? "Gagal menyimpan keterangan.");
      setNilai(awal);
      return;
    }
    onGalat(null);
    setTersimpan(true);
    mulaiTransisi(() => router.refresh());
  };

  return (
    <div className="mt-2">
      <Input
        value={nilai}
        maxLength={200}
        placeholder="Keterangan foto"
        onChange={(e) => {
          setNilai(e.target.value);
          setTersimpan(false);
        }}
        onBlur={() => void simpan()}
        className="h-8 text-xs"
      />
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        {tersimpan ? "Tersimpan" : "Belum tersimpan - klik luar kolom"}
      </p>
    </div>
  );
}
