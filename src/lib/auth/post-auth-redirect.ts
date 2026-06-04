import type { Session } from "next-auth";

export type AuthIntent = "login" | "signup";

/** Where to send the user after email/password sign-in or sign-up (no QR). */
export function getPostAuthPath(
  session: Session | null,
  intent: AuthIntent,
): string {
  if (!session?.user) return "/auth/login";

  const { twoFactorEnabled, is2FAVerified } = session.user;

  if (twoFactorEnabled && !is2FAVerified) {
    return "/auth/2fa/verify";
  }

  return "/";
}
