import type { CryptoAlertItem } from "@/types/alerts";

const STORAGE_PREFIX = "crypto-sentry:alerts-last-seen:";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function readAlertsLastSeenAt(userId: string): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(storageKey(userId));
}

export function writeAlertsLastSeenAt(userId: string, iso: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(storageKey(userId), iso);
}

export function countUnreadAlerts(
  alerts: CryptoAlertItem[],
  lastSeenAt: string | null,
): number {
  if (!lastSeenAt) return alerts.length;
  return alerts.filter((alert) => alert.detectedAt > lastSeenAt).length;
}

export function latestAlertSeenAt(alerts: CryptoAlertItem[]): string {
  if (alerts.length === 0) return new Date().toISOString();
  return alerts.reduce(
    (latest, alert) => (alert.detectedAt > latest ? alert.detectedAt : latest),
    alerts[0].detectedAt,
  );
}

export function markAlertsRead(alerts: CryptoAlertItem[], userId: string): string {
  const at = latestAlertSeenAt(alerts);
  writeAlertsLastSeenAt(userId, at);
  return at;
}
