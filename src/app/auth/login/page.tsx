import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { LoginForm } from "@/components/auth/login-form";

// Login page with split auth layout and credentials form.
export default function LoginPage() {
  return (
    <AuthSplitLayout
      title="Access terminal"
      subtitle="Authenticate operative node / Crypto Sentry"
    >
      <LoginForm />
    </AuthSplitLayout>
  );
}
