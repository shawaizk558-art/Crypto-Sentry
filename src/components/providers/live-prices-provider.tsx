"use client";

import { liveMarketFetchInit } from "@/lib/coingecko-client";
import { readPricesCache, writePricesCache } from "@/lib/prices-cache";
import type { MarketCoin } from "@/types/market";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export type LivePriceMeta = {
  stale: boolean;
  source: "live" | "stale" | "empty";
  coinCount: number;
  ageMs: number | null;
  updatedAt: number | null;
  serverPollIntervalMs?: number;
  cacheVersion?: number;
};

type LivePricesContextValue = {
  coins: MarketCoin[];
  meta: LivePriceMeta | null;
  /** True only while waiting for the first price payload (never blocks when cached data exists). */
  loading: boolean;
  connected: boolean;
  reload: () => Promise<unknown>;
};

const LivePricesContext = createContext<LivePricesContextValue | null>(null);

// Keeps one price feed + SSE connection alive across page navigations.
export function LivePricesProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [meta, setMeta] = useState<LivePriceMeta | null>(null);
  const [fetching, setFetching] = useState(true);
  const [connected, setConnected] = useState(false);
  const lastVersion = useRef<number | null>(null);
  const hydrated = useRef(false);

  const loadFromCache = useCallback(async () => {
    const res = await fetch("/api/prices", liveMarketFetchInit);
    const data = await res.json();
    const nextCoins = data.coins ?? [];
    const nextMeta = data.meta ?? null;
    setCoins(nextCoins);
    setMeta(nextMeta);
    writePricesCache(nextCoins, nextMeta);
    setFetching(false);
    return data;
  }, []);

  useLayoutEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const cached = readPricesCache();
    if (!cached) return;
    setCoins(cached.coins);
    setMeta(cached.meta);
    setFetching(false);
  }, []);

  useEffect(() => {
    void loadFromCache();

    const es = new EventSource("/api/prices/stream");

    es.onopen = () => setConnected(true);

    es.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as {
          type: string;
          version?: number;
        };

        if (msg.type === "heartbeat") return;

        if (msg.type === "prices-updated" && typeof msg.version === "number") {
          if (lastVersion.current === msg.version) return;
          lastVersion.current = msg.version;
          void loadFromCache();
          return;
        }

        if (msg.type === "connected" && typeof msg.version === "number") {
          lastVersion.current = msg.version;
        }
      } catch {
        /* ignore malformed SSE */
      }
    };

    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => {
      es.close();
      setConnected(false);
    };
  }, [loadFromCache]);

  const loading = fetching && coins.length === 0;

  return (
    <LivePricesContext.Provider
      value={{ coins, meta, loading, connected, reload: loadFromCache }}
    >
      {children}
    </LivePricesContext.Provider>
  );
}

export function useLivePrices() {
  const ctx = useContext(LivePricesContext);
  if (!ctx) {
    throw new Error("useLivePrices must be used within LivePricesProvider");
  }
  return ctx;
}
