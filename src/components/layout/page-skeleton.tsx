import { cn } from "@/lib/utils";

function Block({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-sm bg-bg-elevated/80",
        className,
      )}
    />
  );
}

// Instant placeholder while the next route segment loads.
export function PageSkeleton() {
  return (
    <div className="page-container">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="space-y-3">
          <Block className="h-8 w-48" />
          <Block className="h-4 w-72 max-w-full" />
        </div>
        <Block className="hidden h-10 w-32 sm:block" />
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Block className="h-24" />
        <Block className="h-24" />
        <Block className="h-24" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Block className="h-40" />
        <Block className="h-40" />
        <Block className="h-40" />
        <Block className="h-40 hidden sm:block" />
        <Block className="h-40 hidden lg:block" />
        <Block className="h-40 hidden lg:block" />
      </div>
    </div>
  );
}
