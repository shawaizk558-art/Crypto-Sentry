import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { ClearStaleAuthSession } from "@/components/auth/clear-stale-auth-session";
import { SignupForm } from "@/components/auth/signup-form";

export default function SignupPage() {
  return (
    <AuthSplitLayout
      title="Recruit agent"
      subtitle="Use Google sign-up for account + password + phone verification"
    >
      <ClearStaleAuthSession />
      <SignupForm />
    </AuthSplitLayout>
  );
}
