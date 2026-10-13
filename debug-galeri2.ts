import { albumBySlug, photoSemua } from "@/lib/queries/konten";
async function main() {
  const album = await albumBySlug("kegiatan-sekolah");
  console.log("Album:", album?.id, album?.title);
  if (album) {
    const fotos = await photoSemua(album.id);
    console.log("Photos:", fotos.length);
    for (const f of fotos) {
      console.log(" -", f.id, f.media?.id, f.caption);
    }
  }
}
main();
