"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
import { Search } from "lucide-react";

export function TopBar({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {

  return (
    <header className="sticky top-0 z-30 flex items-center gap-6 border-b border-border bg-bg-deep/70 px-6 py-3.5 backdrop-blur-xl md:px-8 lg:px-10">
      <div className="relative max-w-xl flex-1">
        <Search
          className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim"
          strokeWidth={1.5}
        />
        <input
          type="search"
          placeholder="Search assets, protocols, TX IDs..."
          className="cyber-input py-2.5 pl-10 pr-4"
        />
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-6">
        <div className="hidden items-center gap-2.5 rounded-sm border border-border bg-bg-card/60 px-3 py-1.5 sm:flex">
          <span className="h-2 w-2 rounded-full bg-neon-green animate-pulse-dot" />
          <span className="font-mono text-[9px] uppercase tracking-widest text-dim">
            Net:
          </span>
          <span className="font-mono text-[9px] font-semibold uppercase tracking-widest text-neon-green">
            Online
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right md:block">
            <p className="font-mono text-[9px] uppercase tracking-widest text-dim">
              Operative
            </p>
            <p className="text-sm font-medium text-foreground">{name}</p>
          </div>
          <div className="relative">
            <UserAvatar
              src={avatarUrl}
              name={name}
              size="sm"
              className="h-8 w-8 text-xs"
            />
            <span className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full border border-bg-deep bg-neon-green" />
          </div>
        </div>
      </div>
    </header>
  );
}
