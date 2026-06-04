"use client";

import { Search } from "lucide-react";
import { useSession } from "next-auth/react";

export function TopBar() {
  const { data: session } = useSession();
  const name = session?.user?.name ?? "Operative";
  const initial = (name[0] ?? "?").toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex items-center gap-6 border-b border-border bg-bg-deep/80 px-8 py-4 backdrop-blur-md">
      <div className="relative max-w-2xl flex-1">
        <Search
          className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-dim"
          strokeWidth={1.5}
        />
        <input
          type="search"
          placeholder="Search Assets, Protocols or TX IDs..."
          className="w-full rounded-full border border-border bg-bg-card py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-dim transition-colors focus:border-neon-green/40 focus:outline-none focus:ring-1 focus:ring-neon-green/20"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-8">
        <div className="hidden items-center gap-2 sm:flex">
          <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse-dot" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted">
            Network Status:
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-neon-green">
            Mainnet Operational
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-[10px] font-medium uppercase tracking-wider text-muted md:inline">
            User Instance:
          </span>
          <span className="text-sm font-medium text-foreground">{name}</span>
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neon-green/20 text-xs font-bold text-neon-green">
            {initial}
          </div>
        </div>
      </div>
    </header>
  );
}
