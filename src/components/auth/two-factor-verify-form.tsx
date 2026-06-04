"use client";

import { AuthField } from "@/components/auth/auth-field";
import { GoogleAuthenticatorGuide } from "@/components/auth/google-authenticator-guide";
import { KeyRound } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function TwoFactorVerifyForm() {
  const { update } = useSession();
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Invalid code from Google Authenticator");
        setLoading(false);
        return;
      }

      await update({ is2FAVerified: true });
      router.push("/");
      router.refresh();
    } catch {
      setError("Verification failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <GoogleAuthenticatorGuide compact />

      <p className="text-sm text-muted">
        Open <span className="text-foreground">Google Authenticator</span> on your phone
        and enter the 6-digit code for Crypto Sentry.
      </p>

      {error && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <AuthField
        id="totp"
        label="Google Authenticator code"
        icon={KeyRound}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        placeholder="000000"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        maxLength={6}
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-neon-green py-3.5 text-sm font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Verifying…" : "Unlock terminal"}
      </button>
    </form>
  );
}
