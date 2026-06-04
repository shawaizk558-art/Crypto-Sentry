export type AlertSeverity = "critical" | "high" | "medium";

export type CryptoAlertItem = {
  id: string;
  assetId: string;
  assetName: string;
  symbol: string;
  priceAtDrop: number;
  dropPercentage: number;
  detectedAt: Date;
  severity: AlertSeverity;
};

export type WatchlistItem = {
  id: string;
  assetId: string;
  assetName: string;
  symbol: string;
  addedAt: Date;
  lastPrice: number;
  change24h: number;
  status: "stable" | "watch" | "alert";
};

export const marketOverview = {
  globalMarketCap: "$3.10T",
  volume24h: "$110.97B",
  marketChange: -0.39,
};

export const terminalAssets = [
  {
    id: "btc",
    pair: "BTC/USD",
    price: 89275.0,
    change: -0.12,
    status: "STABLE" as const,
    sparkline: [42, 48, 44, 52, 58, 55, 62, 68, 64, 72, 78, 75, 82, 88, 85, 92, 98, 95, 100],
  },
  {
    id: "eth",
    pair: "ETH/USD",
    price: 2935.31,
    change: -0.08,
    status: "STABLE" as const,
    sparkline: [30, 35, 32, 40, 45, 42, 50, 55, 52, 58, 62, 60, 65, 70, 68, 72, 78, 76, 82],
  },
];

export const sentryAnalytics = {
  sentiment: "BULLISH",
  summary:
    "AI-driven sentiment analysis suggests a BULLISH trend for major assets. Institutional inflows remain steady despite minor volatility.",
  volatilityIndex: "14.2%",
  volatilityLabel: "LOW",
  buyPressure: "68%",
  buyPressureLabel: "HIGH",
};

const now = Date.now();

export const mockAlerts: CryptoAlertItem[] = [
  {
    id: "1",
    assetId: "solana",
    assetName: "Solana",
    symbol: "SOL",
    priceAtDrop: 142.18,
    dropPercentage: -8.42,
    detectedAt: new Date(now - 45_000),
    severity: "critical",
  },
  {
    id: "2",
    assetId: "ethereum",
    assetName: "Ethereum",
    symbol: "ETH",
    priceAtDrop: 3124.55,
    dropPercentage: -5.17,
    detectedAt: new Date(now - 180_000),
    severity: "high",
  },
  {
    id: "3",
    assetId: "bitcoin",
    assetName: "Bitcoin",
    symbol: "BTC",
    priceAtDrop: 94210.0,
    dropPercentage: -3.28,
    detectedAt: new Date(now - 420_000),
    severity: "medium",
  },
];

export const mockWatchlist: WatchlistItem[] = [
  {
    id: "w1",
    assetId: "bitcoin",
    assetName: "Bitcoin",
    symbol: "BTC",
    addedAt: new Date(now - 86400000 * 14),
    lastPrice: 89275,
    change24h: -0.12,
    status: "stable",
  },
  {
    id: "w2",
    assetId: "ethereum",
    assetName: "Ethereum",
    symbol: "ETH",
    addedAt: new Date(now - 86400000 * 7),
    lastPrice: 2935.31,
    change24h: -0.08,
    status: "stable",
  },
];

export const dashboardStats = {
  activeAlerts: 0,
  monitoredAssets: mockWatchlist.length,
  criticalToday: 0,
  avgDetectionMs: 1240,
  systemStatus: "operational" as const,
};

/** Bar heights 0–100 for 24h market change chart */
export const marketChangeBars = [
  55, 62, 48, 70, 65, 58, 72, 68, 45, 52, 40, 38, 42, 35, 30, 28, 32, 25, 22, 18,
];
