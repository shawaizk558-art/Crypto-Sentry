"use client";

import { AlertCard } from "@/components/alerts/alert-card";
import { StatCard } from "@/components/alerts/stat-card";
import { PageHeader } from "@/components/layout/header";
import { Panel, PanelHeader } from "@/components/ui/card";
import { liveMarketFetchInit } from "@/lib/coingecko-client";
import { useLivePrices } from "@/hooks/use-live-prices";
import type { CryptoAlertItem } from "@/types/alerts";
import { AlertOctagon, Filter, TrendingDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export function AlertsFeed() {
  const { meta } = useLivePrices();
  const [alerts, setAlerts] = useState<CryptoAlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const res = await fetch("/api/alerts?limit=50", liveMarketFetchInit);
    const data = await res.json();
    setAlerts(data.alerts ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (meta?.updatedAt) void load();
  }, [meta?.updatedAt, load]);

  const critical = alerts.filter((a) => a.severity === "critical").length;
  const high = alerts.filter((a) => a.severity === "high").length;

  return (
    <>
      <PageHeader
        title="Alert Log"
        description="Live flash-crash detections from the in-process surveillance poller (30s cycles)."
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 border border-border bg-bg-elevated px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:border-border-glow hover:text-foreground"
          >
            <Filter className="h-3.5 w-3.5" strokeWidth={1.5} />
            Filter
          </button>
        }
      />

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total alerts"
          value={loading ? "…" : alerts.length}
          icon={TrendingDown}
          variant="cyan"
        />
        <StatCard label="Critical" value={loading ? "…" : critical} icon={AlertOctagon} variant="danger" />
        <StatCard label="High severity" value={loading ? "…" : high} icon={AlertOctagon} />
      </section>

      <Panel urgent>
        <PanelHeader
          title="All detected drops"
          subtitle="Sorted by detection time — newest first"
        />
        <div>
          {loading ? (
            <p className="px-5 py-8 font-mono text-sm text-muted">Loading alerts…</p>
          ) : alerts.length === 0 ? (
            <p className="px-5 py-8 text-sm italic text-dim">No drops detected yet</p>
          ) : (
            alerts.map((alert, i) => (
              <AlertCard key={alert.id} alert={alert} index={i} />
            ))
          )}
        </div>
      </Panel>
    </>
  );
}
