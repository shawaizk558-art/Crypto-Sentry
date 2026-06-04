export type MarketCoin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
};

export type MarketCacheMeta = {
  updatedAt: number | null;
  fetchedAt: number | null;
  stale: boolean;
  source: "live" | "stale" | "empty";
  pollCycle: number;
  coinCount: number;
  lastError: string | null;
  lastSuccessAt: number | null;
  nextPollAt: number | null;
  serverPollIntervalMs?: number;
  cacheVersion?: number;
};

export type MarketCacheSnapshot = {
  coins: MarketCoin[];
  meta: MarketCacheMeta;
};
