import { logger } from "@/lib/logger";
import {
  getMarketSnapshot,
  incrementPollCycle,
  setNextPollAt,
} from "@/lib/market/memory-cache";
import { COINGECKO_POLL_MS } from "@/lib/market/constants";
import { refreshPricesFromApi } from "@/lib/market/refresh-prices";
import type { MarketCacheSnapshot } from "@/types/market";

const MIN_POLL_MS = 30_000;

type PollerGlobals = typeof globalThis & {
  __marketPollerStarted?: boolean;
  __marketPollInFlight?: boolean;
  __marketPollIntervalId?: ReturnType<typeof setInterval>;
};

function pollerGlobal() {
  return globalThis as PollerGlobals;
}

function pollIntervalMs() {
  const raw = process.env.MARKET_POLL_INTERVAL_MS;
  const parsed = raw ? Number.parseInt(raw, 10) : COINGECKO_POLL_MS;
  return Number.isFinite(parsed) && parsed >= MIN_POLL_MS ? parsed : COINGECKO_POLL_MS;
}

export async function runPollCycle() {
  const g = pollerGlobal();
  if (g.__marketPollInFlight) {
    return;
  }

  g.__marketPollInFlight = true;
  incrementPollCycle();

  try {
    await refreshPricesFromApi();
  } finally {
    g.__marketPollInFlight = false;
    setNextPollAt(Date.now() + pollIntervalMs());
  }
}

export function ensureMarketPollerStarted() {
  const g = pollerGlobal();
  if (g.__marketPollerStarted) return;
  g.__marketPollerStarted = true;

  const sec = Math.round(pollIntervalMs() / 1000);
  logger.info(
    `CoinGecko fetch every ${sec}s → saved in memory. UI updates when new prices land (SSE, not timed polling).`,
  );

  void runPollCycle();
  g.__marketPollIntervalId = setInterval(() => {
    void runPollCycle();
  }, pollIntervalMs());
}

export async function ensureMarketCacheWarm(): Promise<MarketCacheSnapshot> {
  ensureMarketPollerStarted();
  let snapshot = getMarketSnapshot();
  if (snapshot.coins.length > 0) return snapshot;

  logger.warn("No prices loaded yet — fetching from CoinGecko now…");
  await runPollCycle();
  snapshot = getMarketSnapshot();

  if (snapshot.coins.length === 0) {
    for (let i = 0; i < 30; i++) {
      await new Promise((r) => setTimeout(r, 200));
      snapshot = getMarketSnapshot();
      if (snapshot.coins.length > 0) return snapshot;
    }
  }

  return snapshot;
}

export function stopMarketPollerForTests() {
  const g = pollerGlobal();
  if (g.__marketPollIntervalId) clearInterval(g.__marketPollIntervalId);
  g.__marketPollIntervalId = undefined;
  g.__marketPollerStarted = false;
  g.__marketPollInFlight = false;
}
