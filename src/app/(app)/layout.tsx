import { CyberBackground } from "@/components/layout/cyber-background";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { OnboardingHost } from "@/components/onboarding/onboarding-host";
import { UiDensityProvider } from "@/components/providers/ui-density-provider";
import { auth } from "@/auth";
import { getProfileAvatarUrl, getProfileName } from "@/lib/auth/profile";
import { getSessionUser } from "@/lib/auth/session";
import { getOrCreateUserSettings } from "@/lib/user/settings";
import { redirect } from "next/navigation";

// Authenticated app shell with sidebar, top bar, and onboarding.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  if (!user) {
    const session = await auth();
    if (session?.user?.id) {
      redirect("/auth/signout");
    }
    redirect("/auth/login");
  }

  const displayName = getProfileName(user);
  const avatarUrl = getProfileAvatarUrl(user);
  let uiDensity: "compact" | "expanded" = "compact";
  try {
    uiDensity = (await getOrCreateUserSettings(user.id)).ui_density;
  } catch {
    uiDensity = "compact";
  }

  return (
    <UiDensityProvider initialDensity={uiDensity}>
    <div className="app-shell relative min-h-screen bg-bg-deep">
      <CyberBackground />
      <Sidebar user={{ email: user.email ?? "", name: displayName, avatarUrl }} />
      <div className="relative flex min-h-screen min-w-0 flex-col">
        <TopBar name={displayName} avatarUrl={avatarUrl} />
        <main className="min-w-0 flex-1 w-full">{children}</main>
      </div>
      <OnboardingHost showInduction={!user.onboarding_completed} />
    </div>
    </UiDensityProvider>
  );
}
