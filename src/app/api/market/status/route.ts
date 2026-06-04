import { NextResponse } from "next/server";
import { getMarketCacheMeta } from "@/lib/coingecko";
import { getRecentLogLines, getRecentLogs } from "@/lib/logger";
import { ensureMarketPollerStarted } from "@/lib/market/poller";

export async function GET(request: Request) {
  ensureMarketPollerStarted();

  const { searchParams } = new URL(request.url);
  const includeLogs = searchParams.get("logs") === "1";
  const logLimit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50,
    200,
  );

  const meta = getMarketCacheMeta();

  return NextResponse.json({
    ok: meta.source !== "empty",
    meta: {
      ...meta,
      ageMs: meta.updatedAt ? Date.now() - meta.updatedAt : null,
    },
    ...(includeLogs
      ? {
          logs: getRecentLogs(logLimit),
          lines: getRecentLogLines(logLimit),
        }
      : {}),
  });
}
