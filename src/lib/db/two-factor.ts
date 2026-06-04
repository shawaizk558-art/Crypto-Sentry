import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const twoFactorStateSelect = {
  two_factor_enabled: true,
  two_factor_secret: true,
  signup_2fa_completed: true,
} as const satisfies Prisma.UserSelect;

export type TwoFactorState = {
  two_factor_enabled: boolean;
  two_factor_secret: string | null;
  signup_2fa_completed: boolean;
};

/** Save TOTP secret after mandatory sign-up setup (login 2FA stays off). */
export async function completeSignupTwoFactor(
  userId: string,
  encryptedSecret: string,
) {
  const data: Prisma.UserUncheckedUpdateInput = {
    two_factor_secret: encryptedSecret,
    signup_2fa_completed: true,
    two_factor_enabled: false,
  };

  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

/** Turn on 2FA for every sign-in (user must already have a TOTP secret). */
export async function enableLoginTwoFactor(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { two_factor_secret: true, signup_2fa_completed: true },
  });

  if (!user?.signup_2fa_completed || !user.two_factor_secret) {
    throw new Error("Complete sign-up 2FA before enabling login 2FA");
  }

  return prisma.user.update({
    where: { id: userId },
    data: { two_factor_enabled: true },
  });
}

/** Settings: new secret + require 2FA on sign-in. */
export async function enableLoginTwoFactorWithSecret(
  userId: string,
  encryptedSecret: string,
) {
  const data: Prisma.UserUncheckedUpdateInput = {
    two_factor_enabled: true,
    two_factor_secret: encryptedSecret,
    signup_2fa_completed: true,
  };

  return prisma.user.update({
    where: { id: userId },
    data,
  });
}

export async function getTwoFactorState(
  userId: string,
): Promise<TwoFactorState | null> {
  const row = await prisma.user.findUnique({
    where: { id: userId },
    select: twoFactorStateSelect,
  });

  if (!row) return null;

  return {
    two_factor_enabled: row.two_factor_enabled,
    two_factor_secret: row.two_factor_secret,
    signup_2fa_completed: row.signup_2fa_completed,
  };
}
