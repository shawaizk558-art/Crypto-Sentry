"use client";

import { AlertCard } from "@/components/alerts/alert-card";
import { SkeletonBlock } from "@/components/ui/content-skeleton";
import { StatCard } from "@/components/alerts/stat-card";
import { PageHeader } from "@/components/layout/header";
import { Panel, PanelHeader } from "@/components/ui/card";
import { liveMarketFetchInit } from "@/lib/coingecko-client";
import { useLivePrices } from "@/hooks/use-live-prices";
import type { CryptoAlertItem } from "@/types/alerts";
import { cn } from "@/lib/utils";
import { AlertOctagon, Check, ChevronDown, Filter, TrendingDown } from "lucide-react";
import Link from "next/link";
import {
  alertsStore,
  ALERTS_CACHE_KEY,
  ALERTS_WATCHLIST_CACHE_KEY,
  readCache,
  writeCache,
} from "@/lib/client-cache";
import { useCallback, useEffect, useRef, useState } from "react";

type AlertScope = "all" | "watchlist";

const SCOPE_OPTIONS: { value: AlertScope; label: string; description: string }[] = [
  { value: "all", label: "All market", description: "Every detected drop" },
  { value: "watchlist", label: "Watchlist", description: "Your saved coins only" },
];

// Alert log page — loads flash-crash alerts and refreshes when prices update.
export function AlertsFeed() {
  const { meta } = useLivePrices();
  const [scope, setScope] = useState<AlertScope>("all");
  const [menuOpen, setMenuOpen] = useState(false);
  const [watchlistEmpty, setWatchlistEmpty] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const watchlistOnly = scope === "watchlist";
  const cacheKey = watchlistOnly ? ALERTS_WATCHLIST_CACHE_KEY : ALERTS_CACHE_KEY;
  const cachedAlerts = readCache<CryptoAlertItem[]>(alertsStore, cacheKey);
  const [alerts, setAlerts] = useState<CryptoAlertItem[]>(cachedAlerts ?? []);
  const [loading, setLoading] = useState(!cachedAlerts);
  const activeOption = SCOPE_OPTIONS.find((option) => option.value === scope)!;

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  // Fetch the latest alerts from the API.
  const load = useCallback(async () => {
    const params = new URLSearchParams({ limit: "50" });
    if (watchlistOnly) params.set("watchlistOnly", "true");

    const res = await fetch(`/api/alerts?${params}`, liveMarketFetchInit);
    const data = await res.json();
    const next = data.alerts ?? [];
    setWatchlistEmpty(Boolean(data.watchlistEmpty));
    setAlerts(next);
    writeCache(alertsStore, cacheKey, next);
    setLoading(false);
  }, [cacheKey, watchlistOnly]);

  useEffect(() => {
    const cached = readCache<CryptoAlertItem[]>(alertsStore, cacheKey);
    setAlerts(cached ?? []);
    setWatchlistEmpty(false);
    setLoading(true);
    void load();
  }, [cacheKey, load]);

  useEffect(() => {
    if (meta?.updatedAt) void load();
  }, [meta?.updatedAt, load]);

  const critical = alerts.filter((a) => a.severity === "critical").length;
  const high = alerts.filter((a) => a.severity === "high").length;

  return (
    <div className="page-container">
      <PageHeader
        title="Alert Log"
        description="Flash-crash alerts saved while you were away — refreshed when prices update."
        action={
          <div ref={menuRef} className="relative">
            <button
              type="button"
              aria-haspopup="listbox"
              aria-expanded={menuOpen}
              title={`Showing ${activeOption.label.toLowerCase()} alerts`}
              onClick={() => setMenuOpen((open) => !open)}
              className={cn(
                "inline-flex items-center gap-2 rounded-sm border px-4 py-2 font-mono text-[10px] uppercase tracking-widest transition-colors",
                watchlistOnly
                  ? "border-neon-cyan/40 bg-neon-cyan/10 text-neon-cyan"
                  : "border-border bg-bg-elevated text-muted hover:border-glow hover:text-foreground",
              )}
            >
              <Filter className="h-3.5 w-3.5" strokeWidth={1.5} />
              {activeOption.label}
              <ChevronDown
                className={cn("h-3.5 w-3.5 transition-transform", menuOpen && "rotate-180")}
                strokeWidth={1.5}
              />
            </button>

            {menuOpen && (
              <div
                role="listbox"
                aria-label="Alert scope"
                className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[14rem] overflow-hidden rounded-sm border border-border bg-bg-deep/95 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl"
              >
                {SCOPE_OPTIONS.map((option) => {
                  const selected = option.value === scope;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        setScope(option.value);
                        setMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                        selected ? "bg-neon-cyan/10" : "hover:bg-neon-cyan/[0.06]",
                      )}
                    >
                      <Check
                        className={cn(
                          "mt-0.5 h-3.5 w-3.5 shrink-0",
                          selected ? "text-neon-cyan" : "text-transparent",
                        )}
                        strokeWidth={2}
                      />
                      <span>
                        <span className="block font-mono text-[10px] uppercase tracking-widest text-foreground">
                          {option.label}
                        </span>
                        <span className="mt-0.5 block text-xs text-dim">{option.description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        }
      />

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total alerts"
          value={loading ? "…" : alerts.length}
          icon={TrendingDown}
          variant="cyan"
        />
        <StatCard
          label="Critical"
          value={loading ? "…" : critical}
          icon={AlertOctagon}
          variant="danger"
        />
        <StatCard
          label="High severity"
          value={loading ? "…" : high}
          icon={AlertOctagon}
          variant="magenta"
        />
      </section>

      <Panel urgent>
        <PanelHeader
          title={watchlistOnly ? "Watchlist drops" : "All detected drops"}
          subtitle={
            watchlistOnly
              ? "Only coins on your watchlist — newest first"
              : "Sorted by detection time — newest first"
          }
        />
        <div>
          {loading ? (
            <div className="space-y-0 px-5 py-4" aria-busy>
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex gap-4 border-b border-border/60 py-4 last:border-b-0">
                  <SkeletonBlock className="h-10 w-10 shrink-0 rounded-sm" />
                  <div className="min-w-0 flex-1 space-y-2">
                    <SkeletonBlock className="h-4 w-40" />
                    <SkeletonBlock className="h-3 w-full max-w-md" />
                  </div>
                  <SkeletonBlock className="hidden h-4 w-16 sm:block" />
                </div>
              ))}
            </div>
          ) : watchlistOnly && watchlistEmpty ? (
            <div className="px-5 py-10 text-center">
              <p className="text-sm text-muted">
                Please add coins to your watchlist first.
              </p>
              <Link
                href="/market"
                className="mt-3 inline-flex font-mono text-[10px] uppercase tracking-widest text-neon-cyan transition-colors hover:text-neon-cyan/80"
              >
                Browse market →
              </Link>
            </div>
          ) : alerts.length === 0 ? (
            <p className="px-5 py-8 text-sm italic text-dim">
              {watchlistOnly
                ? "No drops detected for your watchlist yet"
                : "No drops detected yet"}
            </p>
          ) : (
            alerts.map((alert, i) => (
              <AlertCard key={alert.id} alert={alert} index={i} />
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
