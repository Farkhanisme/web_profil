"use client";

import { useRef, useState } from "react";
import { Trash2 } from "lucide-react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

/**
 * Tombol hapus dengan konfirmasi.
 *
 * Konfirmasi wajib: menghapus guru/album/program adalah aksi yang tidak
 * bisa dikembalikan dari sisi antarmuka.
 */
export function TombolHapus({
  action,
  id,
  label = "Hapus",
  deskripsi = "Tindakan ini tidak dapat dibatalkan.",
  children,
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  /** Nama yang disebut di dialog konfirmasi, mis. "Budi Santoso". */
  label?: string;
  deskripsi?: string;
  children?: React.ReactNode;
}) {
  const [buka, setBuka] = useState(false);
  const [sibuk, setSibuk] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <>
      <form ref={formRef} action={action} className="contents">
        <input type="hidden" name="id" value={id} />
      </form>

      <AlertDialog open={buka} onOpenChange={setBuka}>
        <AlertDialogTrigger asChild>
          <Button type="button" variant="ghost" size="sm" className="text-destructive hover:bg-destructive/10">
            {children ?? (
              <>
                <Trash2 className="size-4" aria-hidden />
                <span className="sr-only sm:not-sr-only">{label}</span>
              </>
            )}
          </Button>
        </AlertDialogTrigger>

        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="size-5 text-destructive" aria-hidden />
              Hapus data ini?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {deskripsi} Data yang sudah dihapus tidak dapat dikembalikan.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={sibuk}
              onClick={(e) => {
                e.preventDefault();
                setSibuk(true);
                // Jalankan Server Action lewat form yang tersembunyi.
                formRef.current?.requestSubmit();
              }}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              {sibuk ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                  Menghapus...
                </>
              ) : (
                "Ya, hapus"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
