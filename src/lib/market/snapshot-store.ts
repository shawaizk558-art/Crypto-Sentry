import "server-only";

import { prisma } from "@/lib/db/prisma";
import { hydrateMarketCache } from "@/lib/market/memory-cache";
import type { MarketCoin } from "@/types/market";

const GLOBAL_ID = "global";

export type PersistedMarketSnapshot = {
  coins: MarketCoin[];
  baseline: Record<string, number>;
  updatedAt: Date;
};

function parseCoins(value: unknown): MarketCoin[] {
  if (!Array.isArray(value)) return [];
  return value as MarketCoin[];
}

function parseBaseline(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return value as Record<string, number>;
}

export async function loadPersistedSnapshot(): Promise<PersistedMarketSnapshot | null> {
  const row = await prisma.marketPriceSnapshot.findUnique({
    where: { id: GLOBAL_ID },
  });
  if (!row) return null;

  const coins = parseCoins(row.coins);
  if (coins.length === 0) return null;

  return {
    coins,
    baseline: parseBaseline(row.baseline),
    updatedAt: row.updated_at,
  };
}

export async function savePersistedSnapshot(
  coins: MarketCoin[],
  baseline: Record<string, number>,
): Promise<void> {
  await prisma.marketPriceSnapshot.upsert({
    where: { id: GLOBAL_ID },
    create: { id: GLOBAL_ID, coins, baseline },
    update: { coins, baseline },
  });
}

export function baselineRecordToMap(
  baseline: Record<string, number>,
): Map<string, number> {
  return new Map(
    Object.entries(baseline).filter(([, price]) => Number.isFinite(price) && price > 0),
  );
}

export function coinsToBaselineRecord(coins: MarketCoin[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const coin of coins) {
    if (coin.current_price > 0) out[coin.id] = coin.current_price;
  }
  return out;
}

/** Load Postgres snapshot into in-memory cache (cold serverless instances). */
export async function hydrateMarketCacheFromDb(): Promise<boolean> {
  const persisted = await loadPersistedSnapshot();
  if (!persisted) return false;

  hydrateMarketCache(persisted.coins, persisted.updatedAt.getTime());
  return true;
}
