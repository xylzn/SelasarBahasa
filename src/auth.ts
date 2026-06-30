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
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user?: User }) {
      if (user) {
        token.id = user.id;
        token.nama = (user as any).nama;
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).nama = token.nama;
        (session.user as any).role = token.role;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
