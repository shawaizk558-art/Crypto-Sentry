import { getCacheVersion, subscribePriceUpdates } from "@/lib/market/cache-events";
import { getMarketSnapshot } from "@/lib/market/memory-cache";
import { ensureMarketPollerStarted } from "@/lib/market/poller";
import { getSessionUser } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

/**
 * SSE: browser connects once; server pushes when the 30s poller writes new prices.
 * Frontend then fetches /api/prices (read cache only).
 */
export async function GET(request: Request) {
  const user = await getSessionUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  ensureMarketPollerStarted();

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: object) => {
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(payload)}\n\n`),
        );
      };

      const snapshot = getMarketSnapshot();
      send({
        type: "connected",
        version: getCacheVersion(),
        updatedAt: snapshot.meta.updatedAt,
        coinCount: snapshot.meta.coinCount,
      });

      const unsubscribe = subscribePriceUpdates(
        ({ version, updatedAt, coinCount }) => {
          send({ type: "prices-updated", version, updatedAt, coinCount });
        },
      );

      const heartbeat = setInterval(() => {
        send({ type: "heartbeat", at: Date.now() });
      }, 45_000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
