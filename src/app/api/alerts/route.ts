import { requireSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { getUserWatchlist } from "@/lib/db/watchlist";
import type { AlertSeverity } from "@/types/alerts";
import { NextResponse } from "next/server";

// How bad was the drop? critical, high, or medium.
function severityForDrop(drop: number): AlertSeverity {
  if (drop <= -8) return "critical";
  if (drop <= -5) return "high";
  return "medium";
}

// API: get this user's recent price-drop alerts.
export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50,
      100,
    );
    const watchlistOnly = searchParams.get("watchlistOnly") === "true";

    let assetFilter: { in: string[] } | undefined;
    if (watchlistOnly) {
      const watchlist = await getUserWatchlist(user.id);
      const assetIds = watchlist.map((row) => row.asset_id);
      if (assetIds.length === 0) {
        return NextResponse.json({ alerts: [], watchlistEmpty: true });
      }
      assetFilter = { in: assetIds };
    }

    const rows = await prisma.cryptoAlert.findMany({
      where: {
        user_id: user.id,
        ...(assetFilter ? { asset_id: assetFilter } : {}),
      },
      orderBy: { detected_at: "desc" },
      take: limit,
    });

    const alerts = rows.map((row) => ({
      id: row.id,
      assetId: row.asset_id,
      assetName: row.asset_name,
      symbol:
        row.asset_symbol ||
        row.asset_name.split(" ")[0]?.slice(0, 4).toUpperCase() ||
        row.asset_id,
      priceAtDrop: row.price_at_drop,
      dropPercentage: row.drop_percentage,
      detectedAt: row.detected_at.toISOString(),
      severity: severityForDrop(row.drop_percentage),
    }));

    return NextResponse.json({ alerts });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/alerts]", err);
    return NextResponse.json({ error: "Could not load alerts." }, { status: 500 });
  }
}
