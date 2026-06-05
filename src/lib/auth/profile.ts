import type { User } from "@supabase/supabase-js";

export const AVATAR_BUCKET = "avatars";

export function getProfileName(user: User): string {
  return (
    (user.user_metadata?.full_name as string | undefined) ??
    user.email?.split("@")[0] ??
    "Operative"
  );
}

export function getProfileAvatarUrl(user: User): string | null {
  const url = user.user_metadata?.avatar_url;
  return typeof url === "string" && url.length > 0 ? url : null;
}
