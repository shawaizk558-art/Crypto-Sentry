/** Upload and resolve profile avatar images (stored in PostgreSQL). */

import "server-only";

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";

export function avatarApiPath(userId: string): string {
  return `/api/avatars/${userId}`;
}

// Profile picture URL for display, or null if none set.
export function resolveAvatarUrl(url: string | null | undefined): string | null {
  if (!url || url.length === 0) return null;
  return url;
}

// Save avatar bytes on the user row and return a cache-busted API URL.
export async function saveAvatarToDatabase(
  userId: string,
  buffer: Buffer,
  contentType: string,
): Promise<string> {
  const path = avatarApiPath(userId);
  const data: Prisma.UserUpdateInput = {
    avatar_data: new Uint8Array(buffer),
    avatar_mime: contentType,
    image: path,
  };
  await prisma.user.update({ where: { id: userId }, data });
  return `${path}?t=${Date.now()}`;
}
