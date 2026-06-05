import { ProfileView } from "@/components/profile/profile-view";
import { getProfileAvatarUrl, getProfileName } from "@/lib/auth/profile";
import { getSessionUser } from "@/lib/auth/session";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getSessionUser();
  if (!user) redirect("/auth/login");

  return (
    <ProfileView
      email={user.email ?? ""}
      name={getProfileName(user)}
      avatarUrl={getProfileAvatarUrl(user)}
      userId={user.id}
      createdAt={user.created_at.toISOString()}
    />
  );
}
