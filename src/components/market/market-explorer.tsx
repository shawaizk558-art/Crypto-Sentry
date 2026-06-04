"use client";

import { OperativePageHeader } from "@/components/layout/operative-page-header";
import { useLivePrices } from "@/hooks/use-live-prices";
import {
  formatLiveUsd,
  formatMarketCap,
  liveMarketFetchInit,
} from "@/lib/coingecko-client";
import { BarChart3, Search, Star } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";

type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
};

export function MarketExplorer() {
  const { coins, meta, loading } = useLivePrices();
  const [watchIds, setWatchIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState("");
  const [stale, setStale] = useState(false);

  const loadWatchlist = useCallback(async () => {
    const res = await fetch("/api/watchlist", liveMarketFetchInit);
    const watch = await res.json();
    setWatchIds(new Set((watch.items ?? []).map((i: { assetId: string }) => i.assetId)));
  }, []);

  useEffect(() => {
    void loadWatchlist();
  }, [loadWatchlist]);

  useEffect(() => {
    if (meta?.updatedAt) void loadWatchlist();
  }, [meta?.updatedAt, loadWatchlist]);

  useEffect(() => {
    setStale(Boolean(meta?.stale));
  }, [meta?.stale]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return coins as Coin[];
    return (coins as Coin[]).filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.symbol.toLowerCase().includes(q),
    );
  }, [coins, query]);

  async function toggleWatch(coin: Coin) {
    if (watchIds.has(coin.id)) {
      await fetch(`/api/watchlist/${coin.id}`, { method: "DELETE" });
      setWatchIds((prev) => {
        const next = new Set(prev);
        next.delete(coin.id);
        return next;
      });
    } else {
      await fetch("/api/watchlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assetId: coin.id, assetName: coin.name }),
      });
      setWatchIds((prev) => new Set(prev).add(coin.id));
    }
  }

  return (
    <div className="px-8 py-8">
      {stale && (
        <p className="mb-4 rounded-lg border border-danger/30 bg-danger/10 px-4 py-2 font-mono text-xs text-danger">
          Market cache is stale — showing last successful poll
        </p>
      )}

      <OperativePageHeader
        icon={BarChart3}
        title="MARKET EXPLORER"
        subtitle="Top 100 by market cap · updates when server cache refreshes (~30s)"
      />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search coin…"
          className="w-full rounded-xl border border-border bg-bg-elevated py-2.5 pl-10 pr-4 text-sm text-foreground placeholder:text-dim focus:border-neon-green/40 focus:outline-none"
        />
      </div>

      {loading ? (
        <p className="font-mono text-sm text-muted">Loading market cache…</p>
      ) : (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border font-mono text-[10px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3">Asset</th>
                <th className="px-5 py-3">Price</th>
                <th className="px-5 py-3">24h</th>
                <th className="px-5 py-3">Market cap</th>
                <th className="px-5 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((coin) => {
                const negative = (coin.price_change_percentage_24h ?? 0) < 0;
                const watched = watchIds.has(coin.id);
                return (
                  <tr
                    key={coin.id}
                    className="border-b border-border/60 transition-colors hover:bg-bg-elevated/40"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {coin.image ? (
                          <Image
                            src={coin.image}
                            alt=""
                            width={28}
                            height={28}
                            className="rounded-full"
                          />
                        ) : null}
                        <div>
                          <p className="font-semibold text-foreground">{coin.name}</p>
                          <p className="font-mono text-xs uppercase text-muted">
                            {coin.symbol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-foreground">
                      {formatLiveUsd(coin.current_price)}
                    </td>
                    <td
                      className={`px-5 py-4 font-mono font-semibold ${negative ? "text-danger" : "text-neon-green"}`}
                    >
                      {coin.price_change_percentage_24h?.toFixed(2)}%
                    </td>
                    <td className="px-5 py-4 font-mono text-muted">
                      {formatMarketCap(coin.market_cap)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => void toggleWatch(coin)}
                        className={watched ? "text-neon-green" : "text-muted hover:text-neon-green"}
                        aria-label={watched ? "Remove from watchlist" : "Add to watchlist"}
                      >
                        <Star
                          className="h-4 w-4"
                          fill={watched ? "currentColor" : "none"}
                        />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
