import { NextResponse } from "next/server";
import { getMarketData } from "@/lib/coingecko";
import { addToWatchlist, getUserWatchlist } from "@/lib/db/watchlist";
import { getSessionUser } from "@/lib/supabase/session";

export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await getUserWatchlist(user.id);
  if (rows.length === 0) {
    return NextResponse.json({ items: [] });
  }

  const ids = rows.map((r) => r.asset_id);
  const { coins } = await getMarketData(ids);
  const byId = new Map(coins.map((c) => [c.id, c]));

  const items = rows.map((row) => {
    const coin = byId.get(row.asset_id);
    return {
      id: row.id,
      assetId: row.asset_id,
      assetName: row.asset_name,
      symbol: coin?.symbol?.toUpperCase() ?? row.asset_id,
      image: coin?.image ?? "",
      lastPrice: coin?.current_price ?? 0,
      change1h: coin?.price_change_percentage_1h ?? 0,
      change24h: coin?.price_change_percentage_24h ?? 0,
      change7d: coin?.price_change_percentage_7d ?? 0,
      marketCap: coin?.market_cap ?? 0,
      addedAt: row.added_at,
    };
  });

  return NextResponse.json({ items });
}

export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId, assetName } = await request.json();
  if (!assetId || !assetName) {
    return NextResponse.json(
      { error: "assetId and assetName required" },
      { status: 400 },
    );
  }

  const row = await addToWatchlist(
    user.id,
    assetId.toString(),
    assetName.toString(),
  );

  return NextResponse.json({ ok: true, id: row.id });
}
