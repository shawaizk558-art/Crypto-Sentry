// Lightweight in-memory caches so revisiting a page shows data instantly.

type CacheEntry<T> = { data: T; at: number };

const watchlistCache = new Map<string, CacheEntry<unknown>>();
const alertsCache = new Map<string, CacheEntry<unknown>>();

export function readCache<T>(store: Map<string, CacheEntry<unknown>>, key: string): T | null {
  const entry = store.get(key);
  return entry ? (entry.data as T) : null;
}

export function writeCache<T>(store: Map<string, CacheEntry<unknown>>, key: string, data: T) {
  store.set(key, { data, at: Date.now() });
}

export const watchlistStore = watchlistCache;
export const alertsStore = alertsCache;

export const WATCHLIST_CACHE_KEY = "items";
export const ALERTS_CACHE_KEY = "feed";
export const ALERTS_WATCHLIST_CACHE_KEY = "feed-watchlist";
