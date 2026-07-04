import { UserRole } from "@prisma/client";

interface UserWithPremium {
  role: UserRole;
  premiumExpiresAt: Date | string | null;
}

export function hasActivePremiumAccess(user: UserWithPremium): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role !== "PREMIUM") return false;
  // Jika role PREMIUM dan tidak ada batas waktu, berarti unlimited
  if (!user.premiumExpiresAt) return true;
  return new Date(user.premiumExpiresAt) > new Date();
}
