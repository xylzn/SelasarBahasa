import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const materi = await prisma.materi.findMany({ take: 10 });
  console.log('Materi sample:', JSON.stringify(materi, null, 2));

  const enumCheck = await prisma.$queryRaw`
    SELECT enumlabel FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'MateriTipe')
  `;
  console.log('MateriTipe enum values:', enumCheck);

  const kelasEnumCheck = await prisma.$queryRaw`
    SELECT enumlabel FROM pg_enum 
    WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'KelasLevel')
  `;
  console.log('KelasLevel enum values:', kelasEnumCheck);
}

main().finally(() => prisma.$disconnect());