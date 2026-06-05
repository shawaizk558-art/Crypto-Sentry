"use client";

import { UserAvatar } from "@/components/ui/user-avatar";
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
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/watchlist", label: "Watchlist", icon: Star },
  { href: "/alerts", label: "Alerts", icon: Bell },
  { href: "/market", label: "Market", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
  { href: "/settings", label: "Settings", icon: Settings },
];

type SidebarUser = {
  email: string;
  name: string;
  avatarUrl: string | null;
};

export function Sidebar({ user }: { user: SidebarUser | null }) {
  const pathname = usePathname();
  const router = useRouter();

  async function signOut() {
    await fetch("/auth/signout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-border bg-bg-panel/90 backdrop-blur-xl">
      <div
        className="absolute right-0 top-0 h-24 w-px"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,240,255,0.5), rgba(255,42,109,0.3), transparent)",
        }}
      />

      <div className="flex items-center gap-3 px-5 py-6">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-sm border border-neon-cyan/30 bg-neon-cyan/10">
          <Shield className="h-5 w-5 text-neon-cyan cyan-glow" strokeWidth={2} />
          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-neon-magenta animate-pulse-dot" />
        </div>
        <div>
          <p className="font-display text-sm font-bold tracking-widest text-foreground">
            CRYPTO
          </p>
          <p className="font-display text-[10px] font-semibold tracking-[0.3em] text-neon-cyan text-glow-cyan">
            SENTRY
          </p>
        </div>
      </div>

      <div className="mx-4 mb-4 border-t border-border" />

      <nav className="flex-1 space-y-1 px-3">
        <p className="mb-2 px-3 font-mono text-[9px] uppercase tracking-[0.25em] text-dim">
          Navigation
        </p>
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-all",
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
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-neon-cyan animate-pulse-dot" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        {user ? (
          <div className="card-surface flex items-center gap-3 px-3 py-3">
            <UserAvatar
              src={user.avatarUrl}
              name={user.name}
              email={user.email}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate font-mono text-[10px] font-semibold uppercase text-foreground">
                {(user.name.split(" ")[0] ?? user.name).toUpperCase()}
              </p>
              <p className="truncate text-[9px] text-dim">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => void signOut()}
              className="text-muted transition-colors hover:text-neon-magenta"
              aria-label="Sign out"
            >
              <LogOut className="h-4 w-4" strokeWidth={1.5} />
            </button>
          </div>
        ) : (
          <Link
            href="/auth/login"
            className="cyber-btn-primary block w-full py-3 text-center text-xs"
          >
            Sign in
          </Link>
        )}
      </div>
    </aside>
  );
}
