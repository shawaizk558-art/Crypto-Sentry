import { getMarketData } from "@/lib/coingecko";
import { jsonLive } from "@/lib/api-response";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids");
    const idList = ids?.split(",").filter(Boolean);

    const { coins, meta } = await getMarketData(
      idList?.length ? idList : undefined,
    );

    return jsonLive({
      coins,
      meta: {
        ...meta,
        ageMs: meta.updatedAt ? Date.now() - meta.updatedAt : null,
      },
    });
  } catch {
    return jsonLive({ error: "Market data unavailable" }, 503);
  }
}
