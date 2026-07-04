import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendAccountDeletedEmail, sendAccountWarningEmail } from '@/lib/email';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  
  // 5.5 months ago (for warnings)
  const fiveAndHalfMonthsAgo = new Date();
  fiveAndHalfMonthsAgo.setMonth(fiveAndHalfMonthsAgo.getMonth() - 5);
  fiveAndHalfMonthsAgo.setDate(fiveAndHalfMonthsAgo.getDate() - 15);
  
  // 6 months ago (for deletion)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Step 1: Send warnings to users inactive for 5.5 months, not yet warned
  const usersToWarn = await prisma.user.findMany({
    where: {
      role: 'USER',
      lastLoginAt: { lt: fiveAndHalfMonthsAgo, not: null },
      warningSentAt: null,
    },
    select: { id: true, email: true, nama: true },
  });

  for (const user of usersToWarn) {
    await sendAccountWarningEmail(user.email, user.nama).catch((err) => {
      console.error(`Gagal kirim warning email ke ${user.email}:`, err);
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { warningSentAt: now },
    });
  }

  // Step 2: Delete users inactive for 6+ months AND already warned
  const usersToDelete = await prisma.user.findMany({
    where: {
      role: 'USER',
      lastLoginAt: { lt: sixMonthsAgo, not: null },
      warningSentAt: { not: null },
    },
    select: { id: true, email: true, nama: true },
  });

  for (const user of usersToDelete) {
    await prisma.user.delete({ where: { id: user.id } });
    await sendAccountDeletedEmail(user.email, user.nama, 'inactive').catch((err) => {
      console.error(`Gagal kirim delete email ke ${user.email}:`, err);
    });
  }

  return NextResponse.json({
    warnedCount: usersToWarn.length,
    deletedCount: usersToDelete.length,
  });
}