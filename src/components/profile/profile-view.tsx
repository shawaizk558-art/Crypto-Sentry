"use client";

import { OperativePageHeader } from "@/components/layout/operative-page-header";
import {
  Activity,
  Camera,
  LogOut,
  Settings,
  Shield,
  User,
  Zap,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

type ProfileData = {
  name: string | null;
  email: string | null;
  image: string | null;
  createdAt: string;
  usesGoogle: boolean;
  twoFactorVerified: boolean;
  watchlistCount: number;
  alertThreshold: number;
  emailReports: boolean;
};

export function ProfileView() {
  const { data: session, update } = useSession();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        setProfile(data);
        setName(data.name ?? "");
        setImage(data.image ?? null);
      });
  }, []);

  async function uploadAvatar(file: File) {
    setUploading(true);
    setUploadError(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setUploadError(data.error ?? "Upload failed");
      setUploading(false);
      return;
    }
    setImage(data.image);
    setProfile((p) => (p ? { ...p, image: data.image } : p));
    await update({ image: data.image });
    setUploading(false);
  }

  function onAvatarSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) void uploadAvatar(file);
  }

  async function saveName() {
    setSaving(true);
    const res = await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (res.ok) {
      await update({ name });
      setProfile((p) => (p ? { ...p, name } : p));
    }
    setSaving(false);
  }

  const displayName = (profile?.name ?? session?.user?.name ?? "OPERATIVE").toUpperCase();

  return (
    <div className="px-8 py-8">
      <OperativePageHeader
        icon={User}
        title="AGENT PROFILE"
        subtitle="Operator node clearance"
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card-surface p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative shrink-0">
              <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="group relative flex h-28 w-28 flex-col items-center justify-center overflow-hidden rounded-2xl border border-dashed border-neon-green/40 bg-neon-green/5 transition-colors hover:border-neon-green/70 hover:bg-neon-green/10 disabled:opacity-60"
              >
                {image ? (
                  <Image
                    src={image}
                    alt="Profile"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                ) : (
                  <>
                    <Camera className="h-6 w-6 text-neon-green/60" />
                    <span className="mt-2 font-mono text-[9px] uppercase tracking-wider text-muted">
                      Upload photo
                    </span>
                  </>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/50 font-mono text-[9px] uppercase tracking-wider text-neon-green opacity-0 transition-opacity group-hover:opacity-100">
                  {uploading ? "Uploading…" : "Change photo"}
                </span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="sr-only"
                onChange={onAvatarSelected}
              />
              {uploadError && (
                <p className="mt-2 max-w-[7rem] text-center text-[10px] text-danger">
                  {uploadError}
                </p>
              )}
            </div>
            <div className="flex-1">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full border-b border-border bg-transparent pb-2 text-2xl font-bold uppercase text-foreground focus:border-neon-green/50 focus:outline-none"
              />
              <p className="mt-1 text-xs text-muted">Level 4 operative</p>
              <p className="mt-2 text-sm text-muted">{profile?.email ?? session?.user?.email}</p>
              <button
                type="button"
                disabled={saving}
                onClick={saveName}
                className="mt-4 text-xs font-semibold uppercase tracking-wider text-neon-green hover:underline disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save name"}
              </button>
              <button
                type="button"
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="mt-6 flex items-center gap-2 rounded-lg border border-danger/40 px-4 py-2 text-xs font-bold uppercase tracking-wider text-danger hover:bg-danger/10"
              >
                <LogOut className="h-4 w-4" />
                Terminate session
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-bg-elevated p-4">
              <Zap className="h-4 w-4 text-neon-green" />
              <p className="mt-2 font-mono text-[10px] uppercase text-muted">Status</p>
              <p className="text-sm font-semibold text-neon-green">Operational</p>
            </div>
            <div className="rounded-xl border border-border bg-bg-elevated p-4">
              <Activity className="h-4 w-4 text-neon-green" />
              <p className="mt-2 font-mono text-[10px] uppercase text-muted">Clearance</p>
              <p className="text-sm font-semibold text-foreground">High</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <Settings className="h-4 w-4 text-neon-green" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                System preferences
              </h2>
            </div>
            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">Volatility sensitivity</p>
                  <p className="text-xs text-muted">
                    Protocol delta &gt; {profile?.alertThreshold ?? -2}%
                  </p>
                </div>
                <span className="rounded-md bg-neon-green/15 px-2 py-1 text-xs font-bold text-neon-green">
                  ACTIVE
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-foreground">Email intelligence</p>
                  <p className="text-xs text-muted">Daily summary reports</p>
                </div>
                <span
                  className={`rounded-md px-2 py-1 text-xs font-bold ${
                    profile?.emailReports
                      ? "bg-neon-green/15 text-neon-green"
                      : "bg-bg-elevated text-muted"
                  }`}
                >
                  {profile?.emailReports ? "ON" : "OFF"}
                </span>
              </div>
            </div>
            <Link
              href="/settings"
              className="mt-4 inline-block text-xs text-neon-green hover:underline"
            >
              Edit in settings →
            </Link>
          </div>

          <div className="card-surface p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-neon-green" />
              <h2 className="text-sm font-bold uppercase tracking-wider text-foreground">
                Security link
              </h2>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Two-factor ID</span>
              <span className="rounded-md bg-neon-green/15 px-2 py-1 text-xs font-bold text-neon-green">
                {profile?.twoFactorVerified || profile?.usesGoogle ? "VERIFIED" : "PENDING"}
              </span>
            </div>
            <p className="mt-4 font-mono text-xs text-dim">
              Watchlist targets: {profile?.watchlistCount ?? 0}
            </p>
            {profile?.createdAt && (
              <p className="mt-1 font-mono text-xs text-dim">
                Node since: {new Date(profile.createdAt).toISOString().slice(0, 16).replace("T", " ")} UTC
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
