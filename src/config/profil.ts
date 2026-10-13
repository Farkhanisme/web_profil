import type { IsiProfil } from "@/lib/konten";

/**
 * Isi profil sekolah — NILAI BAWAAN, bukan sumber kebenaran.
 *
 * Seluruh isi di bawah dapat diubah pengelola lewat CMS (`/admin/profil`).
 * Nilai ini hanya dipakai sebagai cadangan ketika kolom di database kosong,
 * sehingga pengelola baru yang belum pernah menyimpan apa pun tetap melihat
 * tampilan yang sama seperti sebelum fitur CMS dipasang.
 *
 * PENTING: masih banyak "DRAF:" di bawah. Ganti dengan data resmi sekolah
 * lewat CMS (atau di sini bila ingin controlling lewat kode) sebelum rilis.
 */

export const profil: IsiProfil = {
  ringkasan:
    "MTs Ma'arif Tieng adalah madrasah tsanawiyah swasta di Desa Tieng, Kecamatan Kejajar, Kabupaten Wonosobo. Sekolah ini menyediakan pendidikan Islam terpadu bagi siswa kelas VII sampai IX.",

  sejarah: [
    "DRAF: Tuliskan kapan MTs Ma'arif Tieng berdiri, siapa pendirinya, dan kebutuhan apa yang melatarbelakangi berdirinya sekolah ini.",
    "DRAF: Tuliskan perkembangan sekolah sejak berdiri, termasuk penambahan ruang kelas dan kegiatan yang berjalan sampai sekarang.",
  ],

  visi: "DRAF: Tulis visi resmi sekolah di sini.",

  misi: [
    "DRAF: Misi pertama tentang pendidikan yang memadukan ilmu agama dan ilmu pengetahuan umum.",
    "DRAF: Misi kedua tentang pembiasaan akhlak mulia bagi seluruh siswa.",
    "DRAF: Misi ketiga tentang mengembangkan potensi setiap siswa.",
  ],

  sambutan: {
    nama: "DRAF: Nama lengkap dan gelar kepala madrasah",
    jabatan: "Kepala Madrasah",
    teks: [
      "DRAF: Alhamdulillahirrahmanirrahim. Kami ucapkan terima kasih kepada warga sekolah, orang tua, dan seluruh mitra yang selama ini mendukung madrasah.",
      "DRAF: Madrasah ini berdiri sebagai bentuk jawaban terhadap kebutuhan pendidikan Islam yang meningkat di wilayah ini.",
      "DRAF: Setiap hari kami membimbing siswa menjadi pribadi yang berakhlak mulia, berilmu, dan bermanfaat bagi lingkungan.",
      "DRAF: Kami terbuka untuk bekerja sama dengan orang tua. Selamat datang di rumah pendidikan anak-anak kita.",
    ],
  },

  struktur: [
    { name: "DRAF: Nama kepala madrasah", position: "Kepala Madrasah" },
    { name: "DRAF: Nama sekretaris", position: "Sekretaris Madrasah" },
    { name: "DRAF: Nama ketua tata usaha", position: "Ketua Tata Usaha" },
    { name: "DRAF: Nama kepala bagian", position: "Kepala Bagian Pembelajaran" },
    { name: "DRAF: Nama kepala bagian", position: "Kepala Bagian Kesiswaan" },
    { name: "DRAF: Nama kepala bagian", position: "Kepala Bagian Sarana dan Prasarana" },
  ],

  fasilitas: [
    { name: "Ruang kelas", description: "DRAF: keterangan singkat" },
    { name: "Laboratorium komputer", description: "DRAF: keterangan singkat" },
    { name: "Perpustakaan", description: "DRAF: keterangan singkat" },
    { name: "Musholla", description: "DRAF: keterangan singkat" },
    { name: "Toilet siswa", description: "DRAF: keterangan singkat" },
    { name: "Kantin", description: "DRAF: keterangan singkat" },
  ],

  faq: [
    {
      question: "Di mana lokasi MTs Ma'arif Tieng?",
      answer:
        "MTs Ma'arif Tieng berada di Desa Tieng, Kecamatan Kejajar, Kabupaten Wonosobo. Alamat lengkap dan tautan peta tersedia pada halaman Kontak.",
    },
    {
      question: "Apakah MTs Ma'arif Tieng sekolah negeri atau swasta?",
      answer:
        "MTs Ma'arif Tieng adalah madrasah tsanawiyah swasta yang dikelola oleh lembaga pengusul sekolah.",
    },
    {
      question: "Kelas berapa saja yang ada di MTs Ma'arif Tieng?",
      answer:
        "Madrasah ini menjalankan kelas VII, VIII, dan IX untuk kelompok usia sekitar 13 sampai 15 tahun.",
    },
    {
      question: "Kurikulum apa yang digunakan MTs Ma'arif Tieng?",
      answer:
        "Sekolah menerapkan Kurikulum Merdeka Madrasah yang memadukan mata pelajaran umum, pendidikan agama Islam, dan kegiatan kokurikuler.",
    },
    {
      question: "Ekstrakurikuler apa saja yang tersedia?",
      answer:
        "Daftar lengkap ekstrakurikuler beserta jadwal, pembina, dan deskripsinya tersedia pada halaman Ekstrakurikuler.",
    },
    {
      question: "Bagaimana cara mendaftar menjadi siswa baru?",
      answer:
        "Pendaftaran siswa baru dibuka setiap tahun melalui pengumuman resmi sekolah. Informasi terbaru dapat diperoleh melalui halaman Kontak.",
    },
  ],

  updatedAt: "2026-10-12",
};

/** True bila masih ada draf yang harus diganti sekolah sebelum rilis. */
export function profilAdaPlaceholder(): boolean {
  return JSON.stringify(profil).includes("DRAF:");
}