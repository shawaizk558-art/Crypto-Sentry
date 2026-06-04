import NextAuth from "next-auth";

/** Lightweight auth for middleware only (no Prisma / Node crypto). */
export const { auth } = NextAuth({
  trustHost: true,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
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
});
