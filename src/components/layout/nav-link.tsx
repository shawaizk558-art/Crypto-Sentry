"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";
import { useLinkStatus } from "next/link";
import type { LucideIcon } from "lucide-react";

function NavPendingDot() {
  const { pending } = useLinkStatus();
  if (!pending) return null;
  return (
    <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon-cyan/70 animate-pulse-dot" />
  );
}

export function NavLink({
  href,
  label,
  icon: Icon,
  active,
  tourId,
  badge,
}: {
  href: string;
  label: string;
  icon: LucideIcon;
  active: boolean;
  tourId?: string;
  badge?: number;
}) {
  const showBadge = !active && badge != null && badge > 0;

  return (
    <Link
      href={href}
      prefetch
      data-tour={tourId}
      className={cn(
        "group relative flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-all",
        active
          ? "nav-active font-medium text-neon-cyan"
          : "text-muted hover:bg-bg-elevated/60 hover:text-foreground",
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          active ? "text-neon-cyan cyan-glow" : "group-hover:text-neon-cyan/70",
        )}
        strokeWidth={active ? 2 : 1.5}
      />
      <span className="font-medium">{label}</span>
      {active ? (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse-dot" />
      ) : showBadge ? (
        <span
          className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-neon-magenta px-1.5 font-mono text-[9px] font-bold text-bg-deep shadow-[0_0_12px_rgba(255,42,109,0.45)]"
          aria-label={`${badge} unread alerts`}
        >
          {badge > 99 ? "99+" : badge}
        </span>
      ) : (
        <NavPendingDot />
      )}
    </Link>
  );
}
