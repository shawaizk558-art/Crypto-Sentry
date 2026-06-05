import type { SessionUser } from "@/types/auth";

export function getProfileName(user: SessionUser): string {
  return user.name ?? user.email.split("@")[0] ?? "Operative";
}

export function getProfileAvatarUrl(user: SessionUser): string | null {
  return user.image && user.image.length > 0 ? user.image : null;
}
