"use client";

import { AlertCard } from "@/components/alerts/alert-card";
import { StatCard } from "@/components/alerts/stat-card";
import { PageHeader } from "@/components/layout/header";
import { Panel, PanelHeader } from "@/components/ui/card";
import { liveMarketFetchInit } from "@/lib/coingecko-client";
import { useLivePrices } from "@/hooks/use-live-prices";
import type { AlertSeverity } from "@/types/alerts";
import { AlertOctagon, Filter, TrendingDown } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

type AlertLogEntry = {
  alertId: string;
  line: string;
  dropPct: number;
};

// How bad was the drop? critical, high, or medium.
function severityForDrop(drop: number): AlertSeverity {
  if (drop <= -8) return "critical";
  if (drop <= -5) return "high";
  return "medium";
}

// Alerts page: stats + list of triggered alerts.
export function AlertsFeed() {
  const { meta } = useLivePrices();
  const [logs, setLogs] = useState<AlertLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Load alert logs from the server.
  const load = useCallback(async () => {
    const res = await fetch("/api/alerts/logs?limit=50", liveMarketFetchInit);
    const data = await res.json();
    setLogs(data.logs ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (meta?.updatedAt) void load();
  }, [meta?.updatedAt, load]);

  const critical = logs.filter((entry) => severityForDrop(entry.dropPct) === "critical").length;
  const high = logs.filter((entry) => severityForDrop(entry.dropPct) === "high").length;

  return (
    <div className="page-container">
      <PageHeader
        title="Alert Log"
        description="Flash-crash audit trail — structured ALERT_TRIGGERED entries, separate from system logs."
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-sm border border-border bg-bg-elevated px-4 py-2 font-mono text-[10px] uppercase tracking-widest text-muted transition-colors hover:border-glow hover:text-foreground"
          >
            <Filter className="h-3.5 w-3.5" strokeWidth={1.5} />
            Filter
          </button>
        }
      />

      <section className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total alerts"
          value={loading ? "…" : logs.length}
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
          title="Alert log stream"
          subtitle="[timestamp] ALERT_TRIGGERED | Asset | Price | Drop | AlertID"
        />
        <div>
          {loading ? (
            <p className="px-5 py-8 font-mono text-sm text-muted">Loading alert logs…</p>
          ) : logs.length === 0 ? (
            <p className="px-5 py-8 text-sm italic text-dim">No alert log entries yet</p>
          ) : (
            logs.map((entry, i) => (
              <AlertCard key={entry.alertId} entry={entry} index={i} />
            ))
          )}
        </div>
      </Panel>
    </div>
  );
}
