import { Panel, PanelHeader } from "@/components/ui/card";
import type { WatchlistItem } from "@/lib/mock-data";
import { cn, formatPercent, formatUsd } from "@/lib/utils";
import { AlertTriangle, Eye, Minus } from "lucide-react";

const statusConfig = {
  alert: {
    label: "Alert",
    icon: AlertTriangle,
    className: "text-danger",
  },
  watch: {
    label: "Watch",
    icon: Eye,
    className: "text-neon-amber",
  },
  stable: {
    label: "Stable",
    icon: Minus,
    className: "text-success",
  },
};

// Single table row for a watchlist asset with status badge.
function WatchlistRow({ item }: { item: WatchlistItem }) {
  const status = statusConfig[item.status];
  const StatusIcon = status.icon;
  const negative = item.change24h < 0;

  return (
    <tr className="border-b border-border transition-colors last:border-b-0 hover:bg-bg-elevated/40">
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-bg-elevated font-mono text-[10px] font-bold text-neon-cyan">
            {item.symbol}
          </div>
          <div>
            <p className="font-display text-sm font-semibold text-foreground">{item.assetName}</p>
            <p className="font-mono text-[10px] text-dim">{item.assetId}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-4 font-mono text-sm text-foreground">{formatUsd(item.lastPrice)}</td>
      <td
        className={cn(
          "px-5 py-4 font-mono text-sm font-semibold",
          negative ? "text-danger" : "text-success",
        )}
      >
        {formatPercent(item.change24h)}
      </td>
      <td className="px-5 py-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest",
            status.className,
          )}
        >
          <StatusIcon className="h-3.5 w-3.5" strokeWidth={2} />
          {status.label}
        </span>
      </td>
    </tr>
  );
}

// Table listing monitored watchlist assets and their metrics.
export function WatchlistTable({ items }: { items: WatchlistItem[] }) {
  return (
    <Panel>
      <PanelHeader
        title="Monitored assets"
        subtitle={`${items.length} assets under active surveillance`}
      />
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-left">
          <thead>
            <tr className="border-b border-border font-mono text-[10px] uppercase tracking-[0.15em] text-dim">
              <th className="px-5 py-3 font-normal">Asset</th>
              <th className="px-5 py-3 font-normal">Price</th>
              <th className="px-5 py-3 font-normal">24h</th>
              <th className="px-5 py-3 font-normal">Status</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <WatchlistRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}
