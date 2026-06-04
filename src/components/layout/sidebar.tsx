"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  LayoutDashboard,
  LogOut,
  Settings,
  Shield,
  Star,
  User,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/market", label: "Market Data", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const name = session?.user?.name ?? "Operative";
  const email = session?.user?.email ?? "";
  const image = session?.user?.image;

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[220px] flex-col border-r border-border bg-bg-panel">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neon-green/10">
          <Shield className="h-5 w-5 text-neon-green" strokeWidth={2} />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide text-foreground">BITBASH</p>
          <p className="text-[10px] font-medium tracking-wider text-muted">
            SENTRY V4
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "nav-active font-medium text-neon-green"
                  : "text-muted hover:bg-bg-elevated hover:text-foreground",
              )}
            >
              <Icon
                className={cn("h-4 w-4 shrink-0", active ? "text-neon-green" : "")}
                strokeWidth={active ? 2 : 1.5}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 rounded-xl bg-bg-elevated px-3 py-3">
          <UserAvatar src={image} name={name} email={email} size="sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold uppercase text-foreground">
              {(name.split(" ")[0] ?? name).toUpperCase()}
            </p>
            <p className="truncate text-[10px] text-muted">{email}</p>
          </div>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            className="text-muted transition-colors hover:text-danger"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
