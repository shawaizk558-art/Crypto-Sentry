import { logAlertTriggered } from "@/lib/alert-logger";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/db/prisma";
import type { MarketCoin } from "@/types/market";

const DEFAULT_THRESHOLD = -2;
const COOLDOWN_MS = 60_000;

type UserThreshold = {
  userId: string;
  threshold: number;
};

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

function cooldownKey(userId: string, assetId: string) {
  return `${userId}:${assetId}`;
}

async function loadRecentAlertCooldowns(): Promise<Set<string>> {
  const since = new Date(Date.now() - COOLDOWN_MS);
  const rows = await prisma.cryptoAlert.findMany({
    where: { detected_at: { gte: since } },
    select: { user_id: true, asset_id: true },
  });
  return new Set(rows.map((row) => cooldownKey(row.user_id, row.asset_id)));
}

export async function detectFlashCrashes(
  current: MarketCoin[],
  baseline: Map<string, number>,
): Promise<number> {
  const userThresholds = await loadUserThresholds();
  if (userThresholds.length === 0) return 0;
  if (baseline.size === 0) return 0;

  const cooldowns = await loadRecentAlertCooldowns();
  let created = 0;

  for (const coin of current) {
    const prev = baseline.get(coin.id);
    if (!prev || prev <= 0) continue;

    const dropPct = ((coin.current_price - prev) / prev) * 100;

    for (const { userId, threshold } of userThresholds) {
      if (dropPct > threshold) continue;

      const key = cooldownKey(userId, coin.id);
      if (cooldowns.has(key)) continue;

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
        cooldowns.add(key);
        created += 1;
        logAlertTriggered({
          alertId: alert.id,
          asset: coin.symbol,
          price: coin.current_price,
          dropPct,
        });
      } catch (err) {
        const detail = err instanceof Error ? err.message : String(err);
        await logger.error(
          `Alert could not be saved for ${coin.name} (user ${userId}) at $${coin.current_price} — ${detail}`,
        );
      }
    }
  }

  return created;
}
