import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function OperativePageHeader({
  icon: Icon,
  title,
  subtitle,
  action,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  action?: ReactNode;
}) {
  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-4">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border border-neon-cyan/30 bg-neon-cyan/5">
          <Icon className="h-6 w-6 text-neon-cyan cyan-glow" strokeWidth={2} />
          <span className="absolute -left-px -top-px h-2 w-2 border-l border-t border-neon-cyan" />
          <span className="absolute -bottom-px -right-px h-2 w-2 border-b border-r border-neon-magenta" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground md:text-3xl">
            {title}
          </h1>
          <p className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            {subtitle}
          </p>
        </div>
      </div>
      {action}
    </header>
  );
}
