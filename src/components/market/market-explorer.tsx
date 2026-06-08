"use client";

import { OperativePageHeader } from "@/components/layout/operative-page-header";
import { useLivePrices } from "@/hooks/use-live-prices";
import {
  formatLiveUsd,
  formatMarketCap,
  liveMarketFetchInit,
} from "@/lib/coingecko-client";
import { PriceChangeCell } from "@/components/ui/price-change";
import { cn } from "@/lib/utils";
import { AlertCircle, BarChart3, Search, Star } from "lucide-react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

type Coin = {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_1h: number;
  price_change_percentage_24h: number;
  price_change_percentage_7d: number;
};

// Searchable table of top coins with watchlist toggle actions.
export function MarketExplorer() {
  const searchParams = useSearchParams();
  const { coins, meta, loading } = useLivePrices();
  const [watchIds, setWatchIds] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [stale, setStale] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setQuery(q);
  }, [searchParams]);

  // Loads the user's watchlist IDs for star toggle state.
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

  // Adds or removes a coin from the user's watchlist.
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
    <div className="page-container">
      {stale && (
        <div className="mb-4 flex items-center gap-2 rounded-sm border border-danger/30 bg-danger/5 px-4 py-2.5">
          <AlertCircle className="h-4 w-4 text-danger" />
          <p className="font-mono text-xs text-danger">
            Market cache is stale — showing last successful poll
          </p>
        </div>
      )}

      <OperativePageHeader
        icon={BarChart3}
        title="Market Explorer"
        subtitle="Top 100 by market cap · updates on server cache refresh (~60s)"
      />

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search coin…"
          className="cyber-input py-2.5 pl-10 pr-4"
        />
      </div>

      {loading ? (
        <p className="font-mono text-sm text-muted">Loading market cache…</p>
      ) : (
        <div className="card-surface overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-bg-elevated/40 font-mono text-[10px] uppercase tracking-wider text-muted">
                <th className="px-5 py-3.5">Asset</th>
                <th className="px-5 py-3.5">Price</th>
                <th className="px-5 py-3.5">1h</th>
                <th className="px-5 py-3.5">24h</th>
                <th className="px-5 py-3.5">7d</th>
                <th className="px-5 py-3.5">Market cap</th>
                <th className="px-5 py-3.5 w-12" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((coin, i) => {
                const watched = watchIds.has(coin.id);
                return (
                  <tr
                    key={coin.id}
                    className={cn(
                      "border-b border-border/40 transition-colors hover:bg-neon-cyan/[0.03]",
                      i % 2 === 0 && "bg-bg-elevated/10",
                    )}
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {coin.image ? (
                          <Image
                            src={coin.image}
                            alt=""
                            width={28}
                            height={28}
                            className="rounded-sm"
                          />
                        ) : null}
                        <div>
                          <p className="font-medium text-foreground">{coin.name}</p>
                          <p className="font-mono text-xs uppercase text-dim">
                            {coin.symbol}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-foreground">
                      {formatLiveUsd(coin.current_price)}
                    </td>
                    <td className="px-5 py-4">
                      <PriceChangeCell value={coin.price_change_percentage_1h ?? 0} />
                    </td>
                    <td className="px-5 py-4">
                      <PriceChangeCell value={coin.price_change_percentage_24h ?? 0} />
                    </td>
                    <td className="px-5 py-4">
                      <PriceChangeCell value={coin.price_change_percentage_7d ?? 0} />
                    </td>
                    <td className="px-5 py-4 font-mono text-muted">
                      {formatMarketCap(coin.market_cap)}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => void toggleWatch(coin)}
                        className={cn(
                          "rounded-sm p-1 transition-colors",
                          watched
                            ? "text-neon-yellow"
                            : "text-dim hover:text-neon-cyan",
                        )}
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
