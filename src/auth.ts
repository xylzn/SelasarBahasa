import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import prisma from './lib/prisma';
import bcrypt from 'bcryptjs';
import type { User, Session } from 'next-auth';

const config = {
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user) {
          return null;
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!passwordMatch) {
          return null;
        }

        return {
          id: user.id,
          nama: user.nama,
          email: user.email,
          role: user.role,
          fotoProfil: user.fotoProfil,
          premiumExpiresAt: user.premiumExpiresAt?.toISOString() || null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger }: { token: any; user?: User; trigger?: string }) {
      if (user) {
        token.id = user.id;
        token.nama = (user as any).nama;
        token.role = (user as any).role;
        token.fotoProfil = (user as any).fotoProfil || null;
        token.premiumExpiresAt = (user as any).premiumExpiresAt || null;
      }

      if (trigger === 'update') {
        const freshUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { nama: true, role: true, fotoProfil: true, premiumExpiresAt: true },
        });
        if (freshUser) {
          token.nama = freshUser.nama;
          token.role = freshUser.role;
          token.fotoProfil = freshUser.fotoProfil || null;
          token.premiumExpiresAt = freshUser.premiumExpiresAt?.toISOString() || null;
        }
      }

      return token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).nama = token.nama;
        (session.user as any).role = token.role;
        (session.user as any).fotoProfil = token.fotoProfil || null;
        (session.user as any).premiumExpiresAt = token.premiumExpiresAt || null;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  events: {
    async signIn({ user }: { user?: User }) {
      if (user?.id) {
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date(), warningSentAt: null },
        });
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
