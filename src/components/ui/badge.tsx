import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/lib/mock-data";

const severityStyles: Record<AlertSeverity, string> = {
  critical: "bg-danger/15 text-danger border-danger/40",
  high: "bg-neon-green/15 text-neon-green border-neon-green/40",
  medium: "bg-dim/20 text-muted border-border",
};

export function SeverityBadge({
  severity,
  className,
}: {
  severity: AlertSeverity;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
        severityStyles[severity],
        className,
      )}
    >
      {severity}
    </span>
  );
}

export function StatusDot({
  status,
}: {
  status: "online" | "offline" | "warning";
}) {
  const colors = {
    online: "bg-neon-green shadow-[0_0_8px_rgba(0,255,65,0.6)]",
    offline: "bg-dim",
    warning: "bg-danger shadow-[0_0_8px_rgba(255,59,59,0.6)]",
  };
  return (
    <span className={cn("inline-block h-2 w-2 rounded-full", colors[status])} />
  );
}
