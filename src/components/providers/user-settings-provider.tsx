"use client";

import type { UserSettingsData } from "@/lib/user/settings";
import { createContext, useContext, type ReactNode } from "react";

const UserSettingsContext = createContext<UserSettingsData | null>(null);

export function UserSettingsProvider({
  settings,
  children,
}: {
  settings: UserSettingsData;
  children: ReactNode;
}) {
  return (
    <UserSettingsContext.Provider value={settings}>
      {children}
    </UserSettingsContext.Provider>
  );
}

export function useInitialUserSettings() {
  return useContext(UserSettingsContext);
}
