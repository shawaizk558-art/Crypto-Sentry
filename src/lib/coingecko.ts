import "server-only";

import {
  getCoinsByIds,
  getMarketSnapshot,
} from "@/lib/market/memory-cache";
import { getCacheVersion } from "@/lib/market/cache-events";
import { COINGECKO_POLL_MS } from "@/lib/market/constants";
import {
  ensureMarketCacheWarm,
  ensureMarketPollerStarted,
} from "@/lib/market/poller";
import type { MarketCacheSnapshot, MarketCoin } from "@/types/market";

export type { MarketCoin };

/** Read in-memory cache only. CoinGecko is updated by the 60s background poller. */
export async function getMarketData(ids?: string[]): Promise<MarketCacheSnapshot> {
  ensureMarketPollerStarted();
  await ensureMarketCacheWarm();

  const snapshot = getMarketSnapshot();
  const meta = {
    ...snapshot.meta,
    serverPollIntervalMs: COINGECKO_POLL_MS,
    cacheVersion: getCacheVersion(),
  };

  if (ids?.length) {
    return {
      coins: getCoinsByIds(ids),
      meta,
    };
  }
  return { coins: snapshot.coins, meta };
}

// Read cached coins from memory (no waiting).
export function fetchMarketCoins(ids?: string[]): MarketCoin[] {
  ensureMarketPollerStarted();
  const { coins } = getMarketSnapshot();
  if (ids?.length) {
    return getCoinsByIds(ids);
  }
  return coins;
}

// Info about cached prices: age, version, how often we fetch.
export function getMarketCacheMeta() {
  ensureMarketPollerStarted();
  return {
    ...getMarketSnapshot().meta,
    serverPollIntervalMs: COINGECKO_POLL_MS,
    cacheVersion: getCacheVersion(),
  };
}

// Show price in dollars. Uses B/M for big numbers.
export function formatUsd(price: number, compact = false) {
  if (price >= 1_000_000_000) {
    return `$${(price / 1_000_000_000).toFixed(2)}B`;
  }
  if (price >= 1_000_000) {
    return `$${(price / 1_000_000).toFixed(2)}M`;
  }
  if (price >= 1000) {
    return `$${price.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
  }
  if (compact) {
    return `$${price.toFixed(2)}`;
  }
  return `$${price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
