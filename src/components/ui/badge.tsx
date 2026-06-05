import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/lib/mock-data";

const severityStyles: Record<AlertSeverity, string> = {
  critical: "bg-danger/15 text-danger border-danger/50 shadow-[0_0_12px_rgba(255,0,85,0.15)]",
  high: "bg-neon-magenta/15 text-neon-magenta border-neon-magenta/40 shadow-[0_0_12px_rgba(255,42,109,0.1)]",
  medium: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30",
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
        "inline-flex items-center gap-1.5 rounded-sm border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
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
    online: "bg-neon-green shadow-[0_0_8px_rgba(5,255,161,0.6)]",
    offline: "bg-dim",
    warning: "bg-neon-yellow shadow-[0_0_8px_rgba(252,238,10,0.6)]",
  };
  return (
    <span className={cn("inline-block h-2 w-2 rounded-full", colors[status])} />
  );
}
