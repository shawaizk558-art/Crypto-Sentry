import { logger } from "@/lib/logger";
import {
  isRateLimitCooldownActive,
  markRateLimitCooldown,
} from "@/lib/market/coingecko-fallback";
import type { MarketCoin } from "@/types/market";

const COINGECKO = "https://api.coingecko.com/api/v3";
const TOP_COUNT = 100;
const SIMPLE_PRICE_BATCH = 50;

/** One simple/price call per 30s cycle (watchlist + BTC/ETH only). Rest update on full markets refresh. */
export const MAX_BATCHES_PER_CYCLE = 1;

export const DASHBOARD_PRIORITY_IDS = ["bitcoin", "ethereum"];

type MarketsRow = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number | null;
};

type SimplePriceResponse = Record<
  string,
  { usd?: number; usd_24h_change?: number }
>;

export type PrioritizedFetchResult = {
  prices: Map<string, { price: number; change24h: number }>;
  batchesUsed: number;
  watchlistUpdated: number;
  otherUpdated: number;
  rateLimited: boolean;
};

function buildHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: "application/json" };
  const key = process.env.COINGECKO_API_KEY?.trim();
  if (key) {
    (headers as Record<string, string>)["x-cg-demo-api-key"] = key;
  }
  return headers;
}

async function fetchOnce(url: string): Promise<Response> {
  return fetch(url, {
    cache: "no-store",
    headers: buildHeaders(),
    signal: AbortSignal.timeout(20_000),
  });
}

function mapMarketsRow(row: MarketsRow): MarketCoin {
  return {
    id: row.id,
    symbol: row.symbol,
    name: row.name,
    image: row.image,
    current_price: row.current_price ?? 0,
    market_cap: row.market_cap ?? 0,
    price_change_percentage_24h: row.price_change_percentage_24h ?? 0,
  };
}

/** Full top-100 — single request, no retry on 429. */
export async function fetchTop100Markets(): Promise<MarketCoin[]> {
  if (isRateLimitCooldownActive()) {
    throw new Error("rate limit cooldown active");
  }

  const params = new URLSearchParams({
    vs_currency: "usd",
    order: "market_cap_desc",
    per_page: String(TOP_COUNT),
    page: "1",
    sparkline: "false",
    price_change_percentage: "24h",
  });

  const url = `${COINGECKO}/coins/markets?${params}`;
  const res = await fetchOnce(url);

  if (res.status === 429) {
    markRateLimitCooldown();
    throw new Error("markets rate limited");
  }
  if (!res.ok) {
    throw new Error(`markets fetch failed: ${res.status}`);
  }

  const rows = (await res.json()) as MarketsRow[];
  return rows.map(mapMarketsRow);
}

/**
 * One CoinGecko call — returns null on 429 (never retries; retries make limits worse).
 */
async function fetchSimplePriceChunk(
  ids: string[],
): Promise<Map<string, { price: number; change24h: number }> | null> {
  if (!ids.length) return new Map();

  const params = new URLSearchParams({
    ids: ids.join(","),
    vs_currencies: "usd",
    include_24hr_change: "true",
  });

  const res = await fetchOnce(`${COINGECKO}/simple/price?${params}`);

  if (res.status === 429) {
    markRateLimitCooldown();
    logger.warn(
      "CoinGecko rate limit on price fetch — using cached prices until cooldown ends.",
    );
    return null;
  }

  if (!res.ok) {
    logger.error(`Live price fetch failed (${res.status}). Keeping cached prices.`);
    return null;
  }

  const data = (await res.json()) as SimplePriceResponse;
  const out = new Map<string, { price: number; change24h: number }>();

  for (const [id, row] of Object.entries(data)) {
    out.set(id, {
      price: row.usd ?? 0,
      change24h: row.usd_24h_change ?? 0,
    });
  }

  return out;
}

/**
 * Each 30s cycle: one API call for watchlist + dashboard coins only.
 * Other top-100 coins refresh on the periodic full /coins/markets pull.
 */
export async function fetchSimplePricesPrioritized(
  allIds: string[],
  priorityIds: string[],
): Promise<PrioritizedFetchResult> {
  const empty: PrioritizedFetchResult = {
    prices: new Map(),
    batchesUsed: 0,
    watchlistUpdated: 0,
    otherUpdated: 0,
    rateLimited: false,
  };

  if (!allIds.length) return empty;
  if (isRateLimitCooldownActive()) {
    return { ...empty, rateLimited: true };
  }

  const allSet = new Set(allIds);
  const priority = [...new Set(priorityIds.filter((id) => allSet.has(id)))].slice(
    0,
    SIMPLE_PRICE_BATCH,
  );

  if (priority.length === 0) {
    return empty;
  }

  const part = await fetchSimplePriceChunk(priority);

  if (!part) {
    return { ...empty, rateLimited: true };
  }

  return {
    prices: part,
    batchesUsed: 1,
    watchlistUpdated: part.size,
    otherUpdated: 0,
    rateLimited: false,
  };
}

export function mergeSimplePrices(
  coins: MarketCoin[],
  prices: Map<string, { price: number; change24h: number }>,
): MarketCoin[] {
  return coins.map((coin) => {
    const patch = prices.get(coin.id);
    if (!patch) return coin;
    return {
      ...coin,
      current_price: patch.price,
      price_change_percentage_24h: patch.change24h,
    };
  });
}

export { TOP_COUNT };
