"use client";

import { AuthField } from "@/components/auth/auth-field";
import { GoogleAuthenticatorGuide } from "@/components/auth/google-authenticator-guide";
import { KeyRound } from "lucide-react";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export function TwoFactorSetupForm() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const modeParam = searchParams.get("mode");
  const isLoginMode = modeParam === "login";
  const fromSignup =
    searchParams.get("from") === "signup" || searchParams.get("intent") === "signup";
  const isMandatorySignup =
    fromSignup && !session?.user?.signup2FACompleted && !isLoginMode;

  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const query = isLoginMode ? "?mode=login" : "";
    fetch(`/api/auth/2fa/setup${query}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        if (data.qrDataUrl) setQrDataUrl(data.qrDataUrl);
        if (data.secret) setSecret(data.secret);
      })
      .catch(() => setError("Could not load Google Authenticator setup"));
  }, [isLoginMode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!secret) return;
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/2fa/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          secret,
          mode: isLoginMode ? "login" : "signup",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "Invalid code from Google Authenticator");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (data.mode === "login") {
        await update({ twoFactorEnabled: true, is2FAVerified: true });
        router.push("/settings");
      } else {
        await update({ signup2FACompleted: true, is2FAVerified: true });
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("Setup failed");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <GoogleAuthenticatorGuide manualKey={secret} />

      {isMandatorySignup && (
        <p className="text-sm text-muted">
          Sign-up requires Google Authenticator once. You will not need it on every sign-in
          unless you turn that on in Settings.
        </p>
      )}

      {qrDataUrl && (
        <div className="mx-auto w-fit rounded-xl border border-border bg-white p-3">
          <Image
            src={qrDataUrl}
            alt="QR code for Google Authenticator"
            width={180}
            height={180}
            unoptimized
          />
          <p className="mt-2 text-center text-xs text-dim">Scan in Google Authenticator</p>
        </div>
      )}

      {error && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <AuthField
        id="code"
        label="Code from Google Authenticator"
        icon={KeyRound}
        type="text"
        inputMode="numeric"
        placeholder="000000"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required
        maxLength={6}
      />

      <button
        type="submit"
        disabled={loading || !secret}
        className="w-full rounded-xl bg-neon-green py-3.5 text-sm font-bold uppercase tracking-wider text-black disabled:opacity-50"
      >
        {loading
          ? "Verifying…"
          : isMandatorySignup
            ? "Complete sign-up"
            : "Enable sign-in 2FA"}
      </button>
    </form>
  );
}
