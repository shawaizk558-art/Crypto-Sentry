import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

const credentialUserSelect = {
  id: true,
  email: true,
  password_hash: true,
  name: true,
  image: true,
  two_factor_enabled: true,
  two_factor_secret: true,
  signup_2fa_completed: true,
} as const satisfies Prisma.UserSelect;

const sessionUserSelect = {
  id: true,
  email: true,
  name: true,
  image: true,
  two_factor_enabled: true,
  signup_2fa_completed: true,
} as const satisfies Prisma.UserSelect;

export type CredentialUser = Prisma.UserGetPayload<{
  select: typeof credentialUserSelect;
}>;

export type SessionUserFields = Prisma.UserGetPayload<{
  select: typeof sessionUserSelect;
}>;

export async function getUserByEmailForCredentials(
  email: string,
): Promise<CredentialUser | null> {
  return prisma.user.findUnique({
    where: { email },
    select: credentialUserSelect,
  });
}

export async function getUserSessionFieldsById(
  userId: string,
): Promise<SessionUserFields | null> {
  return prisma.user.findUnique({
    where: { id: userId },
    select: sessionUserSelect,
  });
}

/** Sign-in path (e.g. Google on login page): no mandatory sign-up 2FA. */
export async function skipMandatorySignupTwoFactor(userId: string) {
  return prisma.user.update({
    where: { id: userId },
    data: { signup_2fa_completed: true },
  });
}
