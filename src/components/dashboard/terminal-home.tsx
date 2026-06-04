"use client";

import { BarChart, Sparkline } from "@/components/charts/sparkline";
import { formatLiveUsd, liveMarketFetchInit } from "@/lib/coingecko-client";
import { useLivePrices } from "@/hooks/use-live-prices";
import type { MarketCoin } from "@/types/market";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BarChart3,
  Database,
  Globe,
  TrendingDown,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const PRIORITY_IDS = ["bitcoin", "ethereum"];

type MarketMeta = {
  stale: boolean;
  source: "live" | "stale" | "empty";
  coinCount: number;
  ageMs: number | null;
  updatedAt: number | null;
  serverPollIntervalMs?: number;
  clientPollIntervalMs?: number;
};

function formatMarketCapTotal(cap: number) {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  return `$${cap.toLocaleString()}`;
}

function syntheticSparkline(change24h: number): number[] {
  const base = 50;
  const drift = Math.max(-15, Math.min(15, change24h));
  return Array.from({ length: 16 }, (_, i) => {
    const t = i / 15;
    return base + drift * t + Math.sin(i * 0.8) * 3;
  });
}

export function TerminalHome() {
  const { coins, meta: liveMeta, loading, connected } = useLivePrices();
  const meta = liveMeta as MarketMeta | null;
  const [alerts, setAlerts] = useState<{ id: string }[]>([]);
  const [tickAgeSec, setTickAgeSec] = useState<number | null>(null);
  const [pricePulse, setPricePulse] = useState(false);
  const prevBtcPrice = useRef<number | null>(null);

  const loadAlerts = useCallback(async () => {
    const res = await fetch("/api/alerts?limit=10", liveMarketFetchInit);
    const data = await res.json();
    setAlerts(data.alerts ?? []);
  }, []);

  useEffect(() => {
    void loadAlerts();
  }, [loadAlerts]);

  useEffect(() => {
    if (meta?.updatedAt) void loadAlerts();
  }, [meta?.updatedAt, loadAlerts]);

  useEffect(() => {
    const btc = coins.find((c) => c.id === "bitcoin");
    if (
      btc &&
      prevBtcPrice.current !== null &&
      prevBtcPrice.current !== btc.current_price
    ) {
      setPricePulse(true);
      window.setTimeout(() => setPricePulse(false), 700);
    }
    if (btc) prevBtcPrice.current = btc.current_price;
  }, [coins]);

  useEffect(() => {
    const tick = () => {
      if (meta?.updatedAt) {
        setTickAgeSec(Math.max(0, Math.floor((Date.now() - meta.updatedAt) / 1000)));
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [meta?.updatedAt]);

  const overview = useMemo(() => {
    if (!coins.length) {
      return {
        globalMarketCap: "—",
        avgChange: 0,
        tracked: 0,
      };
    }
    const totalCap = coins.reduce((s, c) => s + (c.market_cap ?? 0), 0);
    const avgChange =
      coins.reduce((s, c) => s + (c.price_change_percentage_24h ?? 0), 0) /
      coins.length;
    return {
      globalMarketCap: formatMarketCapTotal(totalCap),
      avgChange,
      tracked: coins.length,
    };
  }, [coins]);

  const terminalAssets = useMemo(() => {
    const picked = PRIORITY_IDS.map((id) => coins.find((c) => c.id === id)).filter(
      Boolean,
    ) as MarketCoin[];
    const fallback = coins.slice(0, 2);
    return (picked.length >= 2 ? picked : fallback).map((coin) => ({
      id: coin.id as string,
      pair: `${coin.symbol.toUpperCase()}/USD`,
      price: coin.current_price,
      change: coin.price_change_percentage_24h,
      status:
        coin.price_change_percentage_24h <= -2
          ? ("ALERT" as const)
          : ("STABLE" as const),
      sparkline: syntheticSparkline(coin.price_change_percentage_24h),
    }));
  }, [coins]);

  const marketChangeBars = useMemo(() => {
    return coins.slice(0, 12).map((c) => {
      const ch = c.price_change_percentage_24h ?? 0;
      return Math.max(8, Math.min(100, 50 + ch * 3));
    });
  }, [coins]);

  const sentiment =
    overview.avgChange >= 1
      ? "BULLISH"
      : overview.avgChange <= -1
        ? "BEARISH"
        : "NEUTRAL";

  const hasAlerts = alerts.length > 0;

  return (
    <div className="px-8 py-8">
      {meta?.source === "empty" && (
        <p className="mb-4 rounded-lg border border-neon-green/30 bg-neon-green/10 px-4 py-2 font-mono text-xs text-neon-green">
          Syncing live market data from CoinGecko…
        </p>
      )}
      {meta?.stale && meta.source !== "empty" && (meta.coinCount ?? 0) > 0 && (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 font-mono text-xs text-danger">
          Market feed stale — showing last cached snapshot
          {meta.ageMs != null ? ` (${Math.round(meta.ageMs / 1000)}s old)` : ""}
        </p>
      )}

      <div className="mb-8">
        <h1 className="text-4xl font-bold italic tracking-tight text-foreground md:text-5xl">
          TERMINAL ONE
        </h1>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
          Real-Time Intelligence Aggregate V4.2.0
          {meta && !loading
            ? ` · ${meta.coinCount} assets · CoinGecko every ${(meta.serverPollIntervalMs ?? 30000) / 1000}s · UI on cache update${connected ? "" : " (connecting…)"}${tickAgeSec !== null ? ` · data ${tickAgeSec}s old` : ""}`
            : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <div className="card-surface p-5 xl:col-span-3">
          <p className="mb-4 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Market Overview
          </p>
          <div className="space-y-4">
            <OverviewStat
              icon={Globe}
              label="Top 100 Market Cap"
              value={loading ? "…" : overview.globalMarketCap}
            />
            <OverviewStat
              icon={Database}
              label="Tracked Assets"
              value={loading ? "…" : String(overview.tracked)}
            />
            <OverviewStat
              icon={BarChart3}
              label="Avg 24H Change"
              value={loading ? "…" : `${overview.avgChange.toFixed(2)}%`}
              negative={overview.avgChange < 0}
            />
          </div>
        </div>

        {loading ? (
          <div className="card-surface flex items-center justify-center p-8 xl:col-span-6">
            <p className="font-mono text-sm text-muted">Syncing live market cache…</p>
          </div>
        ) : (
          terminalAssets.map((asset) => (
            <AssetPriceCard
              key={asset.id}
              asset={asset}
              pulse={pricePulse && asset.id === "bitcoin"}
            />
          ))
        )}

        <div className="card-surface flex min-h-[280px] flex-col p-5 md:col-span-2 xl:col-span-3 xl:row-span-2 xl:min-h-[340px]">
          <div className="mb-4 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-neon-green" strokeWidth={2} />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
              System Alerts Live Feed
            </p>
          </div>
          <div className="flex flex-1 items-center justify-center">
            {hasAlerts ? (
              <p className="text-sm text-muted">
                {alerts.length} recent drop{alerts.length === 1 ? "" : "s"} — see Alerts
              </p>
            ) : (
              <p className="text-center text-sm italic text-dim">
                No alerts triggered
              </p>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden card-surface p-6 md:col-span-2 xl:col-span-6">
          <Zap
            className="pointer-events-none absolute right-6 top-6 h-24 w-24 text-neon-green/5"
            strokeWidth={0.5}
          />
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted">
            Sentry Analytics
          </p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Live aggregate from top-100 cache suggests a{" "}
            <span className="font-bold text-neon-green text-glow-green">{sentiment}</span>{" "}
            bias. Server hits CoinGecko every 30s; this screen updates when new prices land.
          </p>
          <div className="mt-5 flex flex-wrap gap-4">
            <MetricPill
              label="Volatility Index"
              value={`${Math.abs(overview.avgChange).toFixed(1)}%`}
              tag={Math.abs(overview.avgChange) < 2 ? "LOW" : "ELEVATED"}
            />
            <MetricPill
              label="Assets Down 24H"
              value={`${coins.filter((c) => (c.price_change_percentage_24h ?? 0) < 0).length}`}
              tag="COUNT"
              highlight
            />
          </div>
        </div>

        <div className="card-surface p-5 md:col-span-2 xl:col-span-3">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted">
            24H Market Change
          </p>
          <p
            className={cn(
              "text-3xl font-bold",
              overview.avgChange < 0 ? "text-danger" : "text-neon-green",
            )}
          >
            {loading ? "…" : `${overview.avgChange.toFixed(2)}%`}
          </p>
          <div className="mt-4">
            <BarChart data={marketChangeBars.length ? marketChangeBars : [40, 55, 45, 60]} />
          </div>
        </div>
      </div>
    </div>
  );
}

function OverviewStat({
  icon: Icon,
  label,
  value,
  negative,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-bg-elevated">
        <Icon className="h-4 w-4 text-muted" strokeWidth={1.5} />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-dim">{label}</p>
        <p
          className={cn(
            "text-lg font-bold",
            negative ? "text-danger" : "text-foreground",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

function AssetPriceCard({
  asset,
  pulse,
}: {
  asset: {
    id: string;
    pair: string;
    price: number;
    change: number;
    status: string;
    sparkline: number[];
  };
  pulse?: boolean;
}) {
  const negative = asset.change < 0;

  return (
    <div
      className={cn(
        "card-surface p-5 xl:col-span-3 transition-shadow",
        pulse && "ring-2 ring-neon-green/60 shadow-[0_0_24px_rgba(0,255,65,0.15)]",
      )}
    >
      <div className="mb-1 flex items-start justify-between">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted">
            {asset.pair}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-2xl font-bold text-foreground md:text-3xl">
              {formatLiveUsd(asset.price)}
            </p>
            {negative && (
              <TrendingDown className="h-4 w-4 text-danger" strokeWidth={2} />
            )}
          </div>
        </div>
        <span
          className={cn(
            "rounded-md border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
            asset.status === "ALERT"
              ? "border-danger/40 text-danger"
              : "border-neon-green/40 text-neon-green",
          )}
        >
          {asset.status}
        </span>
      </div>
      <div className="mt-3 h-20">
        <Sparkline data={asset.sparkline} />
      </div>
      <p className="mt-2 text-[9px] uppercase tracking-widest text-dim">
        Live cache · {asset.change.toFixed(2)}% 24h
      </p>
    </div>
  );
}

function MetricPill({
  label,
  value,
  tag,
  highlight,
}: {
  label: string;
  value: string;
  tag: string;
  highlight?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-bg-elevated px-4 py-3">
      <p className="text-[10px] uppercase tracking-wider text-dim">{label}</p>
      <p className="mt-1 text-lg font-bold text-foreground">
        {value}{" "}
        <span
          className={cn(
            "text-sm font-semibold",
            highlight ? "text-neon-green" : "text-muted",
          )}
        >
          {tag}
        </span>
      </p>
    </div>
  );
}
