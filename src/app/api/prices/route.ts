import { getMarketData } from "@/lib/coingecko";
import { jsonLive } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/** Dashboard feed — refreshes CoinGecko when cache is older than ~8s. */
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
