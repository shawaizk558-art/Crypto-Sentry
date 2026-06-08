import { getRecentAlertLogs } from "@/lib/alert-logger";
import { requireSessionUser } from "@/lib/auth/session";
import { NextResponse } from "next/server";

// Returns recent alert log entries for the authenticated user.
export async function GET(request: Request) {
  try {
    const user = await requireSessionUser();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Number.parseInt(searchParams.get("limit") ?? "50", 10) || 50,
      100,
    );

    const logs = await getRecentAlertLogs(user.id, limit);

    return NextResponse.json({
      logs,
      lines: logs.map((entry) => entry.line),
    });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/alerts/logs]", err);
    return NextResponse.json({ error: "Could not load alert logs." }, { status: 500 });
  }
}
