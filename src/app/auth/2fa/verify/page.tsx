import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { TwoFactorVerifyForm } from "@/components/auth/two-factor-verify-form";

export default function TwoFactorVerifyPage() {
  return (
    <AuthSplitLayout
      title="Google Authenticator"
      subtitle="Enter the code from your phone app"
    >
      <TwoFactorVerifyForm />
    </AuthSplitLayout>
  );
}
