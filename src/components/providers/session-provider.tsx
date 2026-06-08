"use client";

import { SessionProvider } from "next-auth/react";

// Wraps the app with NextAuth session context for client components.
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
