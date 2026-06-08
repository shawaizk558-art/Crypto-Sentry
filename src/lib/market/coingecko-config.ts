/** CoinGecko URL and auth — all values from .env (no hardcoded API URLs). */

// Read a value from .env or throw if it's missing.
function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(
      `Missing ${name} in .env — copy from .env.example and set your CoinGecko API settings.`,
    );
  }
  return value;
}

// CoinGecko base URL from .env.
export function getCoingeckoApiBase(): string {
  return requireEnv("COINGECKO_API_BASE_URL").replace(/\/$/, "");
}

// Path to the markets API from .env.
export function getCoingeckoMarketsPath(): string {
  const path = requireEnv("COINGECKO_MARKETS_PATH");
  return path.startsWith("/") ? path : `/${path}`;
}

// Full URL to fetch the coin list.
export function getCoingeckoMarketsUrl(searchParams: URLSearchParams): string {
  return `${getCoingeckoApiBase()}${getCoingeckoMarketsPath()}?${searchParams}`;
}

// HTTP headers with API key for CoinGecko.
export function buildCoingeckoHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: "application/json" };
  const key = process.env.COINGECKO_API_KEY?.trim();
  if (!key) return headers;

  const tier = requireEnv("COINGECKO_API_TIER").toLowerCase();
  const headerName =
    tier === "pro" ? "x-cg-pro-api-key" : "x-cg-demo-api-key";

  (headers as Record<string, string>)[headerName] = key;
  return headers;
}
