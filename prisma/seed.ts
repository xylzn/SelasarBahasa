import { PrismaClient, MateriTipe, KelasLevel } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // 1. Seed Admin User
  const adminPasswordHash = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@selasarbahasa.com' },
    update: {},
    create: {
      nama: 'Admin Selasar',
      email: 'admin@selasarbahasa.com',
      passwordHash: adminPasswordHash,
      role: 'ADMIN'
    }
  })
  console.log('✅ Admin user created:', adminUser.email)

  // 2. Seed Articles
  const article1 = await prisma.article.upsert({
    where: { slug: 'belajar-bahasa-inggris-mudah' },
    update: {},
    create: {
      judul: '5 Tips Belajar Bahasa Inggris dengan Mudah dan Efektif',
      slug: 'belajar-bahasa-inggris-mudah',
      ringkasan: 'Pelajari tips praktis untuk menguasai bahasa Inggris dengan cepat tanpa rasa bosan, mulai dari kebiasaan harian hingga sumber belajar terbaik.',
      konten: '<p>Bahasa Inggris adalah bahasa internasional yang penting untuk dikuasai di era globalisasi ini. Berikut adalah 5 tips mudah untuk mempelajarinya:</p><ol><li><strong>Dengarkan podcast atau lagu Inggris setiap hari:</strong> Mulai dengan konten yang sesuai dengan levelmu.</li><li><strong>Baca artikel atau buku sederhana:</strong> Mulai dari cerita anak atau artikel ringan.</li><li><strong>Latihan bicara meskipun sendirian:</strong> Berbicara di depan cermin atau gunakan aplikasi voice recorder.</li><li><strong>Gunakan aplikasi pembelajaran:</strong> Ada banyak aplikasi gratis yang membantu latihan grammar dan kosakata.</li><li><strong>Jangan takut salah:</strong> Kesalahan adalah bagian dari proses belajar.</li></ol>',
      thumbnailUrl: null,
      metaTitle: 'Tips Belajar Bahasa Inggris Mudah dan Efektif | Selasar Bahasa',
      metaDescription: 'Pelajari 5 tips praktis untuk menguasai bahasa Inggris dengan cepat dan menyenangkan bersama Selasar Bahasa.',
      ogImageUrl: null,
      kategori: 'Bahasa Inggris',
      published: true,
      publishedAt: new Date()
    }
  })

  const article2 = await prisma.article.upsert({
    where: { slug: 'pentingnya-bahasa-jepang-di-era-digital' },
    update: {},
    create: {
      judul: 'Mengapa Bahasa Jepang Penting di Era Digital Saat Ini?',
      slug: 'pentingnya-bahasa-jepang-di-era-digital',
      ringkasan: 'Temukan alasan mengapa mempelajari bahasa Jepang bisa menjadi investasi besar untuk karir dan pengembangan pribadi kamu.',
      konten: '<p>Bahasa Jepang bukan hanya tentang anime dan manga. Di era digital ini, banyak perusahaan teknologi Jepang yang menjadi pemimpin global.</p>',
      thumbnailUrl: null,
      metaTitle: null,
      metaDescription: null,
      ogImageUrl: null,
      kategori: 'Bahasa Jepang',
      published: false
    }
  })
  console.log('✅ Articles created:', [article1.judul, article2.judul])

  // 3. Seed Packages
  const package1 = await prisma.package.upsert({
    where: { id: 'pkg-basic' },
    update: {},
    create: {
      id: 'pkg-basic',
      nama: 'Paket Basic',
      deskripsi: 'Paket untuk pemula yang ingin memulai perjalanan belajar bahasa.',
      harga: 99000,
      fiturList: ['10 Materi Teks', '5 Quiz', 'Akses 1 Bulan'],
      isPopuler: false,
      urutan: 1
    }
  })

  const package2 = await prisma.package.upsert({
    where: { id: 'pkg-premium' },
    update: {},
    create: {
      id: 'pkg-premium',
      nama: 'Paket Premium',
      deskripsi: 'Paket lengkap dengan materi video dan quiz unlimited.',
      harga: 299000,
      fiturList: ['Semua Materi (Teks & Video)', 'Unlimited Quiz', 'Akses 3 Bulan', 'Dukungan Mentor'],
      isPopuler: true,
      urutan: 2
    }
  })
  console.log('✅ Packages created:', [package1.nama, package2.nama])

  // 4. Seed Materi
  const materis: Array<{
    judul: string
    slug: string
    tipe: MateriTipe
    kelas: KelasLevel
    kontenTeks: string | null
    videoUrl: string | null
    videoProvider: 'YOUTUBE' | 'VIMEO' | null
    isPremium: boolean
    urutan: number
  }> = [
    // TEKS - FREE
    {
      judul: 'Pengantar Tenses Bahasa Inggris',
      slug: 'pengantar-tenses-inggris',
      tipe: 'TEKS',
      kelas: 'DASAR',
      kontenTeks: '<p>Tenses adalah bentuk kata kerja yang menunjukkan waktu terjadinya suatu peristiwa. Ada 16 tenses dalam bahasa Inggris, tapi kita akan pelajari yang paling dasar dulu: Present Simple, Present Continuous, Past Simple, dan Future Simple.</p>',
      videoUrl: null,
      videoProvider: null,
      isPremium: false,
      urutan: 1
    },
    {
      judul: 'Vocabulary Sehari-hari Bahasa Inggris',
      slug: 'vocabulary-sehari-hari-inggris',
      tipe: 'TEKS',
      kelas: 'DASAR',
      kontenTeks: '<p>Pelajari kosakata bahasa Inggris yang sering digunakan dalam percakapan sehari-hari:</p><ul><li>House - Rumah</li><li>School - Sekolah</li><li>Friend - Teman</li><li>Food - Makanan</li></ul>',
      videoUrl: null,
      videoProvider: null,
      isPremium: false,
      urutan: 2
    },
    // TEKS - PREMIUM
    {
      judul: 'Present Perfect Tenses',
      slug: 'present-perfect-tenses',
      tipe: 'TEKS',
      kelas: 'DASAR',
      kontenTeks: '<p>Present Perfect Tense digunakan untuk menyatakan aksi yang terjadi pada waktu yang tidak jelas di lampau, tapi masih ada hubungan dengan sekarang.</p>',
      videoUrl: null,
      videoProvider: null,
      isPremium: true,
      urutan: 3
    },
    {
      judul: 'Past Continuous Tenses',
      slug: 'past-continuous-tenses',
      tipe: 'TEKS',
      kelas: 'DASAR',
      kontenTeks: '<p>Past Continuous Tense digunakan untuk menyatakan aksi yang sedang berlangsung pada waktu tertentu di lampau.</p>',
      videoUrl: null,
      videoProvider: null,
      isPremium: true,
      urutan: 4
    },
    {
      judul: 'Future Perfect Tenses',
      slug: 'future-perfect-tenses',
      tipe: 'TEKS',
      kelas: 'DASAR',
      kontenTeks: '<p>Future Perfect Tense digunakan untuk menyatakan aksi yang akan selesai di waktu tertentu di masa depan.</p>',
      videoUrl: null,
      videoProvider: null,
      isPremium: true,
      urutan: 5
    },
    // VIDEO - FREE
    {
      judul: 'Cara Memperkenalkan Diri dalam Bahasa Jepang',
      slug: 'cara-memperkenalkan-diri-jepang',
      tipe: 'VIDEO',
      kelas: 'DASAR',
      kontenTeks: null,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoProvider: 'YOUTUBE',
      isPremium: false,
      urutan: 1
    },
    {
      judul: 'Pengucapan Dasar Bahasa Jepang',
      slug: 'pengucapan-dasar-jepang',
      tipe: 'VIDEO',
      kelas: 'DASAR',
      kontenTeks: null,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoProvider: 'YOUTUBE',
      isPremium: false,
      urutan: 2
    },
    // VIDEO - PREMIUM
    {
      judul: 'Percakapan di Restoran Bahasa Jepang',
      slug: 'percakapan-restoran-jepang',
      tipe: 'VIDEO',
      kelas: 'DASAR',
      kontenTeks: null,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoProvider: 'YOUTUBE',
      isPremium: true,
      urutan: 3
    },
    {
      judul: 'Tata Bahasa Dasar Bahasa Jepang',
      slug: 'tata-bahasa-dasar-jepang',
      tipe: 'VIDEO',
      kelas: 'DASAR',
      kontenTeks: null,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoProvider: 'YOUTUBE',
      isPremium: true,
      urutan: 4
    },
    {
      judul: 'Berbicara di Tempat Kerja Bahasa Jepang',
      slug: 'berbicara-tempat-kerja-jepang',
      tipe: 'VIDEO',
      kelas: 'DASAR',
      kontenTeks: null,
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      videoProvider: 'YOUTUBE',
      isPremium: true,
      urutan: 5
    }
  ]

  for (const materi of materis) {
    await prisma.materi.upsert({
      where: { slug: materi.slug },
      update: {},
      create: materi
    })
  }
  console.log('✅ Materi created:', materis.map(m => m.judul))

  // 5. Seed Quiz
  const quiz1 = await prisma.quiz.upsert({
    where: { id: 'quiz-tenses-dasar' },
    update: {},
    create: {
      id: 'quiz-tenses-dasar',
      judul: 'Quiz Tenses Dasar',
      deskripsi: 'Uji pemahamanmu tentang tenses dasar bahasa Inggris!',
      isPremium: false,
      questions: {
        create: [
          {
            pertanyaan: 'Manakah kalimat Present Simple yang benar?',
            urutan: 1,
            options: {
              create: [
                { teks: 'She go to school', isCorrect: false },
                { teks: 'She goes to school', isCorrect: true },
                { teks: 'She going to school', isCorrect: false },
                { teks: 'She is go to school', isCorrect: false }
              ]
            }
          },
          {
            pertanyaan: '"I am eating" adalah bentuk tenses apa?',
            urutan: 2,
            options: {
              create: [
                { teks: 'Present Simple', isCorrect: false },
                { teks: 'Present Continuous', isCorrect: true },
                { teks: 'Past Simple', isCorrect: false },
                { teks: 'Future Simple', isCorrect: false }
              ]
            }
          },
          {
            pertanyaan: ' bentuk Past Simple dari "go"?',
            urutan: 3,
            options: {
              create: [
                { teks: 'goed', isCorrect: false },
                { teks: 'gone', isCorrect: false },
                { teks: 'went', isCorrect: true },
                { teks: 'going', isCorrect: false }
              ]
            }
          }
        ]
      }
    }
  })

  const quiz2 = await prisma.quiz.upsert({
    where: { id: 'quiz-jepang-dasar' },
    update: {},
    create: {
      id: 'quiz-jepang-dasar',
      judul: 'Quiz Bahasa Jepang Dasar',
      deskripsi: 'Uji pemahamanmu tentang bahasa Jepang dasar!',
      isPremium: true,
      questions: {
        create: [
          {
            pertanyaan: 'Apa arti "Konnichiwa"?',
            urutan: 1,
            options: {
              create: [
                { teks: 'Selamat malam', isCorrect: false },
                { teks: 'Selamat siang', isCorrect: true },
                { teks: 'Selamat pagi', isCorrect: false },
                { teks: 'Terima kasih', isCorrect: false }
              ]
            }
          }
        ]
      }
    }
  })

  console.log('✅ Quiz created:', [quiz1.judul, quiz2.judul])

  console.log('🎉 Seeding completed!')
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
