"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Tombol simpan yang menampilkan keadaan sibuk dari Server Action. */
export function TombolSimpan({
  children = "Simpan",
  pendingLabel = "Menyimpan...",
}: {
  children?: React.ReactNode;
  pendingLabel?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-primary text-primary-foreground hover:bg-primary-hover"
    >
      {pending ? (
        <>
          <Loader2 className="size-4 animate-spin" aria-hidden />
          {pendingLabel}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/** Tombol batal yang tidak melakukan aksi apa pun. */
export function TombolBatal({ children = "Batal" }: { children?: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <Button type="button" variant="outline" disabled={pending}>
      {children}
    </Button>
  );
}
