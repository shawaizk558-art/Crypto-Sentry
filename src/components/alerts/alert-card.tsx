import { SeverityBadge } from "@/components/ui/badge";
import type { CryptoAlertItem } from "@/types/alerts";
import { cn, formatPercent, formatUsd, timeAgo } from "@/lib/utils";
import { TrendingDown } from "lucide-react";

export function AlertCard({
  alert,
  index = 0,
}: {
  alert: CryptoAlertItem;
  index?: number;
}) {
  const isCritical = alert.severity === "critical";

  return (
    <article
      className={cn(
        "animate-slide-in group flex items-stretch gap-4 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-bg-elevated/50",
        isCritical && "bg-danger/[0.03]",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div
        className={cn(
          "flex w-12 shrink-0 flex-col items-center justify-center rounded-sm border font-mono text-xs font-bold",
          isCritical
            ? "border-danger/40 bg-danger/10 text-danger"
            : "border-border bg-bg-elevated text-muted",
        )}
      >
        {alert.symbol.slice(0, 3)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-display text-sm font-semibold tracking-wide text-foreground">
            {alert.assetName}
          </h3>
          <SeverityBadge severity={alert.severity} />
          <span className="font-mono text-[10px] text-dim">
            {timeAgo(new Date(alert.detectedAt))}
          </span>
        </div>
        <p className="mt-1 font-mono text-xs text-muted">
          Drop detected at {formatUsd(alert.priceAtDrop)}
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center gap-1">
        <div className="flex items-center gap-1 font-mono text-lg font-bold text-danger">
          <TrendingDown className="h-4 w-4" strokeWidth={2} />
          {formatPercent(alert.dropPercentage)}
        </div>
        <span className="font-mono text-[10px] uppercase tracking-widest text-dim">
          {alert.assetId}
        </span>
      </div>
    </article>
  );
}
