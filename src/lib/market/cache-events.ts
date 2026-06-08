type PriceUpdateListener = (payload: {
  version: number;
  updatedAt: number;
  coinCount: number;
}) => void;

type CacheEventGlobals = typeof globalThis & {
  __priceCacheVersion?: number;
  __priceUpdateListeners?: Set<PriceUpdateListener>;
};

// Shared place that stores price version and who is listening.
function globals() {
  return globalThis as CacheEventGlobals;
}

// How many times prices have been updated since server start.
export function getCacheVersion(): number {
  return globals().__priceCacheVersion ?? 0;
}

// New prices saved — bump version and tell everyone listening.
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

// Start listening for price updates. Call the return value to stop.
export function subscribePriceUpdates(listener: PriceUpdateListener): () => void {
  const g = globals();
  if (!g.__priceUpdateListeners) {
    g.__priceUpdateListeners = new Set();
  }
  g.__priceUpdateListeners.add(listener);
  return () => g.__priceUpdateListeners?.delete(listener);
}
