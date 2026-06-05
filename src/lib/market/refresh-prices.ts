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

type RefreshGlobals = typeof globalThis & {
  __lastCoingeckoFetchAt?: number;
  __priceRefreshInFlight?: Promise<void>;
};

function refreshGlobal() {
  return globalThis as RefreshGlobals;
}

function getPreviousBaseline() {
  const g = globalThis as typeof globalThis & {
    __marketPreviousBaseline?: Map<string, number>;
  };
  if (!g.__marketPreviousBaseline) {
    g.__marketPreviousBaseline = new Map();
  }
  return g.__marketPreviousBaseline;
}

async function applyPriceRefresh() {
  const snapshot = getMarketSnapshot();

  if (isRateLimitCooldownActive()) {
    applyStaleCacheFallback(snapshot.coins, "Rate limit cooldown");
    return { coinCount: snapshot.coins.length, alertsCreated: 0, skipped: true };
  }

  const previousBaseline = getPreviousBaseline();
  const baseline = getBaselinePrices();
  if (baseline.size > 0) {
    previousBaseline.clear();
    for (const [id, price] of baseline) previousBaseline.set(id, price);
  }

  let nextCoins = snapshot.coins;

  try {
    nextCoins = await fetchTop100Markets();
  } catch (err) {
    if (snapshot.coins.length > 0) {
      applyStaleCacheFallback(
        snapshot.coins,
        err instanceof Error ? err.message : String(err),
      );
      return { coinCount: snapshot.coins.length, alertsCreated: 0, skipped: true };
    }
    throw err;
  }

  const alerts = await detectFlashCrashes(nextCoins, previousBaseline);
  updateMarketCache(nextCoins, { source: "live", error: null });

  previousBaseline.clear();
  for (const c of nextCoins) previousBaseline.set(c.id, c.current_price);

  refreshGlobal().__lastCoingeckoFetchAt = Date.now();

  const btc = nextCoins.find((c) => c.id === "bitcoin");
  const btcLine = btc
    ? ` Bitcoin is $${btc.current_price.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}.`
    : "";

  if (alerts > 0) {
    logger.info(
      `Cache saved — ${nextCoins.length} coins (1 CoinGecko call).${btcLine} ${alerts} new alert(s).`,
    );
  } else {
    logger.info(
      `Prices updated — ${nextCoins.length} coins (1 CoinGecko call).${btcLine}`,
    );
  }

  return { coinCount: nextCoins.length, alertsCreated: alerts, skipped: false };
}

export async function refreshPricesFromApi(): Promise<void> {
  const g = refreshGlobal();
  if (g.__priceRefreshInFlight) {
    await g.__priceRefreshInFlight;
    return;
  }

  g.__priceRefreshInFlight = (async () => {
    try {
      await applyPriceRefresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      const snapshot = getMarketSnapshot();
      applyStaleCacheFallback(snapshot.coins, message);
    } finally {
      g.__priceRefreshInFlight = undefined;
    }
  })();

  await g.__priceRefreshInFlight;
}
