import { AppContentRouter } from "@/components/layout/app-content-router";
import { CyberBackground } from "@/components/layout/cyber-background";
import { NavigationProgress } from "@/components/layout/navigation-progress";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { OnboardingHost } from "@/components/onboarding/onboarding-host";
import { AppShellProviders } from "@/components/providers/app-shell-providers";
import { UiDensityProvider } from "@/components/providers/ui-density-provider";
import { auth } from "@/auth";
import { getProfileAvatarUrl, getProfileName } from "@/lib/auth/profile";
import { getSessionUser } from "@/lib/auth/session";
import {
  DEFAULT_USER_SETTINGS,
  getOrCreateUserSettings,
} from "@/lib/user/settings";
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
  const settings = await getOrCreateUserSettings(user.id).catch(
    () => DEFAULT_USER_SETTINGS,
  );

  return (
    <UiDensityProvider initialDensity={settings.ui_density}>
      <AppShellProviders
        user={{
          email: user.email ?? "",
          name: displayName,
          avatarUrl,
          userId: user.id,
          createdAt: user.created_at.toISOString(),
        }}
        settings={settings}
      >
        <div className="app-shell relative min-h-screen bg-bg-deep">
          <CyberBackground />
          <Sidebar user={{ email: user.email ?? "", name: displayName, avatarUrl }} />
          <div className="relative flex min-h-screen min-w-0 flex-col">
            <NavigationProgress />
            <TopBar name={displayName} avatarUrl={avatarUrl} />
            <main className="min-w-0 flex-1 w-full">
              <div className="route-page min-h-full">
                <AppContentRouter />
              </div>
              <div className="hidden" aria-hidden>
                {children}
              </div>
            </main>
          </div>
          <OnboardingHost showInduction={!user.onboarding_completed} />
        </div>
      </AppShellProviders>
    </UiDensityProvider>
  );
}
