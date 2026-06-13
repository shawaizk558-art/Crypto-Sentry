"use client";

import { AlertsFeed } from "@/components/alerts/alerts-feed";
import { TerminalHome } from "@/components/dashboard/terminal-home";
import { MarketExplorer } from "@/components/market/market-explorer";
import { useAppUser } from "@/components/providers/app-user-provider";
import { ProfileView } from "@/components/profile/profile-view";
import { SettingsView } from "@/components/settings/settings-view";
import { WatchlistView } from "@/components/watchlist/watchlist-view";
import { MarketTableSkeleton } from "@/components/ui/content-skeleton";
import { cn } from "@/lib/utils";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";

function ProfileRoute() {
  const user = useAppUser();
  return (
    <ProfileView
      email={user.email}
      name={user.name}
      avatarUrl={user.avatarUrl}
      userId={user.userId}
      createdAt={user.createdAt}
    />
  );
}

function MarketRouteInner() {
  const searchParams = useSearchParams();
  const highlightCoinId = searchParams.get("coin") ?? "";
  return <MarketExplorer highlightCoinId={highlightCoinId} />;
}

function MarketRoute() {
  return (
    <Suspense fallback={<MarketTableSkeleton />}>
      <MarketRouteInner />
    </Suspense>
  );
}

type AppRoute = "/" | "/watchlist" | "/alerts" | "/market" | "/profile" | "/settings";

const ROUTES: { path: AppRoute; render: () => ReactNode }[] = [
  { path: "/", render: () => <TerminalHome /> },
  { path: "/watchlist", render: () => <WatchlistView /> },
  { path: "/alerts", render: () => <AlertsFeed /> },
  { path: "/market", render: () => <MarketRoute /> },
  { path: "/profile", render: () => <ProfileRoute /> },
  { path: "/settings", render: () => <SettingsView /> },
];

function isAppRoute(path: string): path is AppRoute {
  return ROUTES.some((route) => route.path === path);
}

// Client-side view switch — screens stay mounted for instant revisits.
export function AppContentRouter() {
  const pathname = usePathname();
  const active: AppRoute = isAppRoute(pathname) ? pathname : "/";
  const [mounted, setMounted] = useState<Set<AppRoute>>(() => new Set([active]));

  useEffect(() => {
    if (!isAppRoute(pathname)) return;
    setMounted((prev) => {
      if (prev.has(pathname)) return prev;
      const next = new Set(prev);
      next.add(pathname);
      return next;
    });
  }, [pathname]);

  return (
    <>
      {ROUTES.map(({ path, render }) => {
        if (!mounted.has(path)) return null;
        return (
          <div
            key={path}
            className={cn(path !== active && "hidden")}
            aria-hidden={path !== active}
          >
            {render()}
          </div>
        );
      })}
    </>
  );
}
