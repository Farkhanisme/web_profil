import { BreadcrumbAtas } from "@/components/site/breadcrumb";
import { Container } from "@/components/site/container";
import { PageHeader } from "@/components/site/page-header";

/**
 * Placeholder sementara.
 * Halaman asli dibangun pada task T12 sampai T15.
 */
export default function HalamanProgram() {
  return (
    <>
      <BreadcrumbAtas nama="Program" segmen="program" />
      <PageHeader judul="Program" deskripsi="Halaman ini sedang disiapkan." />
      <Container>
        <div className="py-12 text-sm text-muted-foreground">
          Isi halaman belum tersedia.
        </div>
      </Container>
    </>
  );
}
