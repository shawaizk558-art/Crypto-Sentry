import { logger } from "@/lib/logger";
import {
  applyStaleCacheFallback,
  isRateLimitCooldownActive,
} from "@/lib/market/coingecko-fallback";
import { fetchTop100Markets } from "@/lib/market/coingecko-fetcher";
import { detectFlashCrashes } from "@/lib/market/flash-crash";
import {
  getBaselinePrices,
  getMarketSnapshot,
  updateMarketCache,
} from "@/lib/market/memory-cache";
import {
  baselineRecordToMap,
  coinsToBaselineRecord,
  loadPersistedSnapshot,
  savePersistedSnapshot,
} from "@/lib/market/snapshot-store";

/** Fetches fresh prices from CoinGecko, detects flash crashes, and updates caches. */

export type PriceRefreshResult = {
  coinCount: number;
  alertsCreated: number;
  skipped: boolean;
};

type RefreshGlobals = typeof globalThis & {
  __lastCoingeckoFetchAt?: number;
  __priceRefreshInFlight?: Promise<PriceRefreshResult>;
};

function refreshGlobal() {
  return globalThis as RefreshGlobals;
}

async function resolvePreviousBaseline(): Promise<Map<string, number>> {
  const memoryBaseline = getBaselinePrices();
  if (memoryBaseline.size > 0) return memoryBaseline;

  const persisted = await loadPersistedSnapshot();
  if (persisted) return baselineRecordToMap(persisted.baseline);

  return new Map();
}

async function applyPriceRefresh(): Promise<PriceRefreshResult> {
  const snapshot = getMarketSnapshot();

  if (isRateLimitCooldownActive()) {
    await applyStaleCacheFallback(snapshot.coins, "Rate limit cooldown");
    return { coinCount: snapshot.coins.length, alertsCreated: 0, skipped: true };
  }

  const previousBaseline = await resolvePreviousBaseline();
  let nextCoins = snapshot.coins;

  try {
    nextCoins = await fetchTop100Markets();
  } catch (err) {
    if (snapshot.coins.length > 0) {
      await applyStaleCacheFallback(
        snapshot.coins,
        err instanceof Error ? err.message : String(err),
      );
      return { coinCount: snapshot.coins.length, alertsCreated: 0, skipped: true };
    }
    throw err;
  }

  const alerts = await detectFlashCrashes(nextCoins, previousBaseline);
  updateMarketCache(nextCoins, { source: "live", error: null });

  const baseline = coinsToBaselineRecord(nextCoins);
  await savePersistedSnapshot(nextCoins, baseline);

  refreshGlobal().__lastCoingeckoFetchAt = Date.now();

  const btc = nextCoins.find((c) => c.id === "bitcoin");
  const btcLine = btc
    ? ` Bitcoin is $${btc.current_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`
    : "";

  if (alerts > 0) {
    await logger.info(
      `Cache saved — ${nextCoins.length} coins (1 CoinGecko call).${btcLine} ${alerts} new alert(s).`,
    );
  } else {
    await logger.info(
      `Prices updated — ${nextCoins.length} coins (1 CoinGecko call).${btcLine}`,
    );
  }

  return { coinCount: nextCoins.length, alertsCreated: alerts, skipped: false };
}

export async function refreshPricesFromApi(): Promise<PriceRefreshResult> {
  const g = refreshGlobal();
  if (g.__priceRefreshInFlight) {
    return g.__priceRefreshInFlight;
  }

  g.__priceRefreshInFlight = (async () => {
    try {
      return await applyPriceRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const snapshot = getMarketSnapshot();
      await applyStaleCacheFallback(snapshot.coins, message);
      return {
        coinCount: snapshot.coins.length,
        alertsCreated: 0,
        skipped: true,
      };
    } finally {
      g.__priceRefreshInFlight = undefined;
    }
  })();

  return g.__priceRefreshInFlight;
}
