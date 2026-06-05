import { CyberBackground } from "@/components/layout/cyber-background";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { getProfileAvatarUrl, getProfileName } from "@/lib/auth/profile";
import { getSessionUser } from "@/lib/supabase/session";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  const displayName = user ? getProfileName(user) : "Operative";
  const avatarUrl = user ? getProfileAvatarUrl(user) : null;

  return (
    <div className="relative min-h-screen bg-bg-deep pl-[240px]">
      <CyberBackground />
      <Sidebar
        user={
          user
            ? { email: user.email ?? "", name: displayName, avatarUrl }
            : null
        }
      />
      <div className="relative flex min-h-screen min-w-0 flex-col">
        <TopBar name={displayName} avatarUrl={avatarUrl} />
        <main className="min-w-0 flex-1 w-full">{children}</main>
      </div>
    </div>
  );
}
