import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      hasVerifiedEmail?: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    hasVerifiedEmail?: boolean;
  }
}

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  onboarding_completed: boolean;
  created_at: Date;
};
