import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { TwoFactorSetupForm } from "@/components/auth/two-factor-setup-form";
import { Suspense } from "react";

export default function TwoFactorSetupPage() {
  return (
    <AuthSplitLayout
      title="Google Authenticator"
      subtitle="Set up on your phone — Crypto Sentry does not generate codes"
    >
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <TwoFactorSetupForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
