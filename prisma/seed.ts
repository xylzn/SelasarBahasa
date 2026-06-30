import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // 1. Seed Admin User
  const adminPassword = await bcrypt.hash('admin123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@selasarbahasa.com' },
    update: {},
    create: {
      nama: 'Admin Selasar',
      email: 'admin@selasarbahasa.com',
      password: adminPassword,
      role: 'ADMIN'
    }
  })
  console.log('✅ Admin user created:', adminUser.email)

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
