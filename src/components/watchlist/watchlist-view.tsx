"use client";

import { OperativePageHeader } from "@/components/layout/operative-page-header";
import { SkeletonBlock } from "@/components/ui/content-skeleton";
import { PriceChangePills } from "@/components/ui/price-change";
import { useLivePrices } from "@/hooks/use-live-prices";
import { formatLiveUsd, liveMarketFetchInit } from "@/lib/coingecko-client";
import { cn } from "@/lib/utils";
import { ExternalLink, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  readCache,
  WATCHLIST_CACHE_KEY,
  watchlistStore,
  writeCache,
} from "@/lib/client-cache";
import { useCallback, useEffect, useMemo, useState } from "react";

type WatchlistItem = {
  id: string;
  assetId: string;
  assetName: string;
  symbol: string;
  image: string;
  lastPrice: number;
  change1h: number;
  change24h: number;
  change7d: number;
};

// Displays the user's watchlist with live price updates.
export function WatchlistView() {
  const { coins, meta } = useLivePrices();
  const cachedRows = readCache<WatchlistItem[]>(watchlistStore, WATCHLIST_CACHE_KEY);
  const [rows, setRows] = useState<WatchlistItem[]>(cachedRows ?? []);
  const [loading, setLoading] = useState(!cachedRows);

  const priceById = useMemo(
    () => new Map(coins.map((c) => [c.id, c])),
    [coins],
  );

  // Fetches watchlist rows from the API.
  const loadWatchlist = useCallback(async () => {
    const res = await fetch("/api/watchlist", liveMarketFetchInit);
    const data = await res.json();
    const items = data.items ?? [];
    setRows(items);
    writeCache(watchlistStore, WATCHLIST_CACHE_KEY, items);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadWatchlist();
  }, [loadWatchlist]);

  useEffect(() => {
    if (meta?.updatedAt) void loadWatchlist();
  }, [meta?.updatedAt, loadWatchlist]);

  const items = useMemo(() => {
    return rows.map((row) => {
      const coin = priceById.get(row.assetId);
      return {
        ...row,
        symbol: coin?.symbol?.toUpperCase() ?? row.symbol,
        image: coin?.image ?? row.image,
        lastPrice: coin?.current_price ?? row.lastPrice,
        change1h: coin?.price_change_percentage_1h ?? row.change1h ?? 0,
        change24h: coin?.price_change_percentage_24h ?? row.change24h ?? 0,
        change7d: coin?.price_change_percentage_7d ?? row.change7d ?? 0,
      };
    });
  }, [rows, priceById]);

  // Removes an asset from the watchlist via the API.
  async function remove(assetId: string) {
    await fetch(`/api/watchlist/${assetId}`, { method: "DELETE" });
    setRows((prev) => prev.filter((i) => i.assetId !== assetId));
  }

  return (
    <div className="page-container">
      <OperativePageHeader
        icon={Star}
        title="Watchlist"
        subtitle="Prices refresh when server cache updates (~60s)"
        action={
          <Link href="/market" className="cyber-btn-primary px-4 py-2.5 text-xs">
            Add assets
          </Link>
        }
      />

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy>
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="card-surface space-y-4 p-5">
              <div className="flex items-center gap-3">
                <SkeletonBlock className="h-10 w-10 rounded-sm" />
                <div className="flex-1 space-y-2">
                  <SkeletonBlock className="h-4 w-24" />
                  <SkeletonBlock className="h-3 w-12" />
                </div>
              </div>
              <SkeletonBlock className="h-8 w-32" />
              <SkeletonBlock className="h-4 w-full" />
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="card-surface flex flex-col items-center justify-center p-12 text-center">
          <Star className="mb-4 h-10 w-10 text-dim" />
          <p className="text-sm text-muted">No assets on your watchlist yet.</p>
          <Link href="/market" className="mt-4 cyber-btn-primary px-6 py-2.5 text-xs">
            Browse market
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const negative = item.change24h < 0;
            return (
              <div
                key={item.id}
                className={cn(
                  "card-surface p-5 transition-all hover:border-neon-cyan/20",
                  negative && "card-glow-danger",
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-sm"
                      />
                    ) : null}
                    <div>
                      <p className="font-medium text-foreground">{item.assetName}</p>
                      <p className="font-mono text-xs text-dim">{item.symbol}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void remove(item.assetId)}
                    className="rounded-sm p-1 text-dim transition-colors hover:bg-danger/10 hover:text-danger"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 font-mono text-2xl font-bold text-foreground">
                  {formatLiveUsd(item.lastPrice)}
                </p>
                <PriceChangePills
                  className="mt-3"
                  changes={{
                    change1h: item.change1h,
                    change24h: item.change24h,
                    change7d: item.change7d,
                  }}
                />
                <Link
                  href="/market"
                  className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-neon-cyan hover:underline"
                >
                  View in market <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
