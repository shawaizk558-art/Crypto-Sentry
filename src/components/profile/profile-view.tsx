"use client";

import { OperativePageHeader } from "@/components/layout/operative-page-header";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import {
  Activity,
  Camera,
  Check,
  Pencil,
  Settings,
  Shield,
  User,
  X,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

type ProfileViewProps = {
  email: string;
  name: string;
  avatarUrl: string | null;
  userId: string;
  createdAt: string;
};

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const ACCEPTED_AVATAR_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function ProfileView({
  email,
  name: initialName,
  avatarUrl: initialAvatarUrl,
  createdAt,
}: ProfileViewProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(initialName);
  const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
  const [editingName, setEditingName] = useState(false);
  const [draftName, setDraftName] = useState(initialName);
  const [savingName, setSavingName] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const joined = new Date(createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  async function saveName() {
    const trimmed = draftName.trim();
    if (!trimmed) {
      setError("Name cannot be empty.");
      return;
    }
    if (trimmed === name) {
      setEditingName(false);
      return;
    }

    setSavingName(true);
    setError(null);

    const res = await fetch("/api/user/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: trimmed }),
    });

    const data = await res.json();
    setSavingName(false);

    if (!res.ok) {
      setError(data.error ?? "Could not update name.");
      return;
    }

    setName(trimmed);
    setEditingName(false);
    router.refresh();
  }

  async function handleAvatarChange(file: File) {
    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      setError("Use a JPEG, PNG, WebP, or GIF image.");
      return;
    }
    if (file.size > MAX_AVATAR_BYTES) {
      setError("Image must be 2 MB or smaller.");
      return;
    }

    setUploadingAvatar(true);
    setError(null);

    const form = new FormData();
    form.append("file", file);

    const res = await fetch("/api/user/avatar", {
      method: "POST",
      body: form,
    });

    const data = await res.json();
    setUploadingAvatar(false);

    if (!res.ok) {
      setError(data.error ?? "Could not upload photo.");
      return;
    }

    setAvatarUrl(data.imageUrl);
    router.refresh();
  }

  return (
    <div className="page-container pb-16">
      <OperativePageHeader
        icon={User}
        title="Operative Profile"
        subtitle="Email, password, or Google sign-in"
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card-surface card-glow-cyan p-6 lg:col-span-2">
          <div className="flex items-center gap-5">
            <div className="relative shrink-0">
              <UserAvatar
                src={avatarUrl}
                name={name}
                email={email}
                size="lg"
                className={uploadingAvatar ? "opacity-50" : undefined}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-sm border border-neon-cyan/40 bg-bg-deep text-neon-cyan transition-colors hover:bg-neon-cyan/10 disabled:opacity-50"
                aria-label="Upload profile photo"
              >
                <Camera className="h-4 w-4" strokeWidth={1.5} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_AVATAR_TYPES.join(",")}
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void handleAvatarChange(file);
                  e.target.value = "";
                }}
              />
            </div>

            <div className="min-w-0 flex-1">
              {editingName ? (
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    maxLength={80}
                    autoFocus
                    className="cyber-input max-w-xs py-2 text-base font-bold"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") void saveName();
                      if (e.key === "Escape") {
                        setDraftName(name);
                        setEditingName(false);
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    variant="solid"
                    disabled={savingName}
                    onClick={() => void saveName()}
                  >
                    <Check className="h-3 w-3" />
                    Save
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    disabled={savingName}
                    onClick={() => {
                      setDraftName(name);
                      setEditingName(false);
                    }}
                  >
                    <X className="h-3 w-3" />
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-display text-xl font-bold text-foreground">{name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setDraftName(name);
                      setEditingName(true);
                      setError(null);
                    }}
                    className="rounded-sm p-1.5 text-muted transition-colors hover:bg-bg-elevated hover:text-neon-cyan"
                    aria-label="Edit name"
                  >
                    <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />
                  </button>
                </div>
              )}
              <p className="text-sm text-muted">{email}</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-dim">
                Member since {joined}
              </p>
              {uploadingAvatar && (
                <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-neon-cyan">
                  Uploading photo…
                </p>
              )}
            </div>
          </div>

          {error && (
            <p className="mt-4 rounded-sm border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-danger">
              {error}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <InfoCard
            icon={Shield}
            title="Security"
            detail="Google OAuth or email + password"
            accent="cyan"
          />
          <InfoCard
            icon={Activity}
            title="Session"
            detail="Active"
            accent="green"
          />
          <InfoCard
            icon={Zap}
            title="Alerts"
            detail="Global flash-crash feed"
            accent="magenta"
          />
          <Link
            href="/settings"
            className="card-surface flex items-center gap-3 p-4 transition-all hover:border-neon-cyan/30 hover:shadow-[0_0_16px_rgba(0,240,255,0.08)]"
          >
            <Settings className="h-5 w-5 text-muted" />
            <span className="text-sm font-medium text-foreground">System settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  detail,
  accent,
}: {
  icon: typeof Shield;
  title: string;
  detail: string;
  accent: "cyan" | "green" | "magenta";
}) {
  const colors = {
    cyan: "text-neon-cyan",
    green: "text-neon-green",
    magenta: "text-neon-magenta",
  };

  return (
    <div className="card-surface flex items-center gap-3 p-4">
      <div className="flex h-9 w-9 items-center justify-center rounded-sm border border-border bg-bg-elevated">
        <Icon className={`h-4 w-4 ${colors[accent]}`} />
      </div>
      <div>
        <p className="font-mono text-[10px] font-bold uppercase tracking-wider text-foreground">
          {title}
        </p>
        <p className="text-[10px] text-muted">{detail}</p>
      </div>
    </div>
  );
}
