"use client";

import { createContext, useContext, type ReactNode } from "react";

export type AppUser = {
  email: string;
  name: string;
  avatarUrl: string | null;
  userId: string;
  createdAt: string;
};

const AppUserContext = createContext<AppUser | null>(null);

export function AppUserProvider({
  user,
  children,
}: {
  user: AppUser;
  children: ReactNode;
}) {
  return (
    <AppUserContext.Provider value={user}>{children}</AppUserContext.Provider>
  );
}

export function useAppUser() {
  const user = useContext(AppUserContext);
  if (!user) {
    throw new Error("useAppUser must be used within AppUserProvider");
  }
  return user;
}
