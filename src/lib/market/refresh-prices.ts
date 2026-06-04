import { getAllDistinctWatchlistAssetIds } from "@/lib/db/watchlist";
import { logger } from "@/lib/logger";
import {
  applyStaleCacheFallback,
  isRateLimitCooldownActive,
} from "@/lib/market/coingecko-fallback";
import {
  DASHBOARD_PRIORITY_IDS,
  fetchSimplePricesPrioritized,
  fetchTop100Markets,
  mergeSimplePrices,
} from "@/lib/market/coingecko-fetcher";
import { detectFlashCrashes } from "@/lib/market/flash-crash";
import {
  getBaselinePrices,
  getMarketSnapshot,
  updateMarketCache,
} from "@/lib/market/memory-cache";

/** Full /coins/markets pull — less often to save API quota. */
const METADATA_REFRESH_EVERY = 20;

type RefreshGlobals = typeof globalThis & {
  __lastCoingeckoFetchAt?: number;
  __priceRefreshInFlight?: Promise<void>;
  __metadataCycleCount?: number;
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

async function buildPriorityIds(): Promise<string[]> {
  const watchlistIds = await getAllDistinctWatchlistAssetIds();
  return [...new Set([...DASHBOARD_PRIORITY_IDS, ...watchlistIds])];
}

async function applyPriceRefresh(fullMetadata: boolean) {
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

  if (fullMetadata || snapshot.coins.length === 0) {
    logger.info("Downloading top 100 coins from CoinGecko (full list)…");
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
  } else {
    const allIds = snapshot.coins.map((c) => c.id);
    const priorityIds = await buildPriorityIds();
    const result = await fetchSimplePricesPrioritized(allIds, priorityIds);

    if (result.rateLimited && result.prices.size === 0) {
      applyStaleCacheFallback(snapshot.coins, "Rate limited — no new price data");
      return { coinCount: snapshot.coins.length, alertsCreated: 0, skipped: true };
    }

    nextCoins = mergeSimplePrices(snapshot.coins, result.prices);

    if (result.prices.size > 0) {
      logger.info(
        `Watchlist/priority prices updated (${result.prices.size} coins, 1 API call). Full top-100 refreshes every ${METADATA_REFRESH_EVERY} cycles.`,
      );
    }
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
      `Cache saved — ${nextCoins.length} coins.${btcLine} ${alerts} new alert(s).`,
    );
  } else if (!fullMetadata) {
    logger.debug(`Cache saved — ${nextCoins.length} coins.${btcLine}`);
  } else {
    logger.info(`Prices updated for ${nextCoins.length} coins.${btcLine}`);
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
      const snapshot = getMarketSnapshot();
      if (snapshot.coins.length === 0) {
        await applyPriceRefresh(true);
        return;
      }

      g.__metadataCycleCount = (g.__metadataCycleCount ?? 0) + 1;
      const fullMetadata =
        g.__metadataCycleCount === 1 ||
        g.__metadataCycleCount % METADATA_REFRESH_EVERY === 0;

      await applyPriceRefresh(fullMetadata);
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
