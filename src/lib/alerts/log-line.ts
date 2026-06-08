export type AlertLogFields = {
  alertId: string;
  asset: string;
  price: number;
  dropPct: number;
  at?: Date;
};

// Turn date into log timestamp string.
export function formatIsoLogTimestamp(at: Date): string {
  return at.toISOString().replace(/\.\d{3}Z$/, "Z");
}

// Show price in alert log, e.g. $42,000.
function formatAlertPrice(price: number): string {
  return `$${price.toLocaleString("en-US", {
    maximumFractionDigits: price >= 1 ? 0 : 2,
    minimumFractionDigits: 0,
  })}`;
}

// Build the full text line for a triggered alert.
export function formatAlertTriggeredLogLine({
  alertId,
  asset,
  price,
  dropPct,
  at = new Date(),
}: AlertLogFields): string {
  const ts = formatIsoLogTimestamp(at);
  const priceStr = formatAlertPrice(price);
  const dropStr = `${Math.abs(dropPct).toFixed(1)}%`;

  return `[${ts}] ALERT_TRIGGERED | Asset: ${asset.toUpperCase()} | Price: ${priceStr} | Drop: ${dropStr} | AlertID: ${alertId}`;
}
