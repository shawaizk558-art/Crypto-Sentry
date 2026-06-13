import { cn } from "@/lib/utils";

export function SkeletonBlock({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-bg-elevated/70", className)}
      aria-hidden
    />
  );
}

export function MarketTableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="card-surface overflow-hidden" aria-busy aria-label="Loading market data">
      <div className="border-b border-border bg-bg-elevated/40 px-5 py-3.5">
        <div className="flex gap-8">
          {["Asset", "Price", "24h", "Cap"].map((label) => (
            <SkeletonBlock key={label} className="h-3 w-16" />
          ))}
        </div>
      </div>
      <div className="divide-y divide-border/40">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            <SkeletonBlock className="h-7 w-7 shrink-0 rounded-sm" />
            <div className="min-w-0 flex-1 space-y-2">
              <SkeletonBlock className="h-4 w-28" />
              <SkeletonBlock className="h-3 w-12" />
            </div>
            <SkeletonBlock className="h-4 w-20" />
            <SkeletonBlock className="hidden h-4 w-14 sm:block" />
            <SkeletonBlock className="hidden h-4 w-16 md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
