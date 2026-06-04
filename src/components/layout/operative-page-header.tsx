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
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-neon-green/30 bg-neon-green/10">
          <Icon className="h-6 w-6 text-neon-green" strokeWidth={2} />
        </div>
        <div>
          <h1 className="text-2xl font-bold italic tracking-tight text-foreground md:text-3xl">
            {title}
          </h1>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            {subtitle}
          </p>
        </div>
      </div>
      {action}
    </header>
  );
}
