import "server-only";

import {
  formatAlertTriggeredLogLine,
  type AlertLogFields,
} from "@/lib/alerts/log-line";
import { prisma } from "@/lib/db/prisma";

export type AlertLogEntry = {
  ts: string;
  line: string;
  alertId: string;
  asset: string;
  price: number;
  dropPct: number;
};

export type AlertTriggeredInput = AlertLogFields;

// When an alert fires: print a log line (alert is already saved in CryptoAlert).
export function logAlertTriggered(input: AlertTriggeredInput): void {
  const { alertId, asset, price, dropPct } = input;
  const line = formatAlertTriggeredLogLine({ alertId, asset, price, dropPct });
  console.log(line);
}

// Load recent alert log entries for one user from CryptoAlert.
export async function getRecentAlertLogs(
  userId: string,
  limit = 50,
): Promise<AlertLogEntry[]> {
  const rows = await prisma.cryptoAlert.findMany({
    where: { user_id: userId },
    orderBy: { detected_at: "desc" },
    take: limit,
  });

  return rows.reverse().map((row) => ({
    ts: row.detected_at.toISOString(),
    line: formatAlertTriggeredLogLine({
      alertId: row.id,
      asset: row.asset_symbol || row.asset_name,
      price: row.price_at_drop,
      dropPct: row.drop_percentage,
      at: row.detected_at,
    }),
    alertId: row.id,
    asset: row.asset_symbol,
    price: row.price_at_drop,
    dropPct: row.drop_percentage,
  }));
}

// Load recent alert logs as text lines.
export async function getRecentAlertLogLines(
  userId: string,
  limit = 50,
): Promise<string[]> {
  const logs = await getRecentAlertLogs(userId, limit);
  return logs.map((entry) => entry.line);
}
