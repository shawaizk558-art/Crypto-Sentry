"use client";

import { OperativePageHeader } from "@/components/layout/operative-page-header";
import { DeleteAccountButton } from "@/components/settings/delete-account-button";
import { Bell, Eye, Monitor, Save, Settings } from "lucide-react";
import { useEffect, useState } from "react";

type SettingsData = {
  alertThreshold: number;
  aggressivePolling: boolean;
  uiDensity: string;
  emailReports: boolean;
};

export function SettingsView() {
  const [settings, setSettings] = useState<SettingsData>({
    alertThreshold: -2,
    aggressivePolling: false,
    uiDensity: "compact",
    emailReports: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings({
          alertThreshold: data.alertThreshold ?? -2,
          aggressivePolling: data.aggressivePolling ?? false,
          uiDensity: data.uiDensity ?? "compact",
          emailReports: data.emailReports ?? true,
        });
        setLoading(false);
      });
  }, []);

  async function commit() {
    setSaving(true);
    setSaved(false);
    const res = await fetch("/api/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    if (res.ok) {
      const data = await res.json();
      setSettings({
        alertThreshold: data.alertThreshold,
        aggressivePolling: data.aggressivePolling,
        uiDensity: data.uiDensity,
        emailReports: data.emailReports,
      });
      setSaved(true);
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="px-8 py-8">
        <p className="text-muted">Loading settings…</p>
      </div>
    );
  }

  return (
    <div className="px-8 py-8 pb-16">
      <OperativePageHeader
        icon={Settings}
        title="SYSTEM SETTINGS"
        subtitle="Global protocol configurations"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-6">
          <div className="mb-6 flex items-center gap-2">
            <Bell className="h-4 w-4 text-neon-green" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Threshold monitoring
            </h2>
          </div>

          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="text-muted">Critical sensitivity</span>
            <span className="font-mono font-bold text-neon-green">
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
            className="h-2 w-full cursor-pointer accent-[#00ff41]"
          />
          <p className="mt-3 text-xs text-muted">
            Trigger emergency protocols when price drop exceeds this threshold within a
            30s cycle.
          </p>

          <label className="mt-6 flex cursor-pointer items-center justify-between rounded-xl border border-border bg-bg-elevated px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Aggressive polling</p>
              <p className="text-xs text-muted">Increase frequency to 10s intervals</p>
            </div>
            <input
              type="checkbox"
              checked={settings.aggressivePolling}
              onChange={(e) =>
                setSettings((s) => ({ ...s, aggressivePolling: e.target.checked }))
              }
              className="h-5 w-5 accent-[#00ff41]"
            />
          </label>

          <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-border bg-bg-elevated px-4 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">Email intelligence</p>
              <p className="text-xs text-muted">Daily summary reports</p>
            </div>
            <input
              type="checkbox"
              checked={settings.emailReports}
              onChange={(e) =>
                setSettings((s) => ({ ...s, emailReports: e.target.checked }))
              }
              className="h-5 w-5 accent-[#00ff41]"
            />
          </label>
        </div>

        <div className="card-surface p-6">
          <div className="mb-6 flex items-center gap-2">
            <Eye className="h-4 w-4 text-neon-green" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
              Interface adaptation
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, uiDensity: "compact" }))}
              className={`flex flex-col items-center gap-3 rounded-xl border p-6 transition-colors ${
                settings.uiDensity === "compact"
                  ? "border-neon-green bg-neon-green/10"
                  : "border-border bg-bg-elevated hover:border-border-subtle"
              }`}
            >
              <Monitor className="h-8 w-8 text-muted" />
              <span className="text-xs font-bold uppercase tracking-wider">Compact UI</span>
            </button>
            <button
              type="button"
              onClick={() => setSettings((s) => ({ ...s, uiDensity: "expanded" }))}
              className={`flex flex-col items-center gap-3 rounded-xl border p-6 transition-colors ${
                settings.uiDensity === "expanded"
                  ? "border-neon-green bg-neon-green/10"
                  : "border-border bg-bg-elevated hover:border-border-subtle"
              }`}
            >
              <Eye className="h-8 w-8 text-muted" />
              <span className="text-xs font-bold uppercase tracking-wider">Expanded view</span>
            </button>
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center justify-end gap-4">
        {saved && (
          <span className="text-xs font-mono text-neon-green">Changes committed</span>
        )}
        <button
          type="button"
          disabled={saving}
          onClick={commit}
          className="flex items-center gap-2 rounded-xl bg-neon-green px-8 py-3 text-sm font-bold uppercase tracking-wider text-black shadow-[0_0_24px_rgba(0,255,65,0.35)] hover:opacity-90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saving ? "Committing…" : "Commit changes"}
        </button>
      </div>

      <section className="mt-10 max-w-lg card-surface border-danger/30 p-6">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-danger">
          Danger zone
        </h2>
        <p className="mt-2 text-sm text-muted">
          Delete your account and all associated data. This cannot be undone.
        </p>
        <div className="mt-4">
          <DeleteAccountButton />
        </div>
      </section>
    </div>
  );
}
