import { UserRole } from "@prisma/client";

interface UserWithPremium {
  role: UserRole;
  premiumExpiresAt: Date | string | null;
}

export function hasActivePremiumAccess(user: UserWithPremium): boolean {
  if (user.role === "ADMIN") return true;
  if (user.role !== "PREMIUM") return false;
  if (!user.premiumExpiresAt) return false;
  return new Date(user.premiumExpiresAt) > new Date();
}
