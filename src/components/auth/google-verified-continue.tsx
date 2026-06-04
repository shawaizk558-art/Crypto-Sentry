"use client";

import { ArrowRight, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

export function GoogleVerifiedContinue() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignup = searchParams.get("intent") === "signup";

  if (!isSignup) {
    return (
      <p className="text-sm text-muted">
        <Link href="/" className="text-neon-green hover:underline">
          Continue to terminal
        </Link>
      </p>
    );
  }

  function goHome() {
    router.push("/");
    router.refresh();
  }

  return (
    <div className="card-surface space-y-5 p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neon-green/10">
          <Smartphone className="h-5 w-5 text-neon-green" />
        </div>
        <div className="space-y-3 text-sm text-muted">
          <p className="font-medium text-foreground">Google sign-up finished</p>
          <p>
            Account picker, password, and <span className="text-foreground">2-Step Verification</span>{" "}
            (for example &quot;Check your phone&quot; → tap <span className="text-foreground">Yes</span>)
            all happen on <span className="text-foreground">Google&apos;s pages</span> before you
            return here.
          </p>
          <p>
            If you never saw Google&apos;s screens, sign out and try again using{" "}
            <span className="text-foreground">Sign up with Google</span> (not an existing session).
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={goHome}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-neon-green py-3.5 text-sm font-bold uppercase tracking-wider text-black hover:opacity-90"
      >
        Enter terminal
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
