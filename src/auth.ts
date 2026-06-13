import { PrismaAdapter } from "@auth/prisma-adapter";
import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { cookies } from "next/headers";
import { authConfig } from "@/auth.config";
import {
  consumeVerificationToken,
  createAndSendVerificationEmail,
} from "@/lib/auth/email-verification";
import { OAUTH_INTENT_COOKIE } from "@/lib/auth/oauth-intent";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
      verificationToken: { label: "Verification token", type: "text" },
    },
    async authorize(credentials) {
      const verificationToken = credentials?.verificationToken?.toString().trim();
      if (verificationToken) {
        return consumeVerificationToken(verificationToken);
      }

      const email = credentials?.email?.toString().trim().toLowerCase();
      const password = credentials?.password?.toString();

      if (!email || !password) return null;

      const user = await prisma.user.findUnique({ where: { email } });
      if (!user?.password_hash) return null;

      const valid = await verifyPassword(password, user.password_hash);
      if (!valid) return null;

      if (!user.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      };
    },
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers,
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      const email = user.email?.trim().toLowerCase();
      if (!email) {
        return false;
      }

      const cookieStore = await cookies();
      const intent = cookieStore.get(OAUTH_INTENT_COOKIE)?.value === "signup" ? "signup" : "login";
      cookieStore.delete(OAUTH_INTENT_COOKIE);

      const existing = await prisma.user.findUnique({ where: { email } });

      if (intent === "signup") {
        if (existing) {
          return "/auth/signup?error=AlreadyRegistered";
        }
        return true;
      }

      if (!existing) {
        return "/auth/login?error=NoAccount";
      }

      return true;
    },
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.id = user.id;
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { emailVerified: true },
        });
        token.hasVerifiedEmail = dbUser?.emailVerified != null;
      } else if (trigger === "update" && typeof token.id === "string") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
          select: { emailVerified: true },
        });
        token.hasVerifiedEmail = dbUser?.emailVerified != null;
      }
      return token;
    },
  },
  events: {
    async signIn({ user, account, isNewUser }) {
      if (account?.provider !== "google" || !user.id) return;

      if (isNewUser && user.email) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: null },
        });
        await createAndSendVerificationEmail(user.id, user.email);
        return;
      }

      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: { emailVerified: true },
      });
      if (!dbUser?.emailVerified) {
        await prisma.user.update({
          where: { id: user.id },
          data: { emailVerified: new Date() },
        });
      }
    },
  },
});
