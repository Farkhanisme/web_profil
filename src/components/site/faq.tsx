import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { profil, type FaqItem } from "@/config/profil";

/**
 * Daftar pertanyaan umum.
 *
 * Disimpan sebagai <details> semantik lewat komponen accordion, dan
 * sekaligus menjadi sumber data JSON-LD `FAQPage` supaya mesin pencari
 * dapat menampilkan jawaban langsung di hasil pencarian.
 *
 * Pertanyaan pertama dibuka sejak awal supaya isi halaman tidak terasa
 * kosong dan mesin AI lebih mudah menemukan jawabannya.
 */
export function Faq({ items = profil.faq }: { items?: FaqItem[] }) {
  if (items.length === 0) return null;

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="faq-0"
      className="w-full"
    >
      {items.map((item, i) => (
        <AccordionItem key={item.question} value={`faq-${i}`}>
          <AccordionTrigger className="text-left text-base font-medium">
            {item.question}
          </AccordionTrigger>
          <AccordionContent className="leading-relaxed text-muted-foreground">
            {item.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}