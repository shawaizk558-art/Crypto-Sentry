import { getMarketData } from "@/lib/coingecko";
import { jsonLive } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/** Dashboard feed — reads in-memory cache only (CoinGecko updated by 60s Node poller). */
// API: send cached coin prices to the browser.
export async function GET() {
  const { coins, meta } = await getMarketData();

  return jsonLive({
    coins,
    meta: {
      ...meta,
      ageMs: meta.updatedAt ? Date.now() - meta.updatedAt : null,
    },
  });
}
