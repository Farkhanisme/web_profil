import type { IsiProfil, IsiSitus } from "@/lib/konten";
import type { Staff } from "@/lib/db/types";

/**
 * ISI CONTOH UNTUK PROTOTYPE — BUKAN DATA SEKOLAH.
 *
 * `src/config/profil.ts` masih banyak berisi "DRAF: ...". Teks contoh
 * dipakai supaya prototype bisa dinilai: panjang paragraf, ritme, dan
 * hierarki informasi hanya terlihat benar kalau isinya realistis.
 *
 * Hapus modul ini dan panggil `bacaProfil()` / `bacaSitus()` begitu data
 * sekolah asli tersedia di CMS.
 */

/** Melengkapi field yang masih TODO agar tampilannya tidak jelek. */
export const SITUS_LENGKAP: Partial<IsiSitus> = {
  identity: {
    npsn: "69712345",
    accreditation: "B",
    status: "Madrasah Tsanawiyah Swasta",
    foundedYear: 1998,
    curriculum: "Kurikulum Merdeka Madrasah",
    founder: "LP Ma'arif NU",
  },
  address: {
    street: "Jl. Raya No 12",
    village: "Tieng",
    subdistrict: "Kejajar",
    city: "Kabupaten Wonosobo",
    province: "Jawa Tengah",
    postalCode: "56353",
    country: "ID",
  },
  contact: {
    phone: "(0287) 5921234",
    email: "mtsmaariftieng@maarifnu.id",
    whatsapp: "6281234567890",
  },
  sameAs: [
    "https://facebook.com/mtsmaariftieng",
    "https://instagram.com/mtsmaariftieng",
  ],
};

export const PROFIL_CONTOH: IsiProfil = {
  ringkasan:
    "MTs Ma'arif Tieng adalah madrasah tsanawiyah swasta di Desa Tieng, Kecamatan Kejajar, Kabupaten Wonosobo. Kami mendidik anak usia 12 sampai 15 tahun dengan pendekatan Islam terpadu: ilmu agama yang hidup dan ilmu pengetahuan umum yang kokoh, sehingga siswa tumbuh menjadi pribadi yang berakhlak, berilmu, dan berprestasi.",

  visi:
    "Menjadi madrasah yang unggul dalam akhlak, berilmu, dan berprestasi, serta menjadi pusat pendidikan Islam yang dipercaya masyarakat di wilayah Kejajar.",

  misi: [
    "Menyelenggarakan pembelajaran ilmu agama yang berakar pada Al-Qur'an dan As-Sunnah, serta membiasakan akhlak mulia dalam keseharian siswa.",
    "Mengembangkan kemampuan berpikir kritis melalui ilmu pengetahuan umum yang berpadu dengan nilai keislaman.",
    "Menyediakan ruang bagi setiap siswa untuk menemukan dan mengembangkan bakatnya melalui kegiatan ekstrakurikuler yang terarah.",
    "Menjalin kerja sama yang erat dengan orang tua dan lembaga masyarakat dalam mendidik generasi berakhlak mulia.",
    "Menjadikan masjid, laboratorium, dan ruang belajar sebagai wahana pembiasaan ibadah keseharian.",
  ],

  sejarah: [
    "MTs Ma'arif Tieng berdiri pada tahun 1998 atas inisiatif tokoh masyarakat bersama LP Ma'arif NU Kecamatan Kejajar. Pada awal berdiri, madrasah hanya memiliki tiga tenaga pengajar dan berlangsung di salah satu rumah warga, dengan jumlah siswa belum sampai dua puluh orang.",
    "Sepanjang dekade berikutnya, jumlah siswa tumbuh secara stabil. Tahun 2005 dibangun ruang kelas permanen. Tahun 2012 ditambahkan laboratorium komputer dan perpustakaan. Tahun 2019 selesai membangun aula serbaguna.",
    "Status akreditasi ditetapkan pada tahun 2021. Sejak saat itu madrasah bergerak dari langkah awal menuju layanan masyarakat yang utuh: aktif, berkarakter, dan berdaya.",
  ],

  sambutan: {
    nama: "H. Muhammad Shofiyul Arifin, S.Pd.I., M.M.",
    jabatan: "Kepala Madrasah",
    teks: [
      "Alhamdulillahirrahmanirrahim. Segala puji bagi Allah yang telah memberi kami kesempatan untuk terus berkhidmat di dunia pendidikan, khususnya di Madrasah Tieng yang kita cintai.",
      "Madrasah ini berdiri sebagai jawaban atas kebutuhan pendidikan Islam yang terus meningkat di wilayah ini. Kami berusaha memastikan setiap siswa tidak hanya mengumpulkan nilai, tetapi juga membentuk karakternya: sopan, jujur, dan berdaya juang.",
      "Kami terbuka untuk bekerja sama dengan orang tua. Pendidikan yang berhasil adalah pendidikan yang dibangun bersama, bukan yang ditinggalkan di kelas. Selamat datang di rumah pendidikan anak-anak kami.",
    ],
  },

  struktur: [
    { name: "H. Muhammad Shofiyul Arifin, S.Pd.I., M.M.", position: "Kepala Madrasah" },
    { name: "Siti Aminah, S.Pd.I.", position: "Sekretaris Madrasah" },
    { name: "Bambang Setiawan, S.Pd.", position: "Ketua Tata Usaha" },
    { name: "Nurul Hidayah, S.Pd.I.", position: "Kepala Bagian Pembelajaran" },
    { name: "Abdul Aziz, S.Ag.", position: "Kepala Bagian Kesiswaan" },
    { name: "Dewi Anggraini, S.Pd.", position: "Kepala Bagian Sarana dan Prasarana" },
  ],

  fasilitas: [
    { name: "Masjid Madrasah", description: "Ruang ibadah harian untuk siswa, lengkap dengan sound system dan karpet." },
    { name: "Laboratorium Komputer", description: "Sepuluh unit komputer dengan koneksi internet untuk pembelajaran TIK." },
    { name: "Perpustakaan", description: "Koleksi buku pelajaran, fikih, dan majalah pendidikan; akses bebas untuk siswa." },
    { name: "Lapangan Olahraga", description: "Lapangan serbaguna untuk futsal, basket, dan upacara." },
    { name: "UKS", description: "Unit Kesehatan Sekolah dengan tenaga perawat dan kotak P3K." },
  ],

  updatedAt: "2026-10-13",

  faq: [
    {
      question: "Pendaftaran siswa baru masih dibuka?",
      answer:
        "Ya. Pendaftaran gelombang I dibuka setiap awal tahun pelajaran, dan gelombang II dibuka bila masih tersedia kursi. Hubungi nomor WhatsApp sekolah untuk informasi lebih lanjut.",
    },
    {
      question: "Apakah ada kegiatan Sabtu pagi?",
      answer:
        "Ada. Kegiatan Sabtu pagi terbuka untuk siswa kelas VII sampai IX. Isinya belajar bahasa Arab sederhana, tahfidz, dan murojaah.",
    },
    {
      question: "Kurikulum apa yang digunakan?",
      answer:
        "Kami menggunakan Kurikulum Merdeka Madrasah yang memadukan pembelajaran bidang agama dan bidang umum, dengan penguatan tahfidz Al-Qur'an.",
    },
    {
      question: "Apakah tersedia bus jemput-antar?",
      answer:
        "Ya. Kami bekerja sama dengan desa untuk menyiapkan bus jemput-antar bagi siswa yang tinggal jauh dari sekolah.",
    },
  ],
};

export const STAFF_CONTOH: Staff[] = [
  { id: "s1", name: "H. Muhammad Shofiyul Arifin, S.Pd.I., M.M.", position: "Kepala Madrasah", subject: "Pendidikan Agama Islam", photo: null, isPublished: true },
  { id: "s2", name: "Siti Aminah, S.Pd.I.", position: "Sekretaris Madrasah", subject: "Pendidikan Agama Islam", photo: null, isPublished: true },
  { id: "s3", name: "Nurul Hidayah, S.Pd.I.", position: "Kepala Bagian Pembelajaran", subject: "Bahasa Arab", photo: null, isPublished: true },
  { id: "s4", name: "Abdul Aziz, S.Ag.", position: "Kepala Bagian Kesiswaan", subject: "Fiqih", photo: null, isPublished: true },
  { id: "s5", name: "Bambang Setiawan, S.Pd.", position: "Ketua Tata Usaha", subject: "Matematika", photo: null, isPublished: true },
  { id: "s6", name: "Dewi Anggraini, S.Pd.", position: "Kepala Bagian Sarana dan Prasarana", subject: "Bahasa Indonesia", photo: null, isPublished: true },
  { id: "s7", name: "Rahmawati, S.Pd.I.", position: "Guru", subject: "Pendidikan Agama Islam", photo: null, isPublished: true },
  { id: "s8", name: "Fajar Setiawan, S.Pd.", position: "Guru", subject: "IPA", photo: null, isPublished: true },
  { id: "s9", name: "Retno Wulandari, S.Pd.", position: "Guru", subject: "Matematika", photo: null, isPublished: true },
  { id: "s10", name: "Imron Hidayat, S.Pd.", position: "Guru", subject: "Bahasa Indonesia", photo: null, isPublished: true },
  { id: "s11", name: "Kusuma Ayu, S.Pd.I.", position: "Guru", subject: "Bahasa Arab", photo: null, isPublished: true },
  { id: "s12", name: "Bagus Prasetya, S.Pd.", position: "Guru", subject: "IPS", photo: null, isPublished: true },
];

/** Program untuk blok jingga di beranda. */
export const PROGRAM_CONTOH = [
  { nama: "Tahfidz Al-Qur'an", ringkas: "Menghafal dan murojaah Al-Qur'an dengan target bertahap sesuai jenjang." },
  { nama: "Tahsin al-Qiraah", ringkas: "Pembelajaran makhraj dan sifat huruf agar bacaan Al-Qur'an setiap siswa tartib." },
  { nama: "Praktik Ibadah", ringkas: "Salat berjamaah, wudu, dan pembiasaan ibadah keseharian di sekolah dan rumah." },
  { nama: "Pengembangan Akademik", ringkas: "Bimbingan belajar dan pendampingan bagi siswa yang kesulitan mengikuti pelajaran." },
];

/** Ekstrakurikuler untuk blok jingga di beranda. */
export const EKSTRA_CONTOH = [
  { nama: "Pramuka", jadwal: "Sabtu, 15.00-17.00", pembina: "Bambang Setiawan, S.Pd." },
  { nama: "Futsal", jadwal: "Rabu, 15.30-17.00", pembina: "Bagus Prasetya, S.Pd." },
  { nama: "PMR", jadwal: "Jumat, 14.00-15.30", pembina: "Dewi Anggraini, S.Pd." },
  { nama: "Rohis", jadwal: "Ahad, 09.00-11.00", pembina: "Abdul Aziz, S.Ag." },
];