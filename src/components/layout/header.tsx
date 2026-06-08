import { StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

// Page title block with live status line and optional action.
export function PageHeader({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          <StatusDot status="online" />
          <span>Live surveillance</span>
          <span className="text-dim">·</span>
          <span className="text-neon-cyan">UTC {new Date().toISOString().slice(11, 19)}</span>
        </div>
        <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl">
          {title}
        </h1>
        <p className="mt-1.5 max-w-xl text-sm text-muted">{description}</p>
      </div>
      {action ?? (
        <Button variant="primary" size="sm">
          Configure thresholds
        </Button>
      )}
    </header>
  );
}
