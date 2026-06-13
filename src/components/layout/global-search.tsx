"use client";

import { useLivePrices } from "@/hooks/use-live-prices";
import { cn, formatUsd } from "@/lib/utils";
import type { MarketCoin } from "@/types/market";
import { Search, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

type CoinSearchResult = Pick<
  MarketCoin,
  "id" | "name" | "symbol" | "image" | "current_price"
>;

// One row in the search dropdown.
function ResultRow({
  result,
  rank,
  active,
  onSelect,
}: {
  result: CoinSearchResult;
  rank: number;
  active: boolean;
  onSelect: (result: CoinSearchResult) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
        active ? "bg-neon-cyan/10" : "hover:bg-neon-cyan/[0.06]",
      )}
    >
      {result.image ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={result.image}
          alt=""
          className="h-7 w-7 rounded-full border border-border/60"
        />
      ) : (
        <div className="flex h-7 w-7 items-center justify-center rounded-full border border-neon-cyan/30 bg-neon-cyan/5 font-mono text-[9px] font-bold text-neon-cyan">
          {result.symbol.slice(0, 3)}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{result.name}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
          {result.symbol.toUpperCase()} · #{rank}
        </p>
      </div>
      {result.current_price > 0 ? (
        <span className="font-mono text-xs text-muted">
          {formatUsd(result.current_price)}
        </span>
      ) : (
        <TrendingUp className="h-3.5 w-3.5 text-dim" strokeWidth={1.5} />
      )}
    </button>
  );
}

function scoreCoin(coin: MarketCoin, q: string) {
  const name = coin.name.toLowerCase();
  const symbol = coin.symbol.toLowerCase();
  const id = coin.id.toLowerCase();

  const nameStarts = name.startsWith(q);
  const symbolStarts = symbol.startsWith(q);
  const idStarts = id.startsWith(q);
  const contains = name.includes(q) || symbol.includes(q) || id.includes(q);

  if (!nameStarts && !symbolStarts && !idStarts && !contains) return null;

  return (
    (nameStarts ? 4 : 0) +
    (symbolStarts ? 3 : 0) +
    (idStarts ? 2 : 0) +
    (contains ? 1 : 0)
  );
}

// Top-bar search over the live top-100 market list.
export function GlobalSearch() {
  const router = useRouter();
  const { coins, loading } = useLivePrices();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    return coins
      .map((coin, index) => {
        const score = scoreCoin(coin, q);
        return score != null ? { coin, score, rank: index + 1 } : null;
      })
      .filter((row): row is { coin: MarketCoin; score: number; rank: number } => row !== null)
      .sort((a, b) => b.score - a.score || a.rank - b.rank)
      .slice(0, 10);
  }, [coins, query]);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function handleSelect(result: CoinSearchResult) {
    setOpen(false);
    setActiveIndex(-1);
    setQuery("");
    router.push(`/market?coin=${encodeURIComponent(result.id)}`);
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      if (results.length === 0) return;
      setActiveIndex((prev) => Math.min(prev + 1, results.length - 1));
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => Math.max(prev - 1, 0));
      return;
    }

    if (event.key === "Enter" && activeIndex >= 0 && results[activeIndex]) {
      event.preventDefault();
      handleSelect(results[activeIndex].coin);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const showPanel = open && query.trim().length > 0;

  return (
    <div ref={rootRef} className="relative max-w-xl flex-1">
      <Search
        className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim"
        strokeWidth={1.5}
      />
      <input
        type="search"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setOpen(true);
          setActiveIndex(-1);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        placeholder="Search top 100 coins…"
        className="cyber-input py-2.5 pl-10 pr-4"
        autoComplete="off"
        spellCheck={false}
      />

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-sm border border-border bg-bg-deep/95 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {loading && coins.length === 0 ? (
            <p className="px-4 py-3 font-mono text-xs text-muted">Loading market data…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-dim">
              No top-100 matches for &ldquo;{query.trim()}&rdquo;
            </p>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1">
              <p className="px-4 pb-1 pt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
                Top 100
              </p>
              {results.map(({ coin, rank }, index) => (
                <ResultRow
                  key={coin.id}
                  result={coin}
                  rank={rank}
                  active={index === activeIndex}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
