import Link from "next/link";
import { MailOpen } from "lucide-react";
import { daftarPesan, PESAN_PER_HALAMAN } from "@/lib/queries/messages";
import { hapusPesan, tandaiSemuaDibaca, tandaiDibaca } from "../actions/messages";
import { KepalaHalaman, KeadaanKosong, Panel } from "@/components/admin/ui";
import { TombolHapus } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatTanggal } from "@/lib/utils";
import { cn } from "@/lib/utils";

export const metadata = { title: "Pesan Masuk" };

export default async function HalamanPesan({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const ke = Number(params.halaman ?? 1);
  const data = await daftarPesan(Number.isFinite(ke) ? ke : 1);

  return (
    <>
      <KepalaHalaman
        judul="Pesan Masuk"
        deskripsi={
          data.belumDibaca > 0
            ? `${data.belumDibaca} pesan belum dibaca dari ${data.total} total.`
            : `${data.total} pesan, semua sudah dibaca.`
        }
      >
        {data.belumDibaca > 0 ? (
          <form action={tandaiSemuaDibaca}>
            <Button type="submit" variant="outline">
              <MailOpen className="size-4" aria-hidden />
              Tandai semua dibaca
            </Button>
          </form>
        ) : null}
      </KepalaHalaman>

      {data.total === 0 ? (
        <Panel>
          <KeadaanKosong
            judul="Belum ada pesan"
            pesan="Pesan yang dikirim lewat formulir kontak pada halaman situs akan muncul di sini."
          />
        </Panel>
      ) : (
        <>
          <ul className="space-y-3">
            {data.pesan.map((pesan) => (
              <li key={pesan.id}>
                <Panel
                  className={cn(
                    "p-4",
                    !pesan.isRead && "border-primary/40 bg-primary-soft/40",
                  )}
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{pesan.name}</p>
                        {!pesan.isRead ? (
                          <Badge className="bg-primary text-primary-foreground">
                            Baru
                          </Badge>
                        ) : null}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {pesan.contact}
                      </p>
                    </div>
                    <time
                      dateTime={new Date(pesan.createdAt * 1000).toISOString()}
                      className="shrink-0 text-xs text-muted-foreground"
                    >
                      {formatTanggal(pesan.createdAt)}
                    </time>
                  </div>

                  <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed">
                    {pesan.body}
                  </p>

                  <div className="mt-3 flex items-center gap-1">
                    <form action={tandaiDibaca}>
                      <input type="hidden" name="id" value={pesan.id} />
                      <input
                        type="hidden"
                        name="tandai"
                        value={pesan.isRead ? "0" : "1"}
                      />
                      <Button type="submit" variant="ghost" size="sm">
                        {pesan.isRead ? "Tandai belum dibaca" : "Tandai dibaca"}
                      </Button>
                    </form>
                    <TombolHapus
                      action={hapusPesan}
                      id={pesan.id}
                      deskripsi={`Pesan dari ${pesan.name} akan dihapus permanen.`}
                    />
                  </div>
                </Panel>
              </li>
            ))}
          </ul>

          {data.totalHalaman > 1 ? (
            <nav
              aria-label="Navigasi halaman pesan"
              className="mt-6 flex items-center justify-between gap-2"
            >
              {data.halaman <= 1 ? (
                <Button variant="outline" size="sm" disabled>
                  Sebelumnya
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/messages?halaman=${data.halaman - 1}`}>
                    Sebelumnya
                  </Link>
                </Button>
              )}

              <p className="text-sm text-muted-foreground">
                Halaman {data.halaman} dari {data.totalHalaman}
              </p>

              {data.halaman >= data.totalHalaman ? (
                <Button variant="outline" size="sm" disabled>
                  Berikutnya
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link href={`/admin/messages?halaman=${data.halaman + 1}`}>
                    Berikutnya
                  </Link>
                </Button>
              )}
            </nav>
          ) : null}

          <p className="mt-4 text-xs text-muted-foreground">
            Menampilkan {PESAN_PER_HALAMAN} pesan per halaman.
          </p>
        </>
      )}
    </>
  );
}