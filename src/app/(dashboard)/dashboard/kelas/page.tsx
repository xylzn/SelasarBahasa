import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import KelasListClient from '@/components/dashboard/KelasListClient';
import { hasActivePremiumAccess } from '@/lib/access';

export default async function KelasPage() {
  const session = await auth();
  const userCanAccessPremium = hasActivePremiumAccess({
    role: session?.user?.role || 'USER',
    premiumExpiresAt: session?.user?.premiumExpiresAt ? new Date(session.user.premiumExpiresAt) : null,
  });

  const totalMateri = await prisma.materi.count({
    where: { published: true }
  });

  return <KelasListClient userCanAccessPremium={userCanAccessPremium} totalMateri={totalMateri} />;
}
