/** Combines local cache, CoinGecko, protocols, and TX hash detection into one search. */

import "server-only";

import { fetchMarketCoins } from "@/lib/coingecko";
import { searchCoinGeckoAssets } from "@/lib/search/coingecko-search";
import { searchProtocols } from "@/lib/search/protocols";
import { detectTransaction } from "@/lib/search/tx-hash";
import type { SearchResponse, SearchResult } from "@/types/search";

const LOCAL_ASSET_LIMIT = 8;
const REMOTE_ASSET_LIMIT = 8;
const PROTOCOL_LIMIT = 5;

// Search coins already in our price cache (fast, no API call).
function searchLocalAssets(query: string): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const coins = fetchMarketCoins();
  const matches = coins
    .map((coin) => {
      const name = coin.name.toLowerCase();
      const symbol = coin.symbol.toLowerCase();
      const id = coin.id.toLowerCase();

      const nameStarts = name.startsWith(q);
      const symbolStarts = symbol.startsWith(q);
      const idStarts = id.startsWith(q);
      const contains =
        name.includes(q) || symbol.includes(q) || id.includes(q);

      if (!nameStarts && !symbolStarts && !idStarts && !contains) return null;

      const score =
        (nameStarts ? 4 : 0) +
        (symbolStarts ? 3 : 0) +
        (idStarts ? 2 : 0) +
        (contains ? 1 : 0);

      return { coin, score };
    })
    .filter((row): row is { coin: (typeof coins)[number]; score: number } => row !== null)
    .sort((a, b) => b.score - a.score)
    .slice(0, LOCAL_ASSET_LIMIT);

  return matches.map(({ coin }) => ({
    type: "asset" as const,
    id: coin.id,
    name: coin.name,
    symbol: coin.symbol.toUpperCase(),
    image: coin.image || null,
    price: coin.current_price,
    marketCapRank: null,
  }));
}

// Remove duplicate coins when local and remote search return the same asset.
function dedupeAssets(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  const deduped: SearchResult[] = [];

  for (const result of results) {
    if (result.type !== "asset") {
      deduped.push(result);
      continue;
    }
    if (seen.has(result.id)) continue;
    seen.add(result.id);
    deduped.push(result);
  }

  return deduped;
}

// Main search: check TX hash, local coins, CoinGecko, and protocols — then merge results.
export async function runSearch(rawQuery: string): Promise<SearchResponse> {
  const query = rawQuery.trim();
  if (!query) {
    return { query: "", results: [] };
  }

  const results: SearchResult[] = [];

  const tx = detectTransaction(query);
  if (tx) {
    results.push({
      type: "transaction",
      hash: tx.hash,
      chain: tx.chain,
      explorerUrl: tx.explorerUrl,
    });
  }

  const localAssets = searchLocalAssets(query);
  results.push(...localAssets);

  if (localAssets.length < 3) {
    const remoteAssets = await searchCoinGeckoAssets(query, REMOTE_ASSET_LIMIT);
    results.push(...remoteAssets);
  }

  for (const protocol of searchProtocols(query, PROTOCOL_LIMIT)) {
    results.push({
      type: "protocol",
      id: protocol.id,
      name: protocol.name,
      chain: protocol.chain,
      category: protocol.category,
      assetId: protocol.assetId,
    });
  }

  return {
    query,
    results: dedupeAssets(results),
  };
}
