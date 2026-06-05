import { CyberBackground } from "@/components/layout/cyber-background";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { OnboardingHost } from "@/components/onboarding/onboarding-host";
import { UiDensityProvider } from "@/components/providers/ui-density-provider";
import { getProfileAvatarUrl, getProfileName } from "@/lib/auth/profile";
import { getSessionUser } from "@/lib/auth/session";
import { getOrCreateUserSettings } from "@/lib/user/settings";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();

  const displayName = user ? getProfileName(user) : "Operative";
  const avatarUrl = user ? getProfileAvatarUrl(user) : null;
  let uiDensity: "compact" | "expanded" = "compact";
  if (user) {
    try {
      uiDensity = (await getOrCreateUserSettings(user.id)).ui_density;
    } catch {
      uiDensity = "compact";
    }
  }

  return (
    <UiDensityProvider initialDensity={uiDensity}>
    <div className="app-shell relative min-h-screen bg-bg-deep">
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
      {user && (
        <OnboardingHost showInduction={!user.onboarding_completed} />
      )}
    </div>
    </UiDensityProvider>
  );
}
