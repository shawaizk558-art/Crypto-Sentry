"use client";

import { useAppUser } from "@/components/providers/app-user-provider";
import { useLivePrices } from "@/components/providers/live-prices-provider";
import {
  alertsStore,
  ALERTS_CACHE_KEY,
  readCache,
  writeCache,
} from "@/lib/client-cache";
import {
  countUnreadAlerts,
  markAlertsRead,
  readAlertsLastSeenAt,
} from "@/lib/alerts-unread";
import { liveMarketFetchInit } from "@/lib/coingecko-client";
import type { CryptoAlertItem } from "@/types/alerts";
import { usePathname } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type AlertsUnreadContextValue = {
  unreadCount: number;
};

const AlertsUnreadContext = createContext<AlertsUnreadContextValue | null>(null);

export function AlertsUnreadProvider({ children }: { children: ReactNode }) {
  const { userId } = useAppUser();
  const pathname = usePathname();
  const { meta } = useLivePrices();
  const [alerts, setAlerts] = useState<CryptoAlertItem[]>(
    () => readCache<CryptoAlertItem[]>(alertsStore, ALERTS_CACHE_KEY) ?? [],
  );
  const [lastSeenAt, setLastSeenAt] = useState<string | null>(() =>
    readAlertsLastSeenAt(userId),
  );

  const loadAlerts = useCallback(async () => {
    const res = await fetch("/api/alerts?limit=50", liveMarketFetchInit);
    const data = await res.json();
    const next = (data.alerts ?? []) as CryptoAlertItem[];
    setAlerts(next);
    writeCache(alertsStore, ALERTS_CACHE_KEY, next);
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    if (meta?.updatedAt) void loadAlerts();
  }, [meta?.updatedAt, loadAlerts]);

  useEffect(() => {
    if (pathname !== "/alerts") return;
    const at = markAlertsRead(alerts, userId);
    setLastSeenAt(at);
  }, [pathname, alerts, userId]);

  const unreadCount = useMemo(
    () => countUnreadAlerts(alerts, lastSeenAt),
    [alerts, lastSeenAt],
  );

  return (
    <AlertsUnreadContext.Provider value={{ unreadCount }}>
      {children}
    </AlertsUnreadContext.Provider>
  );
}

export function useAlertsUnread() {
  const ctx = useContext(AlertsUnreadContext);
  if (!ctx) {
    throw new Error("useAlertsUnread must be used within AlertsUnreadProvider");
  }
  return ctx;
}
