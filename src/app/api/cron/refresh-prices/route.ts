import { runPollCycle } from "@/lib/market/poller";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** Verifies the request carries a valid CRON_SECRET via Bearer or x-cron-secret header. */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET?.trim();
  if (!secret) return false;

  const auth = request.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true;

  const headerSecret = request.headers.get("x-cron-secret");
  return headerSecret === secret;
}

/**
 * External scheduler entry point (e.g. cron-job.org every 60s).
 * Fetches prices, compares to Postgres baseline, saves alerts per user.
 */
export async function GET(request: Request) {
  if (!process.env.CRON_SECRET?.trim()) {
    return NextResponse.json(
      { error: "CRON_SECRET is not configured." },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await runPollCycle();

  return NextResponse.json({
    ok: true,
    ...result,
    polledAt: new Date().toISOString(),
  });
}
