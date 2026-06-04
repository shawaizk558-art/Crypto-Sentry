import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db/prisma";
import type { MarketCoin } from "@/types/market";

const DEFAULT_THRESHOLD = -2;
const COOLDOWN_MS = 60_000;

const lastAlertAt = new Map<string, number>();

export async function detectFlashCrashes(
  current: MarketCoin[],
  baseline: Map<string, number>,
  thresholdPercent = DEFAULT_THRESHOLD,
): Promise<number> {
  let created = 0;
  const now = Date.now();

  for (const coin of current) {
    const prev = baseline.get(coin.id);
    if (!prev || prev <= 0) continue;

    const dropPct = ((coin.current_price - prev) / prev) * 100;
    if (dropPct > thresholdPercent) continue;

    const last = lastAlertAt.get(coin.id) ?? 0;
    if (now - last < COOLDOWN_MS) continue;

    try {
      await prisma.cryptoAlert.create({
        data: {
          asset_id: coin.id,
          asset_name: coin.name,
          price_at_drop: coin.current_price,
          drop_percentage: dropPct,
        },
      });
      lastAlertAt.set(coin.id, now);
      created += 1;
      logger.info(
        `ALERT: ${coin.name} fell ${Math.abs(dropPct).toFixed(2)}% to $${coin.current_price.toLocaleString("en-US", { maximumFractionDigits: 2 })}.`,
      );
    } catch (err) {
      const detail = err instanceof Error ? err.message : String(err);
      logger.error(
        `Alert could not be saved for ${coin.name} at $${coin.current_price} — ${detail}`,
      );
    }
  }

  return created;
}
