import Link from "next/link";
import { ArrowDown, ArrowUp, Plus } from "lucide-react";
import { staffSemua } from "@/lib/queries/staff";
import { geserStaff, hapusStaff } from "../actions/staff";
import { KepalaHalaman, KeadaanKosong, Panel } from "@/components/admin/ui";
import { TombolHapus } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const metadata = { title: "Guru dan Staf" };

export default async function HalamanStaff({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [daftar, params] = await Promise.all([staffSemua(), searchParams]);
  const tersimpan = params.saved === "1";
  const terhapus = params.deleted === "1";

  return (
    <>
      <KepalaHalaman
        judul="Guru dan Staf"
        deskripsi={`${daftar.length} data. Urutan di sini menentukan urutan tampil di halaman publik.`}
      >
        <Button asChild className="bg-primary hover:bg-primary-hover">
          <Link href="/admin/staff/baru">
            <Plus className="size-4" aria-hidden />
            Tambah
          </Link>
        </Button>
      </KepalaHalaman>

      {tersimpan ? (
        <div className="mb-4 rounded-lg border border-primary/30 bg-primary-soft px-4 py-3 text-sm text-primary">
          Perubahan tersimpan dan halaman publik sudah diperbarui.
        </div>
      ) : null}
      {terhapus ? (
        <div className="mb-4 rounded-lg border border-border bg-muted px-4 py-3 text-sm">
          Data berhasil dihapus.
        </div>
      ) : null}

      <Panel>
        {daftar.length === 0 ? (
          <KeadaanKosong
            judul="Belum ada guru atau staf"
            pesan="Tambahkan data guru dan staf agar halaman publik terisi. Foto bersifat opsional."
            aksi={
              <Button asChild className="mt-1 bg-primary hover:bg-primary-hover">
                <Link href="/admin/staff/baru">
                  <Plus className="size-4" aria-hidden />
                  Tambah data pertama
                </Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y">
            {daftar.map((orang, index) => (
              <li
                key={orang.id}
                className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-muted/40 sm:px-4"
              >
                {/* Urutan manual */}
                <div className="flex shrink-0 flex-col gap-0.5">
                  <form action={geserStaff}>
                    <input type="hidden" name="id" value={orang.id} />
                    <input type="hidden" name="arah" value="naik" />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-xs"
                      disabled={index === 0}
                      aria-label={`Naikkan urutan ${orang.name}`}
                    >
                      <ArrowUp className="size-3.5" aria-hidden />
                    </Button>
                  </form>
                  <form action={geserStaff}>
                    <input type="hidden" name="id" value={orang.id} />
                    <input type="hidden" name="arah" value="turun" />
                    <Button
                      type="submit"
                      variant="ghost"
                      size="icon-xs"
                      disabled={index === daftar.length - 1}
                      aria-label={`Turunkan urutan ${orang.name}`}
                    >
                      <ArrowDown className="size-3.5" aria-hidden />
                    </Button>
                  </form>
                </div>

                {/* Foto */}
                <div className="size-11 shrink-0 overflow-hidden rounded-lg bg-muted">
                  {orang.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/media/${orang.photo.id}?w=240`}
                      alt={orang.photo.alt || orang.name}
                      width={44}
                      height={44}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="flex h-full items-center justify-center text-xs text-muted-foreground">
                      {orang.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Nama dan jabatan */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/staff/${orang.id}`}
                      className="truncate font-medium hover:underline"
                    >
                      {orang.name}
                    </Link>
                    <Badge variant="secondary" className="hidden shrink-0 sm:inline-flex">
                      {index + 1}
                    </Badge>
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    {[orang.position, orang.subject].filter(Boolean).join(" - ") ||
                      "Jabatan belum diisi"}
                  </p>
                </div>

                <TombolHapus
                  action={hapusStaff}
                  id={orang.id}
                  deskripsi={`Data "${orang.name}" akan dihapus dari daftar.`}
                />
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Separator className="my-6" />
      <p className="text-xs text-muted-foreground">
        Kolom NIP, nomor telepon pribadi, dan alamat rumah sengaja tidak ada di
        sistem ini.
      </p>
    </>
  );
}
