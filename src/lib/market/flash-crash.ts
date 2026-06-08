import { logAlertTriggered } from "@/lib/alert-logger";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db/prisma";
import type { MarketCoin } from "@/types/market";

const DEFAULT_THRESHOLD = -2;
const COOLDOWN_MS = 60_000;

const lastAlertAt = new Map<string, number>();

type UserThreshold = {
  userId: string;
  threshold: number;
};

// Get each user's "alert me if drop is worse than X%" setting.
async function loadUserThresholds(): Promise<UserThreshold[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      settings: { select: { alert_threshold: true } },
    },
  });

  return users.map((user) => ({
    userId: user.id,
    threshold: user.settings?.alert_threshold ?? DEFAULT_THRESHOLD,
  }));
}

// Unique key so we don't fire the same alert twice in a row.
function cooldownKey(userId: string, assetId: string) {
  return `${userId}:${assetId}`;
}

// If a coin dropped too fast, create an alert for affected users.
export async function detectFlashCrashes(
  current: MarketCoin[],
  baseline: Map<string, number>,
): Promise<number> {
  const userThresholds = await loadUserThresholds();
  if (userThresholds.length === 0) return 0;

  let created = 0;
  const now = Date.now();

  for (const coin of current) {
    const prev = baseline.get(coin.id);
    if (!prev || prev <= 0) continue;

    const dropPct = ((coin.current_price - prev) / prev) * 100;

    for (const { userId, threshold } of userThresholds) {
      if (dropPct > threshold) continue;

      const key = cooldownKey(userId, coin.id);
      const last = lastAlertAt.get(key) ?? 0;
      if (now - last < COOLDOWN_MS) continue;

      try {
        const alert = await prisma.cryptoAlert.create({
          data: {
            user: { connect: { id: userId } },
            asset_id: coin.id,
            asset_name: coin.name,
            asset_symbol: coin.symbol.toUpperCase(),
            price_at_drop: coin.current_price,
            drop_percentage: dropPct,
          },
        });
        lastAlertAt.set(key, now);
        created += 1;
        logAlertTriggered({
          alertId: alert.id,
          asset: coin.symbol,
          price: coin.current_price,
          dropPct,
        });
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        logger.error(
          `Alert could not be saved for ${coin.name} (user ${userId}) at $${coin.current_price} — ${detail}`,
        );
      }
    }
  }

  return created;
}
