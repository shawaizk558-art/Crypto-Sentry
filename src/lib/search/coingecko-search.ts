/** CoinGecko remote search — finds coins not already in the local price cache. */

import "server-only";

import {
  buildCoingeckoHeaders,
  getCoingeckoApiBase,
} from "@/lib/market/coingecko-config";
import type { SearchAssetResult } from "@/types/search";

type CoinGeckoSearchCoin = {
  id: string;
  name: string;
  symbol: string;
  market_cap_rank: number | null;
  thumb: string;
};

type CoinGeckoSearchResponse = {
  coins?: CoinGeckoSearchCoin[];
};

// Search CoinGecko for coins matching the query (used when cache has few results).
export async function searchCoinGeckoAssets(
  query: string,
  limit = 8,
): Promise<SearchAssetResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const params = new URLSearchParams({ query: q });
  const url = `${getCoingeckoApiBase()}/search?${params}`;

  const res = await fetch(url, {
    cache: "no-store",
    headers: buildCoingeckoHeaders(),
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return [];

  const data = (await res.json()) as CoinGeckoSearchResponse;
  const coins = data.coins ?? [];

  return coins.slice(0, limit).map((coin) => ({
    type: "asset" as const,
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    image: coin.thumb || null,
    price: null,
    marketCapRank: coin.market_cap_rank,
  }));
}
