export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { ensureMarketPollerStarted } = await import("@/lib/market/poller");
    ensureMarketPollerStarted();
  }
}
