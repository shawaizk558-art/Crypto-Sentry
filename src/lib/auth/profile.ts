import type { SessionUser } from "@/types/auth";

// Name to show on screen (from name or email).
export function getProfileName(user: SessionUser): string {
  return user.name ?? user.email.split("@")[0] ?? "Operative";
}

// Profile picture URL, or null if none uploaded.
export function getProfileAvatarUrl(user: SessionUser): string | null {
  return user.image && user.image.length > 0 ? user.image : null;
}
