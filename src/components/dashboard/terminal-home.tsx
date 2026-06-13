"use client";

import { BarChart, Sparkline } from "@/components/charts/sparkline";
import { PriceChangePills } from "@/components/ui/price-change";
import { formatLiveUsd, liveMarketFetchInit } from "@/lib/coingecko-client";
import { useLivePrices } from "@/hooks/use-live-prices";
import type { MarketCoin } from "@/types/market";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  BarChart3,
  Database,
  Globe,
  Radio,
  TrendingDown,
  TrendingUp,
  Zap,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
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

// Show total market cap, e.g. $2.5T.
function formatMarketCapTotal(cap: number) {
  if (cap >= 1e12) return `$${(cap / 1e12).toFixed(2)}T`;
  if (cap >= 1e9) return `$${(cap / 1e9).toFixed(2)}B`;
  return `$${cap.toLocaleString()}`;
}

// Fake mini-chart points based on 24h change.
function syntheticSparkline(change24h: number): number[] {
  const base = 50;
  const drift = Math.max(-15, Math.min(15, change24h));
  return Array.from({ length: 16 }, (_, i) => {
    const t = i / 15;
    return base + drift * t + Math.sin(i * 0.8) * 3;
  });
}

// Home page: live BTC/ETH prices, market stats, alerts.
export function TerminalHome() {
  const { coins, meta: liveMeta, loading, connected } = useLivePrices();
  const meta = liveMeta as MarketMeta | null;
  const [alerts, setAlerts] = useState<{ id: string }[]>([]);
  const [tickAgeSec, setTickAgeSec] = useState<number | null>(null);
  const [pricePulse, setPricePulse] = useState(false);
  const prevBtcPrice = useRef<number | null>(null);

  // Load recent alerts for the dashboard.
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
      change1h: coin.price_change_percentage_1h,
      change24h: coin.price_change_percentage_24h,
      change7d: coin.price_change_percentage_7d,
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
  const assetsDown = coins.filter((c) => (c.price_change_percentage_24h ?? 0) < 0).length;

  return (
    <div className="page-container">
      {meta?.source === "empty" && (
        <div className="mb-4 flex items-center gap-2 rounded-sm border border-neon-cyan/30 bg-neon-cyan/5 px-4 py-2.5">
          <Radio className="h-4 w-4 animate-pulse text-neon-cyan" />
          <p className="font-mono text-xs text-neon-cyan">
            Syncing live market data from CoinGecko…
          </p>
        </div>
      )}
      {meta?.stale && meta.source !== "empty" && (meta.coinCount ?? 0) > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-sm border border-danger/30 bg-danger/5 px-4 py-2.5">
          <AlertCircle className="h-4 w-4 text-danger" />
          <p className="font-mono text-xs text-danger">
            Market feed stale — showing last cached snapshot
            {meta.ageMs != null ? ` (${Math.round(meta.ageMs / 1000)}s old)` : ""}
          </p>
        </div>
      )}

      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <span className="h-px flex-1 bg-gradient-to-r from-neon-cyan/50 to-transparent" />
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-neon-cyan">
            Command Center
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-neon-magenta/50 to-transparent" />
        </div>
        <h1 className="font-display text-3xl font-bold uppercase tracking-wider text-foreground md:text-4xl">
          Dashboard
        </h1>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
          Real-time intelligence aggregate
          {meta && !loading
            ? ` · ${meta.coinCount} assets · poll ${(meta.serverPollIntervalMs ?? 60000) / 1000}s${connected ? "" : " · connecting…"}${tickAgeSec !== null ? ` · data ${tickAgeSec}s old` : ""}`
            : ""}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
        <div className="card-surface p-5 xl:col-span-3" data-tour="market-overview">
          <p className="data-label mb-4">Market Overview</p>
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

        {loading && terminalAssets.length === 0 ? (
          <div className="card-surface flex items-center justify-center p-8 xl:col-span-6">
            <div className="text-center">
              <Radio className="mx-auto mb-3 h-6 w-6 animate-pulse text-neon-cyan" />
              <p className="font-mono text-sm text-muted">Syncing live market cache…</p>
            </div>
          </div>
        ) : (
          terminalAssets.map((asset) => (
            <AssetPriceCard
              key={asset.id}
              asset={asset}
              pulse={pricePulse && asset.id === "bitcoin"}
              tourTarget={asset.id === "bitcoin"}
            />
          ))
        )}

        <div className="card-surface flex min-h-[280px] flex-col p-5 md:col-span-2 xl:col-span-3 xl:row-span-2 xl:min-h-[340px]">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-neon-magenta" strokeWidth={2} />
              <p className="data-label">Alert Feed</p>
            </div>
            <Link
              href="/alerts"
              className="font-mono text-[9px] uppercase tracking-wider text-neon-cyan hover:underline"
            >
              View all →
            </Link>
          </div>
          <div className="flex flex-1 flex-col items-center justify-center gap-3">
            {hasAlerts ? (
              <>
                <p className="font-display text-4xl font-bold text-neon-magenta text-glow-magenta">
                  {alerts.length}
                </p>
                <p className="text-center text-sm text-muted">
                  Recent drop{alerts.length === 1 ? "" : "s"} detected
                </p>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-sm border border-border bg-bg-elevated">
                  <Zap className="h-5 w-5 text-dim" />
                </div>
                <p className="text-center text-sm text-dim">No alerts triggered</p>
              </>
            )}
          </div>
        </div>

        <div className="relative overflow-hidden card-surface card-glow-cyan p-6 md:col-span-2 xl:col-span-6">
          <Zap
            className="pointer-events-none absolute right-6 top-6 h-24 w-24 text-neon-cyan/5"
            strokeWidth={0.5}
          />
          <p className="data-label mb-3">Sentry Analytics</p>
          <p className="max-w-2xl text-sm leading-relaxed text-muted">
            Live aggregate from top-100 cache suggests a{" "}
            <span
              className={cn(
                "font-display font-bold uppercase",
                sentiment === "BULLISH"
                  ? "text-neon-green text-glow-green"
                  : sentiment === "BEARISH"
                    ? "text-neon-magenta text-glow-magenta"
                    : "text-neon-cyan text-glow-cyan",
              )}
            >
              {sentiment}
            </span>{" "}
            bias. Server polls CoinGecko every 60s; this screen updates on new prices.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <MetricPill
              label="Volatility Index"
              value={`${Math.abs(overview.avgChange).toFixed(1)}%`}
              tag={Math.abs(overview.avgChange) < 2 ? "LOW" : "ELEVATED"}
            />
            <MetricPill
              label="Assets Down 24H"
              value={`${assetsDown}`}
              tag="COUNT"
              highlight
            />
          </div>
        </div>

        <div className="card-surface p-5 md:col-span-2 xl:col-span-3">
          <p className="data-label mb-2">24H Market Change</p>
          <div className="flex items-center gap-2">
            <p
              className={cn(
                "font-display text-3xl font-bold",
                overview.avgChange < 0 ? "text-neon-magenta text-glow-magenta" : "text-neon-green text-glow-green",
              )}
            >
              {loading ? "…" : `${overview.avgChange.toFixed(2)}%`}
            </p>
            {overview.avgChange < 0 ? (
              <TrendingDown className="h-5 w-5 text-neon-magenta" />
            ) : (
              <TrendingUp className="h-5 w-5 text-neon-green" />
            )}
          </div>
          <div className="mt-4">
            <BarChart data={marketChangeBars.length ? marketChangeBars : [40, 55, 45, 60]} />
          </div>
        </div>
      </div>
    </div>
  );
}

// One stat box with icon, label, and value.
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
      <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-bg-elevated">
        <Icon className="h-4 w-4 text-neon-cyan/70" strokeWidth={1.5} />
      </div>
      <div>
        <p className="font-mono text-[9px] uppercase tracking-wider text-dim">{label}</p>
        <p
          className={cn(
            "font-mono text-lg font-bold",
            negative ? "text-neon-magenta" : "text-foreground",
          )}
        >
          {value}
        </p>
      </div>
    </div>
  );
}

// Big price card for BTC or ETH.
function AssetPriceCard({
  asset,
  pulse,
  tourTarget,
}: {
  asset: {
    id: string;
    pair: string;
    price: number;
    change1h: number;
    change24h: number;
    change7d: number;
    status: "STABLE" | "ALERT";
    sparkline: number[];
  };
  pulse?: boolean;
  tourTarget?: boolean;
}) {
  const negative = asset.change24h < 0;

  return (
    <div
      data-tour={tourTarget ? "price-surveillance" : undefined}
      className={cn(
        "card-surface min-h-[228px] p-6 xl:col-span-3 transition-all",
        pulse && "card-glow-cyan ring-1 ring-neon-cyan/40",
        asset.status === "ALERT" && "card-glow-danger",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="data-label">{asset.pair}</p>
        <div
          className={cn(
            "shrink-0 rounded-sm border border-border bg-bg-elevated/50 px-2.5 py-1.5",
            asset.status === "ALERT"
              ? "border-neon-magenta/30"
              : "border-neon-green/30",
          )}
        >
          <p
            className={cn(
              "font-mono text-[10px] font-bold uppercase tracking-wider",
              asset.status === "ALERT" ? "text-neon-magenta" : "text-neon-green",
            )}
          >
            {asset.status}
          </p>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2">
        <p className="font-mono text-2xl font-bold text-foreground md:text-3xl">
          {formatLiveUsd(asset.price)}
        </p>
        {negative ? (
          <TrendingDown className="h-4 w-4 text-neon-magenta" strokeWidth={2} />
        ) : (
          <TrendingUp className="h-4 w-4 text-neon-green" strokeWidth={2} />
        )}
      </div>

      <div className="mt-4 h-20">
        <Sparkline data={asset.sparkline} positive={!negative} />
      </div>
      <PriceChangePills
        className="mt-3"
        changes={{
          change1h: asset.change1h,
          change24h: asset.change24h,
          change7d: asset.change7d,
        }}
      />
    </div>
  );
}

// Small labeled stat pill.
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
    <div className="rounded-sm border border-border bg-bg-elevated/60 px-4 py-3">
      <p className="font-mono text-[9px] uppercase tracking-wider text-dim">{label}</p>
      <p className="mt-1 font-mono text-lg font-bold text-foreground">
        {value}{" "}
        <span
          className={cn(
            "text-sm font-semibold",
            highlight ? "text-neon-cyan" : "text-muted",
          )}
        >
          {tag}
        </span>
      </p>
    </div>
  );
}
