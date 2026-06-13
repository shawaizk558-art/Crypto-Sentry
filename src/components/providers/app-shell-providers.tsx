"use client";

import type { UserSettingsData } from "@/lib/user/settings";
import { AppUserProvider, type AppUser } from "@/components/providers/app-user-provider";
import { AlertsUnreadProvider } from "@/components/providers/alerts-unread-provider";
import { LivePricesProvider } from "@/components/providers/live-prices-provider";
import { UserSettingsProvider } from "@/components/providers/user-settings-provider";
import type { ReactNode } from "react";

// Client providers that must survive route changes inside the app shell.
export function AppShellProviders({
  user,
  settings,
  children,
}: {
  user: AppUser;
  settings: UserSettingsData;
  children: ReactNode;
}) {
  return (
    <AppUserProvider user={user}>
      <UserSettingsProvider settings={settings}>
        <LivePricesProvider>
          <AlertsUnreadProvider>{children}</AlertsUnreadProvider>
        </LivePricesProvider>
      </UserSettingsProvider>
    </AppUserProvider>
  );
}
