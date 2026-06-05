import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
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
