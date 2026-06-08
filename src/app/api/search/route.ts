import { requireAuth } from "@/lib/auth/session";
import { jsonLive } from "@/lib/api-response";
import { runSearch } from "@/lib/search/run-search";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// Global search: assets (cache + CoinGecko), DeFi protocols, and TX hashes.
export async function GET(request: Request) {
  try {
    await requireAuth();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";

    if (!query.trim()) {
      return jsonLive({ query: "", results: [] });
    }

    const payload = await runSearch(query);
    return jsonLive(payload);
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    console.error("[GET /api/search]", err);
    return NextResponse.json({ error: "Search unavailable." }, { status: 500 });
  }
}
