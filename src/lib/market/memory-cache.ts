import { notifyPriceCacheUpdated } from "@/lib/market/cache-events";
import type { MarketCacheMeta, MarketCacheSnapshot, MarketCoin } from "@/types/market";

const STALE_AFTER_MS = 90_000;

// Default status when no prices are loaded yet.
const defaultMeta = (): MarketCacheMeta => ({
  updatedAt: null,
  fetchedAt: null,
  stale: true,
  source: "empty",
  pollCycle: 0,
  coinCount: 0,
  lastError: null,
  lastSuccessAt: null,
  nextPollAt: null,
});

type GlobalMarketStore = {
  coins: MarketCoin[];
  meta: MarketCacheMeta;
};

// Get the in-memory box where we keep coin prices.
function getStore(): GlobalMarketStore {
  const g = globalThis as typeof globalThis & {
    __cryptoSentryMarketCache?: GlobalMarketStore;
  };
  if (!g.__cryptoSentryMarketCache) {
    g.__cryptoSentryMarketCache = {
      coins: [],
      meta: defaultMeta(),
    };
  }
  return g.__cryptoSentryMarketCache;
}

// Get all cached coins and info about how old they are.
export function getMarketSnapshot(): MarketCacheSnapshot {
  const { coins, meta } = getStore();
  const now = Date.now();
  const ageMs = meta.updatedAt ? now - meta.updatedAt : null;
  const stale =
    meta.source === "empty" ||
    !meta.updatedAt ||
    (ageMs !== null && ageMs > STALE_AFTER_MS);

  return {
    coins: [...coins],
    meta: {
      ...meta,
      stale,
      coinCount: coins.length,
    },
  };
}

// Get only the coins whose IDs you pass in.
export function getCoinsByIds(ids: string[]): MarketCoin[] {
  if (!ids.length) return [];
  const set = new Set(ids);
  return getStore().coins.filter((c) => set.has(c.id));
}

// Save new prices into memory after a fetch.
export function updateMarketCache(
  nextCoins: MarketCoin[],
  opts: { source: "live" | "stale" | "empty"; error?: string | null },
) {
  const store = getStore();
  const now = Date.now();

  if (nextCoins.length > 0) {
    store.coins = nextCoins;
  }

  store.meta = {
    ...store.meta,
    updatedAt: nextCoins.length > 0 ? now : store.meta.updatedAt,
    fetchedAt: now,
    stale: opts.source === "stale" || opts.source === "empty",
    source:
      nextCoins.length > 0
        ? opts.source === "empty"
          ? store.meta.source
          : opts.source
        : opts.source === "empty"
          ? "empty"
          : store.meta.source,
    coinCount: store.coins.length,
    lastError: opts.error ?? null,
    lastSuccessAt: opts.source === "live" ? now : store.meta.lastSuccessAt,
  };

  if (nextCoins.length > 0 && opts.source === "live") {
    notifyPriceCacheUpdated(store.meta.updatedAt ?? now, store.coins.length);
  }
}

// Add 1 to the fetch counter (for logs/debug).
export function incrementPollCycle() {
  const store = getStore();
  store.meta = { ...store.meta, pollCycle: store.meta.pollCycle + 1 };
}

// Remember when the next price fetch will run.
export function setNextPollAt(ts: number) {
  const store = getStore();
  store.meta = { ...store.meta, nextPollAt: ts };
}

// Get each coin's price (used to check if price dropped).
export function getBaselinePrices(): Map<string, number> {
  return new Map(getStore().coins.map((c) => [c.id, c.current_price]));
}
