import { cn, formatPercent } from "@/lib/utils";

export type PriceChanges = {
  change1h: number;
  change24h: number;
  change7d: number;
};

// Returns Tailwind color class for positive, negative, or flat change.
export function changeColorClass(value: number) {
  if (value < 0) return "text-neon-magenta";
  if (value > 0) return "text-neon-green";
  return "text-muted";
}

// Renders a formatted percentage change with semantic coloring.
export function PriceChangeCell({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  return (
    <span className={cn("font-mono font-semibold", changeColorClass(value), className)}>
      {formatPercent(value)}
    </span>
  );
}

// Small labeled data pill for compact metric display.
export function DataPill({
  label,
  value,
  valueClassName,
  className,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-sm border border-border bg-bg-elevated/50 px-2 py-1",
        className,
      )}
    >
      <span className="font-mono text-[9px] uppercase tracking-wider text-dim">
        {label}
      </span>
      <p className={cn("font-mono text-xs font-semibold", valueClassName)}>{value}</p>
    </div>
  );
}

// Row of 1h, 24h, and 7d change pills for an asset.
export function PriceChangePills({
  changes,
  className,
}: {
  changes: PriceChanges;
  className?: string;
}) {
  const items = [
    { label: "1h", value: changes.change1h },
    { label: "24h", value: changes.change24h },
    { label: "7d", value: changes.change7d },
  ] as const;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map(({ label, value }) => (
        <DataPill
          key={label}
          label={label}
          value={formatPercent(value)}
          valueClassName={changeColorClass(value)}
        />
      ))}
    </div>
  );
}
