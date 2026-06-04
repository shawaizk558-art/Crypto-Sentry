"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function EnableLogin2FAButton({
  hasAuthenticator,
}: {
  hasAuthenticator: boolean;
}) {
  const { update } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function enableFromExistingSecret() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/2fa/enable", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Could not enable 2FA");
        setLoading(false);
        return;
      }
      await update({ twoFactorEnabled: true, is2FAVerified: true });
      router.refresh();
    } catch {
      setError("Could not enable 2FA");
      setLoading(false);
    }
  }

  if (hasAuthenticator) {
    return (
      <div className="mt-4 space-y-2">
        {error && <p className="text-sm text-danger">{error}</p>}
        <button
          type="button"
          disabled={loading}
          onClick={enableFromExistingSecret}
          className="inline-flex rounded-xl bg-neon-green px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-black hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Enabling…" : "Require Google Authenticator on sign-in"}
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/auth/2fa/setup?mode=login"
      className="mt-4 inline-flex rounded-xl bg-neon-green px-5 py-2.5 text-sm font-bold uppercase tracking-wider text-black hover:opacity-90"
    >
      Link Google Authenticator
    </Link>
  );
}
