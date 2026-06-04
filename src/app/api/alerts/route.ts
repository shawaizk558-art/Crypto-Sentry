import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import type { AlertSeverity } from "@/types/alerts";

function severityForDrop(drop: number): AlertSeverity {
  if (drop <= -8) return "critical";
  if (drop <= -5) return "high";
  return "medium";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50,
    100,
  );

  const rows = await prisma.cryptoAlert.findMany({
    orderBy: { detected_at: "desc" },
    take: limit,
  });

  const alerts = rows.map((row) => ({
    id: row.id,
    assetId: row.asset_id,
    assetName: row.asset_name,
    symbol: row.asset_name.split(" ")[0]?.slice(0, 4).toUpperCase() ?? row.asset_id,
    priceAtDrop: row.price_at_drop,
    dropPercentage: row.drop_percentage,
    detectedAt: row.detected_at.toISOString(),
    severity: severityForDrop(row.drop_percentage),
  }));

  return NextResponse.json({ alerts });
}
