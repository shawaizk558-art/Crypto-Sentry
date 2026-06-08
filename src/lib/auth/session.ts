import "server-only";

import { auth } from "@/auth";
import { prisma } from "@/lib/db/prisma";
import type { SessionUser } from "@/types/auth";

// Get the logged-in user, or null if nobody is signed in.
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await auth();
  if (!session?.user?.id) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      image: true,
      onboarding_completed: true,
      created_at: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
    onboarding_completed: user.onboarding_completed,
    created_at: user.created_at,
  };
}

// Get the logged-in user, or throw "Unauthorized" if not signed in.
export async function requireSessionUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}
