import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Starting database cleanup...\n')

  // Step 1: Count current data
  console.log('📊 Current data count:')
  const counts = await Promise.all([
    prisma.article.count().then(c => ({ table: 'Article', count: c })),
    prisma.package.count().then(c => ({ table: 'Package', count: c })),
    prisma.contactMessage.count().then(c => ({ table: 'ContactMessage', count: c })),
    prisma.materi.count().then(c => ({ table: 'Materi', count: c })),
    prisma.quiz.count().then(c => ({ table: 'Quiz', count: c })),
    prisma.quizAttempt.count().then(c => ({ table: 'QuizAttempt', count: c })),
  ])
  
  counts.forEach(({ table, count }) => {
    console.log(`  - ${table}: ${count}`)
  })
  console.log()

  // Step 2: Confirmation (we'll proceed automatically since it's a script)
  console.log('⚠️  Deleting all content data (keeping users)...')

  // Step 3: Delete data in correct order (due to foreign keys)
  await prisma.quizAttempt.deleteMany({})
  console.log('✅ QuizAttempt deleted')

  await prisma.tugasSubmissionFile.deleteMany({})
  console.log('✅ TugasSubmissionFile deleted')

  await prisma.tugasSubmission.deleteMany({})
  console.log('✅ TugasSubmission deleted')

  await prisma.tugas.deleteMany({})
  console.log('✅ Tugas deleted')

  await prisma.pertanyaan.deleteMany({})
  console.log('✅ Pertanyaan deleted')

  await prisma.quiz.deleteMany({})
  console.log('✅ Quiz deleted')

  await prisma.materi.deleteMany({})
  console.log('✅ Materi deleted')

  await prisma.contactMessage.deleteMany({})
  console.log('✅ ContactMessage deleted')

  await prisma.package.deleteMany({})
  console.log('✅ Package deleted')

  await prisma.article.deleteMany({})
  console.log('✅ Article deleted')

  console.log('\n🎉 Database cleanup completed!')
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
