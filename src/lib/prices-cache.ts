import type { LivePriceMeta } from "@/components/providers/live-prices-provider";
import type { MarketCoin } from "@/types/market";

const STORAGE_KEY = "cs-market-prices";

type PricesCache = {
  coins: MarketCoin[];
  meta: LivePriceMeta | null;
};

export function readPricesCache(): PricesCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PricesCache;
    if (!Array.isArray(parsed.coins) || parsed.coins.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function writePricesCache(coins: MarketCoin[], meta: LivePriceMeta | null) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ coins, meta }));
  } catch {
    /* quota exceeded — ignore */
  }
}
