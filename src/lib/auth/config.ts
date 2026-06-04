import { PrismaAdapter } from "@auth/prisma-adapter";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { verifyPassword } from "@/lib/auth/password";
import { verifyTotpCode } from "@/lib/auth/totp";
import { prisma } from "@/lib/db/prisma";
import {
  getUserByEmailForCredentials,
  getUserSessionFieldsById,
} from "@/lib/db/user";

export const authConfig = {
  trustHost: true,
  pages: {
    signIn: "/auth/login",
    newUser: "/auth/signup",
    error: "/auth/error",
  },
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  providers: [
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID.trim(),
            clientSecret: process.env.GOOGLE_CLIENT_SECRET.trim(),
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      id: "credentials",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        totpCode: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.toString().toLowerCase().trim();
        const password = credentials?.password?.toString();
        const totpCode = credentials?.totpCode?.toString();

        if (!email || !password) return null;

        const user = await getUserByEmailForCredentials(email);
        if (!user?.password_hash) return null;

        const valid = await verifyPassword(password, user.password_hash);
        if (!valid) return null;

        if (user.two_factor_enabled && user.two_factor_secret) {
          if (!totpCode) {
            throw new Error("2FA_REQUIRED");
          }
          const ok = verifyTotpCode(user.two_factor_secret, totpCode);
          if (!ok) return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          twoFactorEnabled: user.two_factor_enabled,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user?.id) {
        const dbUser = await getUserSessionFieldsById(user.id);
        if (dbUser) {
          token.id = dbUser.id;
          token.twoFactorEnabled = dbUser.two_factor_enabled;
          token.signup2FACompleted = dbUser.signup_2fa_completed;
          token.is2FAVerified = !dbUser.two_factor_enabled;
          token.name = dbUser.name;
          token.email = dbUser.email;
          token.picture = dbUser.image;
        }
      }

      if (trigger === "update") {
        const patch = session as {
          is2FAVerified?: boolean;
          signup2FACompleted?: boolean;
          twoFactorEnabled?: boolean;
          name?: string;
          image?: string | null;
        };
        if (patch?.signup2FACompleted === true) {
          token.signup2FACompleted = true;
        }
        if (patch?.is2FAVerified === true) {
          token.is2FAVerified = true;
        }
        if (patch?.twoFactorEnabled === true) {
          token.twoFactorEnabled = true;
          token.is2FAVerified = true;
        }
        if (typeof patch?.name === "string") {
          token.name = patch.name;
        }
        if (patch?.image !== undefined) {
          token.picture = patch.image ?? undefined;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.twoFactorEnabled = Boolean(token.twoFactorEnabled);
        session.user.signup2FACompleted = Boolean(token.signup2FACompleted);
        session.user.is2FAVerified = Boolean(token.is2FAVerified);
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
