"use client";

import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Mail } from "lucide-react";
import { useState } from "react";

// Shown after Google signup until the user clicks the verification link.
export function VerifyEmailPending({ email }: { email: string | null }) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayEmail = email ?? "your Gmail inbox";

  async function resendVerification() {
    setLoading(true);
    setMessage(null);
    setError(null);

    const res = await fetch("/api/auth/resend-verification", { method: "POST" });
    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(
        typeof data.error === "string"
          ? data.error
          : "Could not resend verification email.",
      );
      return;
    }

    setMessage("Verification link sent again. Check your Gmail inbox.");
  }

  return (
    <AuthSplitLayout
      title="Verify email"
      subtitle="Confirm operative identity / Crypto Sentry"
    >
      <div
        className="relative rounded-sm border border-neon-cyan/30 bg-bg-card/90 p-6 shadow-[0_0_40px_rgba(0,240,255,0.08)]"
        role="dialog"
        aria-labelledby="verify-email-title"
        aria-describedby="verify-email-desc"
      >
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-sm border border-neon-cyan/30 bg-neon-cyan/10">
          <Mail className="h-6 w-6 text-neon-cyan" strokeWidth={2} />
        </div>

        <h2
          id="verify-email-title"
          className="font-display text-lg font-bold uppercase tracking-wide text-foreground"
        >
          Verification link sent
        </h2>
        <p id="verify-email-desc" className="mt-3 text-sm leading-relaxed text-muted">
          We sent a verification link to{" "}
          <span className="font-medium text-foreground">{displayEmail}</span>. Open Gmail, click the
          link, and you&apos;ll go straight to your dashboard.
        </p>

        {message && (
          <p className="mt-4 rounded-sm border border-neon-green/40 bg-neon-green/10 px-3 py-2 text-sm text-neon-green">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-4 rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <button
          type="button"
          disabled={loading}
          onClick={() => void resendVerification()}
          className="mt-6 w-full rounded-sm border border-border bg-bg-elevated py-3 text-sm font-semibold text-foreground transition-colors hover:border-neon-cyan/40 hover:bg-bg-card disabled:opacity-50"
        >
          {loading ? "Sending…" : "Resend verification link"}
        </button>
      </div>
    </AuthSplitLayout>
  );
}
