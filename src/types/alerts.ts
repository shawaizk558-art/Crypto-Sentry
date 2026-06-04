export type AlertSeverity = "critical" | "high" | "medium";

export type CryptoAlertItem = {
  id: string;
  assetId: string;
  assetName: string;
  symbol: string;
  priceAtDrop: number;
  dropPercentage: number;
  detectedAt: string;
  severity: AlertSeverity;
};
