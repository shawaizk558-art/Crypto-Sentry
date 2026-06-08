import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

// Card container with optional glow and urgent styling.
export function Panel({
  children,
  className,
  glow,
  urgent,
}: {
  children: ReactNode;
  className?: string;
  glow?: boolean;
  urgent?: boolean;
}) {
  return (
    <div
      className={cn(
        "card-surface overflow-hidden",
        glow && "card-glow-cyan",
        urgent && "card-glow-danger",
        className,
      )}
    >
      {children}
    </div>
  );
}

// Header section for a panel with title, subtitle, and action slot.
export function PanelHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border bg-bg-elevated/30 px-5 py-4">
      <div>
        <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-0.5 font-mono text-[10px] text-muted">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}
