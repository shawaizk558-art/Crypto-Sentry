"use client";

import { signOut, useSession } from "next-auth/react";
import { useEffect, useRef } from "react";

/**
 * If the user has a half-finished sign-up session, sign them out on login/sign-up
 * so they always see the form first (2FA only runs right after sign-up).
 */
export function ClearStaleAuthSession() {
  const { data: session, status } = useSession();
  const cleared = useRef(false);

  useEffect(() => {
    if (status !== "authenticated" || cleared.current) return;
    if (!session?.user?.signup2FACompleted) {
      cleared.current = true;
      void signOut({ redirect: false });
    }
  }, [session, status]);

  return null;
}
