import {
  buildCoingeckoHeaders,
  getCoingeckoMarketsUrl,
} from "@/lib/market/coingecko-config";
import {
  isRateLimitCooldownActive,
  markRateLimitCooldown,
} from "@/lib/market/coingecko-fallback";
import type { MarketCoin } from "@/types/market";

export const TOP_COUNT = 100;

type MarketsRow = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_1h?: number | null;
  price_change_percentage_24h?: number | null;
  price_change_percentage_7d?: number | null;
  price_change_percentage_1h_in_currency?: number | null;
  price_change_percentage_24h_in_currency?: number | null;
  price_change_percentage_7d_in_currency?: number | null;
};

// Get 1h, 24h, or 7d % change from API response.
function pickChange(
  row: MarketsRow,
  timeframe: "1h" | "24h" | "7d",
): number {
  const plain = row[`price_change_percentage_${timeframe}`];
  const inCurrency = row[`price_change_percentage_${timeframe}_in_currency`];
  return plain ?? inCurrency ?? 0;
}

// Turn one API row into our coin object.
function mapMarketsRow(row: MarketsRow): MarketCoin {
  return {
    id: row.id,
    symbol: row.symbol,
    name: row.name,
    image: row.image,
    current_price: row.current_price ?? 0,
    market_cap: row.market_cap ?? 0,
    price_change_percentage_1h: pickChange(row, "1h"),
    price_change_percentage_24h: pickChange(row, "24h"),
    price_change_percentage_7d: pickChange(row, "7d"),
  };
}

// Call CoinGecko once with our API key.
async function fetchOnce(url: string): Promise<Response> {
  return fetch(url, {
    cache: "no-store",
    headers: buildCoingeckoHeaders(),
    signal: AbortSignal.timeout(20_000),
  });
}

// Fetch top 100 coins from CoinGecko (price, changes, market cap).
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
    price_change_percentage: "1h,24h,7d",
  });

  const url = getCoingeckoMarketsUrl(params);
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
