import { logger } from "@/lib/logger";
import { updateMarketCache } from "@/lib/market/memory-cache";
import type { MarketCoin } from "@/types/market";

const COOLDOWN_MS = 120_000;

type FallbackGlobals = typeof globalThis & {
  __coingeckoRateLimitedUntil?: number;
};

// Shared timer used after CoinGecko tells us to slow down.
function globals() {
  return globalThis as FallbackGlobals;
}

// Are we in a pause because CoinGecko blocked too many requests?
export function isRateLimitCooldownActive(): boolean {
  const until = globals().__coingeckoRateLimitedUntil ?? 0;
  return Date.now() < until;
}

// Wait 2 minutes before calling CoinGecko again.
export function markRateLimitCooldown() {
  globals().__coingeckoRateLimitedUntil = Date.now() + COOLDOWN_MS;
  const sec = Math.round(COOLDOWN_MS / 1000);
  logger.warn(`CoinGecko rate limit — no API calls for ${sec}s. Showing cached prices.`);
}

// Fetch failed — keep showing old prices and mark them as outdated.
export function applyStaleCacheFallback(coins: MarketCoin[], reason: string) {
  if (coins.length === 0) {
    updateMarketCache([], { source: "empty", error: reason });
    return;
  }
  updateMarketCache(coins, { source: "stale", error: reason });
  logger.info(`Using cached prices (${coins.length} coins). ${reason}`);
}
