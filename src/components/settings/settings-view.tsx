"use client";

import { OperativePageHeader } from "@/components/layout/operative-page-header";
import { useUiDensity } from "@/components/providers/ui-density-provider";
import type { UiDensity } from "@/lib/user/settings";
import { cn } from "@/lib/utils";
import { Bell, Eye, Monitor, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";

type SettingsData = {
  alertThreshold: number;
  aggressivePolling: boolean;
  uiDensity: UiDensity;
  emailReports: boolean;
};

const defaults: SettingsData = {
  alertThreshold: -2,
  aggressivePolling: false,
  uiDensity: "compact",
  emailReports: true,
};

function mapApiSettings(data: {
  alert_threshold: number;
  aggressive_polling: boolean;
  ui_density: string;
  email_reports: boolean;
}): SettingsData {
  return {
    alertThreshold: data.alert_threshold,
    aggressivePolling: data.aggressive_polling,
    uiDensity: data.ui_density === "expanded" ? "expanded" : "compact",
    emailReports: data.email_reports,
  };
}

export function SettingsView() {
  const { setDensity } = useUiDensity();
  const [settings, setSettings] = useState<SettingsData>(defaults);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const res = await fetch("/api/user/settings");
      if (res.ok) {
        const data = await res.json();
        const mapped = mapApiSettings(data.settings);
        setSettings(mapped);
        setDensity(mapped.uiDensity);
      }
      setReady(true);
    }
    void load();
  }, [setDensity]);

  async function persist(patch: Partial<SettingsData>) {
    setSaving(true);
    setError(null);

    try {
      const body: Record<string, unknown> = {};
      if (patch.alertThreshold !== undefined) body.alert_threshold = patch.alertThreshold;
      if (patch.aggressivePolling !== undefined) body.aggressive_polling = patch.aggressivePolling;
      if (patch.uiDensity !== undefined) body.ui_density = patch.uiDensity;
      if (patch.emailReports !== undefined) body.email_reports = patch.emailReports;

      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Could not save settings.");
        return false;
      }

      const mapped = mapApiSettings(data.settings);
      setSettings(mapped);
      if (patch.uiDensity !== undefined) {
        setDensity(mapped.uiDensity);
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      return true;
    } catch {
      setError("Could not reach the server. Restart dev server and try again.");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function selectUiDensity(uiDensity: UiDensity) {
    setSettings((s) => ({ ...s, uiDensity }));
    setDensity(uiDensity);
    await persist({ uiDensity });
  }

  async function commit() {
    await persist(settings);
  }

  if (!ready) {
    return (
      <div className="page-container">
        <p className="text-muted">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="page-container pb-16">
      <OperativePageHeader
        icon={Settings}
        title="System Settings"
        subtitle="Synced to your operative account"
      />

      {error && (
        <p className="mb-4 rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-6">
          <div className="mb-6 flex items-center gap-2">
            <Bell className="h-4 w-4 text-neon-cyan" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Threshold monitoring
            </h2>
          </div>

          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">Critical sensitivity</span>
            <span className="font-mono font-bold text-neon-cyan">
              {settings.alertThreshold.toFixed(1)}%
            </span>
          </div>
          <input
            type="range"
            min={-10}
            max={0}
            step={0.1}
            value={settings.alertThreshold}
            onChange={(e) =>
              setSettings((s) => ({
                ...s,
                alertThreshold: parseFloat(e.target.value),
              }))
            }
            className="h-2 w-full cursor-pointer accent-neon-cyan"
          />
          <p className="mt-3 text-xs text-muted">
            Flash-crash detection threshold preference (saved per account).
          </p>

          <label className="mt-6 flex cursor-pointer items-center justify-between rounded-sm border border-border bg-bg-elevated/60 px-4 py-3 transition-colors hover:border-neon-cyan/20">
            <div>
              <p className="text-sm font-medium text-foreground">Aggressive polling</p>
              <p className="text-xs text-muted">Reserved for future use</p>
            </div>
            <input
              type="checkbox"
              checked={settings.aggressivePolling}
              onChange={(e) =>
                setSettings((s) => ({ ...s, aggressivePolling: e.target.checked }))
              }
              className="h-5 w-5 accent-neon-cyan"
            />
          </label>

          <label className="mt-4 flex cursor-pointer items-center justify-between rounded-sm border border-border bg-bg-elevated/60 px-4 py-3 transition-colors hover:border-neon-cyan/20">
            <div>
              <p className="text-sm font-medium text-foreground">Email intelligence</p>
              <p className="text-xs text-muted">Alert digest emails (coming later)</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailReports}
              onChange={(e) =>
                setSettings((s) => ({ ...s, emailReports: e.target.checked }))
              }
              className="h-5 w-5 accent-neon-cyan"
            />
          </label>
        </div>

        <div className="card-surface p-6">
          <div className="mb-6 flex items-center gap-2">
            <Eye className="h-4 w-4 text-neon-magenta" />
            <h2 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
              Interface adaptation
            </h2>
          </div>

          <p className="mb-4 text-xs text-muted">
            {settings.uiDensity === "expanded"
              ? "Expanded — larger cards, spacing, and typography across the dashboard."
              : "Compact — denser layout with tighter spacing across the dashboard."}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              disabled={saving}
              onClick={() => void selectUiDensity("compact")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-sm border p-6 transition-all disabled:opacity-50",
                settings.uiDensity === "compact"
                  ? "border-neon-cyan/50 bg-neon-cyan/10 shadow-[0_0_20px_rgba(0,240,255,0.1)]"
                  : "border-border bg-bg-elevated/60 hover:border-neon-cyan/20",
              )}
            >
              <Monitor className="h-8 w-8 text-muted" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                Compact UI
              </span>
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => void selectUiDensity("expanded")}
              className={cn(
                "flex flex-col items-center gap-3 rounded-sm border p-6 transition-all disabled:opacity-50",
                settings.uiDensity === "expanded"
                  ? "border-neon-magenta/50 bg-neon-magenta/10 shadow-[0_0_20px_rgba(255,42,109,0.1)]"
                  : "border-border bg-bg-elevated/60 hover:border-neon-magenta/20",
              )}
            >
              <Eye className="h-8 w-8 text-muted" />
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
                Expanded view
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-end gap-4">
        {saved && (
          <span className="font-mono text-xs text-neon-green">Saved to your account</span>
        )}
        <button
          type="button"
          disabled={saving}
          onClick={() => void commit()}
          className="cyber-btn-solid flex items-center gap-2 px-8 py-3 text-sm disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Saving…" : "Save settings"}
        </button>
      </div>
    </div>
  );
}
