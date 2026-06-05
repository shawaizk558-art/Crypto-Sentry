export type InductionStep = {
  id: string;
  title: string;
  description: string;
  target?: string;
  placement?: "center" | "right" | "bottom";
  requiresDashboard?: boolean;
};

export const INDUCTION_STEPS: InductionStep[] = [
  {
    id: "welcome",
    title: "Crypto Sentry Command Center",
    description:
      "Welcome operative. This is Crypto Sentry, your high-performance market surveillance hub.",
    target: "sentry-brand",
    placement: "right",
    requiresDashboard: true,
  },
  {
    id: "market-overview",
    title: "Global Intelligence",
    description:
      "Monitor total market capitalization and global volume shifts. These metrics indicate institutional liquidity flow.",
    target: "market-overview",
    placement: "right",
    requiresDashboard: true,
  },
  {
    id: "price-surveillance",
    title: "Price Surveillance",
    description:
      "Live price tracking for major assets. Neon green indicates stable, while emergency red triggers critical status.",
    target: "price-surveillance",
    placement: "right",
    requiresDashboard: true,
  },
  {
    id: "nav-market",
    title: "Asset Exploration",
    description:
      "Access the global asset index to discover new tokens and analyze liquidity maps.",
    target: "nav-market",
    placement: "right",
  },
  {
    id: "nav-watchlist",
    title: "Priority Targets",
    description:
      "Track assets you've personally flagged for priority observation. Focus on what matters.",
    target: "nav-watchlist",
    placement: "right",
  },
  {
    id: "nav-alerts",
    title: "Protocol Violations",
    description:
      "Review the chronological logs of all critical market drops that triggered our emergency sensors.",
    target: "nav-alerts",
    placement: "right",
  },
  {
    id: "sidebar-profile",
    title: "Operator Profile",
    description:
      "Manage your node clearance, security keys, and system preferences from this portal.",
    target: "sidebar-profile",
    placement: "right",
  },
];
