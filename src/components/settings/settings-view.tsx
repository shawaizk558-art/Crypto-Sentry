"use client";

import { OperativePageHeader } from "@/components/layout/operative-page-header";
import { cn } from "@/lib/utils";
import { Bell, Eye, Monitor, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";

const STORAGE_KEY = "crypto-sentry-settings";

type SettingsData = {
  alertThreshold: number;
  aggressivePolling: boolean;
  uiDensity: string;
  emailReports: boolean;
};

const defaults: SettingsData = {
  alertThreshold: -2,
  aggressivePolling: false,
  uiDensity: "compact",
  emailReports: true,
};

function loadSettings(): SettingsData {
  if (typeof window === "undefined") return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export function SettingsView() {
  const [settings, setSettings] = useState<SettingsData>(defaults);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
    setReady(true);
  }, []);

  function commit() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
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
        subtitle="Stored locally in your browser (per device)"
      />

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
            UI preference only until user accounts are reintroduced.
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
              <p className="text-xs text-muted">Requires auth (coming later)</p>
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

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, uiDensity: "compact" }))}
              className={cn(
                "flex flex-col items-center gap-3 rounded-sm border p-6 transition-all",
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
              onClick={() => setSettings((s) => ({ ...s, uiDensity: "expanded" }))}
              className={cn(
                "flex flex-col items-center gap-3 rounded-sm border p-6 transition-all",
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
          <span className="font-mono text-xs text-neon-green">Saved to this browser</span>
        )}
        <button
          type="button"
          onClick={commit}
          className="cyber-btn-solid flex items-center gap-2 px-8 py-3 text-sm"
        >
          <Save className="h-4 w-4" />
          Save locally
        </button>
      </div>
    </div>
  );
}
