"use client";

import { AuthField } from "@/components/auth/auth-field";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { ArrowRight, KeyRound, Lock, Mail, Shield } from "lucide-react";
import { getPostAuthPath } from "@/lib/auth/post-auth-redirect";
import { getSession, signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

const authErrors: Record<string, string> = {
  OAuthAccountNotLinked:
    "This email is already registered with a password. Sign in with email and password, or use the same Google account after linking.",
  OAuthSignin: "Google sign-in failed. Try again.",
  OAuthCallback: "Google sign-in was interrupted. Try again.",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [needs2FA, setNeeds2FA] = useState(false);
  const [error, setError] = useState<string | null>(
    urlError ? (authErrors[urlError] ?? "Sign-in failed. Try again.") : null,
  );
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!needs2FA) {
        const check = await fetch("/api/auth/validate-credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!check.ok) {
          setError("Invalid email or password");
          setLoading(false);
          return;
        }

        const data = await check.json();
        if (data.requires2FA) {
          setNeeds2FA(true);
          setLoading(false);
          return;
        }
      }

      const result = await signIn("credentials", {
        email,
        password,
        totpCode: needs2FA ? totpCode : undefined,
        redirect: false,
      });

      if (result?.error) {
        setError(needs2FA ? "Invalid verification code" : "Invalid email or password");
        setLoading(false);
        return;
      }

      const session = await getSession();
      const nextPath = getPostAuthPath(session, "login");
      router.push(nextPath === "/" ? callbackUrl : nextPath);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <AuthField
        id="email"
        label="Email identifier"
        icon={Mail}
        type="email"
        autoComplete="email"
        placeholder="agent@sentry.io"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        disabled={needs2FA}
      />

      <AuthField
        id="password"
        label="Secure passkey"
        icon={Lock}
        type="password"
        autoComplete="current-password"
        placeholder="••••••••••••"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        disabled={needs2FA}
      />

      {needs2FA && (
        <AuthField
          id="totp"
          label="Google Authenticator code"
          icon={KeyRound}
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          value={totpCode}
          onChange={(e) => setTotpCode(e.target.value)}
          required
          maxLength={6}
        />
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-neon-green py-3.5 text-sm font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Authenticating…" : needs2FA ? "Verify & enter" : "Access terminal"}
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </button>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-bg-deep px-2 text-dim">or</span>
        </div>
      </div>

      <GoogleSignInButton label="Continue with Google" intent="login" />

      <p className="text-center text-xs text-muted">
        <Link href="/auth/signup" className="text-neon-green hover:underline">
          Recruit new agent
        </Link>
        {" · "}
        <Link href="/" className="hover:text-foreground">
          <Shield className="mr-1 inline h-3 w-3" />
          Back to terminal
        </Link>
      </p>
    </form>
  );
}
