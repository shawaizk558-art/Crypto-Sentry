import { StatusDot } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";

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
          <span>Live monitoring</span>
          <span className="text-dim">·</span>
          <span className="text-neon-cyan">UTC {new Date().toISOString().slice(11, 19)}</span>
        </div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-foreground uppercase md:text-3xl">
          {title}
        </h1>
        <p className="mt-1 max-w-xl text-sm text-muted">{description}</p>
      </div>
      {action ?? (
        <Button variant="primary" size="sm">
          Configure thresholds
        </Button>
      )}
    </header>
  );
}
