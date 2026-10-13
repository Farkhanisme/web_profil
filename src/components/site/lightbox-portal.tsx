"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Lightbox } from "@/components/site/lightbox";

interface LightboxPortalProps {
  photos: { id: string; src: string; caption: string; width: number; height: number }[];
}

/**
 * Portal untuk lightbox yang dirender di document.body.
 *
 * Dipisah ke file sendiri karena menggunakan "use client" hooks
 * (useState, useEffect) dan tidak bisa berada di file Server Component.
 */
export function LightboxPortal({ photos }: LightboxPortalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const handler = (e: CustomEvent) => {
      setIndex(e.detail.index);
      setIsOpen(true);
    };
    window.addEventListener("open-lightbox", handler as EventListener);
    return () => window.removeEventListener("open-lightbox", handler as EventListener);
  }, []);

  if (!isOpen) return null;

  return createPortal(
    <Lightbox
      photos={photos}
      initialIndex={index}
      onClose={() => setIsOpen(false)}
    />,
    document.body,
  );
}