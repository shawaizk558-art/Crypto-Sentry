import { Panel } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  variant = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  variant?: "default" | "danger" | "cyan" | "magenta";
}) {
  const accent = {
    default: "text-foreground",
    danger: "text-danger text-glow-magenta",
    cyan: "text-neon-cyan text-glow-cyan",
    magenta: "text-neon-magenta text-glow-magenta",
  }[variant];

  const iconColor = {
    default: "text-muted",
    danger: "text-danger",
    cyan: "text-neon-cyan",
    magenta: "text-neon-magenta",
  }[variant];

  return (
    <Panel
      className="p-5"
      glow={variant === "cyan"}
      urgent={variant === "danger"}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="data-label">{label}</p>
          <p className={cn("mt-2 font-display text-3xl font-bold tracking-wide", accent)}>
            {value}
          </p>
          {sub && (
            <p className="mt-1 font-mono text-[11px] text-dim">{sub}</p>
          )}
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-sm border border-border bg-bg-elevated",
            variant === "danger" && "border-danger/30 bg-danger/5",
            variant === "cyan" && "border-neon-cyan/30 bg-neon-cyan/5",
            variant === "magenta" && "border-neon-magenta/30 bg-neon-magenta/5",
          )}
        >
          <Icon className={cn("h-5 w-5", iconColor)} strokeWidth={1.5} />
        </div>
      </div>
    </Panel>
  );
}
