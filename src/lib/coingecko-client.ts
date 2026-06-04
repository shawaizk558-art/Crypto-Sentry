/** Client-safe formatting (no server-only import). */

/** Live ticker display — keeps cents visible on BTC/ETH. */
export function formatLiveUsd(price: number) {
  if (!Number.isFinite(price) || price <= 0) return "—";
  if (price >= 1000) {
    return `$${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (price >= 1) {
    return `$${price.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })}`;
  }
  return `$${price.toFixed(6)}`;
}

export function formatUsd(price: number) {
  return formatLiveUsd(price);
}

export function formatMarketCap(cap: number) {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  if (cap >= 1e6) return `$${(cap / 1e6).toFixed(2)}M`;
  return `$${cap.toLocaleString()}`;
}

export const liveMarketFetchInit: RequestInit = {
  cache: "no-store",
  headers: { "Cache-Control": "no-cache" },
};
