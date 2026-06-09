"use client";

import { AuthField } from "@/components/auth/auth-field";
import { AuthFooterLink, AuthOrDivider } from "@/components/auth/auth-split-layout";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// Email/password login form with Google OAuth option.
function LoginFormInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const error = searchParams.get("error");
  const registered = searchParams.get("registered") === "1";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const callbackError =
    error === "CredentialsSignin"
      ? "Invalid email or password."
      : error === "OAuthAccountNotLinked"
        ? "This email is registered with a password. Sign in with email first."
        : error === "Configuration"
          ? "Sign-in could not complete. Try again or use email login."
          : error === "callback"
            ? "Sign-in was interrupted. Try again."
            : error
              ? "Sign-in failed. Try again."
              : null;

  // Submits credentials via NextAuth and redirects on success.
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFormError(null);

    const result = await signIn("credentials", {
      email: email.trim(),
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setFormError("Invalid email or password.");
      return;
    }

    router.push(next.startsWith("/") ? next : "/");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {registered && (
        <p className="rounded-sm border border-neon-green/40 bg-neon-green/10 px-3 py-2 text-sm text-neon-green">
          Account created. Sign in to continue.
        </p>
      )}

      {(callbackError || formError) && (
        <p className="rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {formError ?? callbackError}
        </p>
      )}

      <form onSubmit={(e) => void handleLogin(e)} className="space-y-4">
        <AuthField
          id="email"
          label="Email"
          icon={Mail}
          type="email"
          autoComplete="email"
          placeholder="operative@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <AuthField
          id="password"
          label="Password"
          icon={Lock}
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="cyber-btn-solid flex w-full items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-50"
        >
          {loading ? "Signing in…" : "Access terminal"}
          <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
        </button>
      </form>

      <AuthOrDivider />

      <GoogleSignInButton label="Sign in with Google" variant="outline" />

      <AuthFooterLink
        text="New operative?"
        linkText="Create account"
        href="/auth/signup"
      />
    </div>
  );
}

// Suspense wrapper for the login form (needs search params).
export function LoginForm() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <LoginFormInner />
    </Suspense>
  );
}
