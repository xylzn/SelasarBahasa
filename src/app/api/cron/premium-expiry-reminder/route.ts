import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { sendPremiumExpiryReminderEmail } from '@/lib/email';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = new Date();
  const sevenDaysFromNow = new Date();
  sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
  const sixDaysFromNow = new Date();
  sixDaysFromNow.setDate(sixDaysFromNow.getDate() + 6);

  const usersToRemind = await prisma.user.findMany({
    where: {
      role: 'PREMIUM',
      premiumExpiresAt: { gte: sixDaysFromNow, lte: sevenDaysFromNow, not: null },
      reminderSentAt: null,
    },
    select: { id: true, email: true, nama: true, premiumExpiresAt: true },
  });

  for (const user of usersToRemind) {
    if (user.premiumExpiresAt) {
      await sendPremiumExpiryReminderEmail(user.email, user.nama, user.premiumExpiresAt).catch((err) => {
        console.error(`Gagal kirim reminder email ke ${user.email}:`, err);
      });
      await prisma.user.update({
        where: { id: user.id },
        data: { reminderSentAt: now },
      });
    }
  }

  return NextResponse.json({
    remindedCount: usersToRemind.length,
  });
}
