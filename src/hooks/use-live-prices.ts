"use client";

import { liveMarketFetchInit } from "@/lib/coingecko-client";
import type { MarketCoin } from "@/types/market";
import { useCallback, useEffect, useRef, useState } from "react";

export type LivePriceMeta = {
  stale: boolean;
  source: "live" | "stale" | "empty";
  coinCount: number;
  ageMs: number | null;
  updatedAt: number | null;
  serverPollIntervalMs?: number;
  cacheVersion?: number;
};

type UseLivePricesOptions = {
  /** Load immediately on mount (before first SSE push). */
  loadOnMount?: boolean;
};

/**
 * Loads /api/prices once, then again only when the server signals a new cache write (~60s).
 */
// React hook: load prices and auto-refresh when server updates them.
export function useLivePrices(options: UseLivePricesOptions = {}) {
  const { loadOnMount = true } = options;
  const [coins, setCoins] = useState<MarketCoin[]>([]);
  const [meta, setMeta] = useState<LivePriceMeta | null>(null);
  const [loading, setLoading] = useState(loadOnMount);
  const [connected, setConnected] = useState(false);
  const lastVersion = useRef<number | null>(null);

  // Load prices from /api/prices.
  const loadFromCache = useCallback(async () => {
    const res = await fetch("/api/prices", liveMarketFetchInit);
    const data = await res.json();
    setCoins(data.coins ?? []);
    setMeta(data.meta ?? null);
    setLoading(false);
    return data;
  }, []);

  useEffect(() => {
    if (loadOnMount) void loadFromCache();

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
          if (!loadOnMount) void loadFromCache();
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
  }, [loadFromCache, loadOnMount]);

  return { coins, meta, loading, connected, reload: loadFromCache };
}
