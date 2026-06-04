"use client";

import { OperativePageHeader } from "@/components/layout/operative-page-header";
import { useLivePrices } from "@/hooks/use-live-prices";
import { formatLiveUsd, liveMarketFetchInit } from "@/lib/coingecko-client";
import { ExternalLink, Star, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

type WatchlistItem = {
  id: string;
  assetId: string;
  assetName: string;
  symbol: string;
  image: string;
  lastPrice: number;
  change24h: number;
};

export function WatchlistView() {
  const { coins, meta } = useLivePrices();
  const [rows, setRows] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  const priceById = useMemo(
    () => new Map(coins.map((c) => [c.id, c])),
    [coins],
  );

  const loadWatchlist = useCallback(async () => {
    const res = await fetch("/api/watchlist", liveMarketFetchInit);
    const data = await res.json();
    setRows(data.items ?? []);
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
        change24h: coin?.price_change_percentage_24h ?? row.change24h,
      };
    });
  }, [rows, priceById]);

  async function remove(assetId: string) {
    await fetch(`/api/watchlist/${assetId}`, { method: "DELETE" });
    setRows((prev) => prev.filter((i) => i.assetId !== assetId));
  }

  return (
    <div className="px-8 py-8">
      <OperativePageHeader
        icon={Star}
        title="MY WATCHLIST"
        subtitle="Prices refresh when server cache updates (~30s)"
        action={
          <Link
            href="/market"
            className="rounded-xl border border-neon-green/40 bg-neon-green/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-neon-green hover:bg-neon-green/20"
          >
            Add assets
          </Link>
        }
      />

      {loading ? (
        <p className="font-mono text-sm text-muted">Loading watchlist…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-muted">No assets on your watchlist yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const negative = item.change24h < 0;
            return (
              <div key={item.id} className="card-surface p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                    ) : null}
                    <div>
                      <p className="font-semibold text-foreground">{item.assetName}</p>
                      <p className="font-mono text-xs text-muted">{item.symbol}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => void remove(item.assetId)}
                    className="text-muted hover:text-danger"
                    aria-label="Remove"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <p className="mt-4 text-2xl font-bold text-foreground">
                  {formatLiveUsd(item.lastPrice)}
                </p>
                <p
                  className={`mt-1 font-mono text-sm ${negative ? "text-danger" : "text-neon-green"}`}
                >
                  {item.change24h.toFixed(2)}% 24h
                </p>
                <Link
                  href={`/market`}
                  className="mt-3 inline-flex items-center gap-1 text-xs text-neon-green hover:underline"
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
