import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { GoogleVerifiedContinue } from "@/components/auth/google-verified-continue";
import { Suspense } from "react";

export default function GoogleVerifiedPage() {
  return (
    <AuthSplitLayout
      title="Google verified"
      subtitle="Phone check handled by Google — not a QR code in this app"
    >
      <Suspense fallback={<p className="text-sm text-muted">Loading…</p>}>
        <GoogleVerifiedContinue />
      </Suspense>
    </AuthSplitLayout>
  );
}
