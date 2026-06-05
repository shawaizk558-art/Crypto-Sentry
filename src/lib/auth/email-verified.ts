import type { User } from "@supabase/supabase-js";

export const EMAIL_VERIFIED_METADATA_KEY = "email_verified_app";

/** True when the user authenticated via Google OAuth. */
export function isGoogleAuthUser(user: User | null | undefined): boolean {
  if (!user) return false;
  return (
    user.app_metadata?.provider === "google" ||
    user.identities?.some((identity) => identity.provider === "google") === true
  );
}

/** Email/password signups must complete OTP; Google sign-in skips this gate. */
export function isAppEmailVerified(user: User | null | undefined): boolean {
  if (!user) return false;
  if (isGoogleAuthUser(user)) return true;
  return user.user_metadata?.[EMAIL_VERIFIED_METADATA_KEY] === true;
}

export function needsAppEmailVerification(user: User): boolean {
  return !isAppEmailVerified(user);
}
