import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { ClearStaleAuthSession } from "@/components/auth/clear-stale-auth-session";
import { LoginForm } from "@/components/auth/login-form";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <AuthSplitLayout
      title="Access terminal"
      subtitle="Authenticate operative node / Crypto Sentry"
    >
      <ClearStaleAuthSession />
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </AuthSplitLayout>
  );
}
