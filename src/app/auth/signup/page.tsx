import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { SignupForm } from "@/components/auth/signup-form";

// Signup page with split auth layout and registration form.
export default function SignupPage() {
  return (
    <AuthSplitLayout
      title="Recruit agent"
      subtitle="Create operative node / Crypto Sentry"
    >
      <SignupForm />
    </AuthSplitLayout>
  );
}
