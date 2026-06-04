"use client";

import { AuthField } from "@/components/auth/auth-field";
import { AuthFooterLink } from "@/components/auth/auth-split-layout";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { ArrowRight, Lock, Mail, User } from "lucide-react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Registration failed");
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push("/auth/login?registered=1");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <AuthField
          id="name"
          label="Agent name"
          icon={User}
          type="text"
          autoComplete="name"
          placeholder="Operative name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

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
        />

        <AuthField
          id="password"
          label="Secure passkey"
          icon={Lock}
          type="password"
          autoComplete="new-password"
          placeholder="Min. 8 chars, letters + numbers"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-neon-green py-3.5 text-sm font-bold uppercase tracking-wider text-black transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Creating node…" : "Confirm recruitment"}
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

        <div className="rounded-lg border border-border bg-bg-elevated/50 px-3 py-3 text-xs text-muted">
          <p className="font-medium text-foreground">Sign up with Google (recommended)</p>
          <ol className="mt-2 list-decimal space-y-1 pl-4">
            <li>Choose your Google account</li>
            <li>Enter your Google password</li>
            <li>
              If enabled, complete 2-Step Verification on your phone (tap{" "}
              <span className="text-foreground">Yes</span>)
            </li>
          </ol>
          <p className="mt-2">All of that happens on Google&apos;s site — not inside this app.</p>
        </div>
        <GoogleSignInButton intent="signup" label="Sign up with Google" />
      </form>

      <AuthFooterLink
        text="Already active?"
        linkText="Back to terminal"
        href="/auth/login"
      />
    </>
  );
}
