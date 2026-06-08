import { getRecentSystemLogs } from "@/lib/logger";
import { NextResponse } from "next/server";

// Returns recent operational system log entries.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50,
    200,
  );

  const logs = await getRecentSystemLogs(limit);

  return NextResponse.json({
    logs,
    lines: logs.map((entry) => entry.line),
  });
}
