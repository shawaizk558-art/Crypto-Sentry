// When server starts, begin fetching prices every ~60s.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureMarketPollerStarted } = await import("@/lib/market/poller");
    ensureMarketPollerStarted();
  }
}
