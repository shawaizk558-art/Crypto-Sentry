"use client";

import { AuthField } from "@/components/auth/auth-field";
import { EMAIL_VERIFIED_METADATA_KEY } from "@/lib/auth/email-verified";
import { createClient } from "@/lib/supabase/client";
import { ArrowRight, KeyRound, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type EmailVerifyFormProps = {
  email: string;
  initialSent?: boolean;
};

export function EmailVerifyForm({ email, initialSent = false }: EmailVerifyFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(initialSent);
  const [error, setError] = useState<string | null>(null);

  async function sendCode() {
    setSending(true);
    setError(null);

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: false },
    });

    setSending(false);

    if (otpError) {
      setError(otpError.message);
      return;
    }

    setSent(true);
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    const token = code.replace(/\s/g, "");
    if (token.length < 6) {
      setError("Enter the 6-digit code from your email.");
      return;
    }

    setVerifying(true);
    setError(null);

    const supabase = createClient();

    let verifyError = (
      await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      })
    ).error;

    if (verifyError) {
      verifyError = (
        await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        })
      ).error;
    }

    if (verifyError) {
      setVerifying(false);
      setError(verifyError.message);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      data: { [EMAIL_VERIFIED_METADATA_KEY]: true },
    });

    setVerifying(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={verifyCode} className="space-y-4">
      <div className="card-surface px-4 py-3 text-xs text-muted">
        <p className="flex items-center gap-2 font-medium text-foreground">
          <Mail className="h-3.5 w-3.5 text-neon-cyan" />
          Email verification
        </p>
        <p className="mt-2">
          Enter the 6-digit code sent to{" "}
          <span className="text-neon-cyan">{email}</span>
        </p>
      </div>

      {!initialSent && (
        <button
          type="button"
          disabled={sending}
          onClick={() => void sendCode()}
          className="cyber-btn-primary w-full py-3 text-sm disabled:opacity-50"
        >
          {sending ? "Sending…" : sent ? "Resend code" : "Send verification code"}
        </button>
      )}

      {sent && (
        <p className="text-center text-xs text-neon-green">
          Code sent — check inbox and spam.
        </p>
      )}

      {initialSent && (
        <button
          type="button"
          disabled={sending}
          onClick={() => void sendCode()}
          className="w-full text-center text-xs text-muted hover:text-neon-cyan"
        >
          {sending ? "Sending…" : "Resend code"}
        </button>
      )}

      <AuthField
        id="code"
        label="Verification code"
        icon={KeyRound}
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        placeholder="000000"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
        required
      />

      {error && (
        <p className="rounded-sm border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={verifying || code.length < 6}
        className="cyber-btn-solid flex w-full items-center justify-center gap-2 py-3.5 text-sm disabled:opacity-50"
      >
        {verifying ? "Verifying…" : "Verify & enter"}
        <ArrowRight className="h-4 w-4" strokeWidth={2.5} />
      </button>
    </form>
  );
}
