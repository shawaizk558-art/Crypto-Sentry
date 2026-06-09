"use client";

import { liveMarketFetchInit } from "@/lib/coingecko-client";
import { cn, formatUsd } from "@/lib/utils";
import type { SearchResponse, SearchResult } from "@/types/search";
import { ExternalLink, Layers, Search, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

// Heading text for each result group in the dropdown (Assets, Protocols, etc.).
function groupLabel(type: SearchResult["type"]) {
  if (type === "asset") return "Assets";
  if (type === "protocol") return "Protocols";
  return "Transactions";
}

// One row in the search dropdown — shows asset, protocol, or transaction info.
function ResultRow({
  result,
  active,
  onSelect,
}: {
  result: SearchResult;
  active: boolean;
  onSelect: (result: SearchResult) => void;
}) {
  if (result.type === "asset") {
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
            {result.symbol}
            {result.marketCapRank ? ` · #${result.marketCapRank}` : ""}
          </p>
        </div>
        {result.price != null && result.price > 0 ? (
          <span className="font-mono text-xs text-muted">{formatUsd(result.price)}</span>
        ) : (
          <TrendingUp className="h-3.5 w-3.5 text-dim" strokeWidth={1.5} />
        )}
      </button>
    );
  }

  if (result.type === "protocol") {
    return (
      <button
        type="button"
        onClick={() => onSelect(result)}
        className={cn(
          "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
          active ? "bg-neon-cyan/10" : "hover:bg-neon-cyan/[0.06]",
        )}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-neon-magenta/30 bg-neon-magenta/5">
          <Layers className="h-3.5 w-3.5 text-neon-magenta" strokeWidth={1.5} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-foreground">{result.name}</p>
          <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
            {result.chain} · {result.category}
          </p>
        </div>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => onSelect(result)}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
        active ? "bg-neon-cyan/10" : "hover:bg-neon-cyan/[0.06]",
      )}
    >
      <div className="flex h-7 w-7 items-center justify-center rounded-sm border border-border bg-bg-elevated">
        <ExternalLink className="h-3.5 w-3.5 text-dim" strokeWidth={1.5} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-mono text-xs text-foreground">{result.hash}</p>
        <p className="font-mono text-[10px] uppercase tracking-widest text-dim">
          {result.chain} transaction
        </p>
      </div>
    </button>
  );
}

// Top-bar search box with live results as you type.
export function GlobalSearch() {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const abortRef = useRef<AbortController | null>(null);

  // Call /api/search after the user stops typing (debounced).
  const fetchResults = useCallback(async (q: string) => {
    const trimmed = q.trim();
    abortRef.current?.abort();

    if (!trimmed) {
      setResults([]);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);

    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(trimmed)}`,
        { ...liveMarketFetchInit, signal: controller.signal },
      );
      const data = (await res.json()) as SearchResponse;
      if (!controller.signal.aborted) {
        setResults(data.results ?? []);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      if (!controller.signal.aborted) setResults([]);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetchResults(query);
    }, 400);
    return () => window.clearTimeout(timer);
  }, [query, fetchResults]);

  useEffect(() => () => abortRef.current?.abort(), []);

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

  // Open explorer for TX, or go to market page for assets and protocols.
  function handleSelect(result: SearchResult) {
    setOpen(false);
    setActiveIndex(-1);

    if (result.type === "transaction") {
      window.open(result.explorerUrl, "_blank", "noopener,noreferrer");
      return;
    }

    const assetId =
      result.type === "asset" ? result.id : result.assetId ?? result.id;
    router.push(`/market?q=${encodeURIComponent(assetId)}`);
  }

  // Arrow keys to move, Enter to pick, Escape to close the dropdown.
  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!open && event.key !== "Escape") return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
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
      handleSelect(results[activeIndex]);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
      setActiveIndex(-1);
    }
  }

  const showPanel = open && query.trim().length > 0;
  let lastType: SearchResult["type"] | null = null;

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
        placeholder="Search assets, protocols, TX IDs..."
        className="cyber-input py-2.5 pl-10 pr-4"
        autoComplete="off"
        spellCheck={false}
      />

      {showPanel && (
        <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 overflow-hidden rounded-sm border border-border bg-bg-deep/95 shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-xl">
          {loading ? (
            <p className="px-4 py-3 font-mono text-xs text-muted">Searching…</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-dim">No matches for &ldquo;{query.trim()}&rdquo;</p>
          ) : (
            <div className="max-h-80 overflow-y-auto py-1">
              {results.map((result, index) => {
                const showHeading = result.type !== lastType;
                lastType = result.type;
                return (
                  <div key={`${result.type}-${"hash" in result ? result.hash : result.id}-${index}`}>
                    {showHeading && (
                      <p className="px-4 pb-1 pt-2 font-mono text-[9px] uppercase tracking-[0.2em] text-dim">
                        {groupLabel(result.type)}
                      </p>
                    )}
                    <ResultRow
                      result={result}
                      active={index === activeIndex}
                      onSelect={handleSelect}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
