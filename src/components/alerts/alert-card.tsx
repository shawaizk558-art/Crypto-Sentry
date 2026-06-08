import { SeverityBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/types/alerts";

export type AlertLogLine = {
  line: string;
  dropPct: number;
  severity?: AlertSeverity;
};

// How bad was the drop? critical, high, or medium.
function severityForDrop(drop: number): AlertSeverity {
  if (drop <= -8) return "critical";
  if (drop <= -5) return "high";
  return "medium";
}

// One alert row in the feed.
export function AlertCard({
  entry,
  index = 0,
}: {
  entry: AlertLogLine;
  index?: number;
}) {
  const severity = entry.severity ?? severityForDrop(entry.dropPct);
  const isCritical = severity === "critical";
  const isHigh = severity === "high";

  return (
    <article
      className={cn(
        "animate-slide-in group border-b border-border/60 px-5 py-3 transition-colors last:border-b-0 hover:bg-neon-cyan/[0.03]",
        isCritical && "bg-danger/[0.04]",
        isHigh && "bg-neon-magenta/[0.03]",
      )}
      style={{ animationDelay: `${index * 60}ms` }}
    >
      <div className="flex flex-wrap items-center gap-3">
        <p
          className={cn(
            "min-w-0 flex-1 font-mono text-xs leading-relaxed text-muted",
            isCritical && "text-danger/90",
            isHigh && "text-neon-magenta/90",
          )}
        >
          {entry.line}
        </p>
        <SeverityBadge severity={severity} />
      </div>
    </article>
  );
}
