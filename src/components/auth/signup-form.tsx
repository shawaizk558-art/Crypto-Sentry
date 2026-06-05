"use client";

import { AuthField } from "@/components/auth/auth-field";
import { EmailVerifyForm } from "@/components/auth/email-verify-form";
import {
  AuthFooterLink,
  AuthOrDivider,
} from "@/components/auth/auth-split-layout";
import { GoogleSignInButton } from "@/components/auth/google-sign-in-button";
import { EMAIL_VERIFIED_METADATA_KEY } from "@/lib/auth/email-verified";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, Lock, Mail } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

type SignupStep = "credentials" | "verify";

function SignupFormInner() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const [step, setStep] = useState<SignupStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [codeSent, setCodeSent] = useState(false);

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const trimmedEmail = email.trim();

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }

    setLoading(true);

    const supabase = createClient();
    const { error: signUpError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: { [EMAIL_VERIFIED_METADATA_KEY]: false },
      },
    });

    if (signUpError) {
      setLoading(false);
      setFormError(signUpError.message);
      return;
    }

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: trimmedEmail,
      options: { shouldCreateUser: false },
    });

    setLoading(false);

    if (otpError) {
      setFormError(otpError.message);
      return;
    }

    setEmail(trimmedEmail);
    setCodeSent(true);
    setStep("verify");
  }

  if (step === "verify") {
    return (
      <>
        <EmailVerifyForm email={email} initialSent={codeSent} />
        <button
          type="button"
          onClick={() => {
            setStep("credentials");
            setCodeSent(false);
            setFormError(null);
          }}
          className="mt-4 w-full text-center text-xs text-muted hover:text-foreground"
        >
          ← Back to account details
        </button>
      </>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {error === "callback" && (
          <p className="rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            Google sign-up failed. Try again.
          </p>
        )}

        {formError && (
          <p className="rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {formError}
          </p>
        )}

        <form onSubmit={(e) => void handleSignup(e)} className="space-y-4">
          <AuthField
            id="signup-email"
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
            id="signup-password"
            label="Password"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            placeholder="Min. 6 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />

          <AuthField
            id="confirm-password"
            label="Confirm password"
            icon={Lock}
            type="password"
            autoComplete="new-password"
            placeholder="Repeat password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            minLength={6}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="cyber-btn-solid flex w-full items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-50"
          >
            {loading ? "Creating account…" : "Create account"}
            <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
          </button>
        </form>

        <AuthOrDivider />

        <GoogleSignInButton label="Sign up with Google" variant="outline" />
      </div>

      <AuthFooterLink
        text="Already active?"
        linkText="Sign in"
        href="/auth/login"
      />
    </>
  );
}

export function SignupForm() {
  return (
    <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
      <SignupFormInner />
    </Suspense>
  );
}
