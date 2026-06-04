type PriceUpdateListener = (payload: {
  version: number;
  updatedAt: number;
  coinCount: number;
}) => void;

type CacheEventGlobals = typeof globalThis & {
  __priceCacheVersion?: number;
  __priceUpdateListeners?: Set<PriceUpdateListener>;
};

function globals() {
  return globalThis as CacheEventGlobals;
}

export function getCacheVersion(): number {
  return globals().__priceCacheVersion ?? 0;
}

export function notifyPriceCacheUpdated(updatedAt: number, coinCount: number) {
  const g = globals();
  g.__priceCacheVersion = (g.__priceCacheVersion ?? 0) + 1;
  const version = g.__priceCacheVersion;

  if (!g.__priceUpdateListeners) {
    g.__priceUpdateListeners = new Set();
  }

  const payload = { version, updatedAt, coinCount };
  for (const listener of g.__priceUpdateListeners) {
    try {
      listener(payload);
    } catch {
      /* ignore broken listener */
    }
  }
}

export function subscribePriceUpdates(listener: PriceUpdateListener): () => void {
  const g = globals();
  if (!g.__priceUpdateListeners) {
    g.__priceUpdateListeners = new Set();
  }
  g.__priceUpdateListeners.add(listener);
  return () => g.__priceUpdateListeners?.delete(listener);
}
