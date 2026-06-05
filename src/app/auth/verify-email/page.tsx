import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { EmailVerifyForm } from "@/components/auth/email-verify-form";
import { isAppEmailVerified } from "@/lib/auth/email-verified";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function VerifyEmailPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (isAppEmailVerified(user)) {
    redirect("/");
  }

  const email = user.email;
  if (!email) {
    redirect("/auth/login?error=no-email");
  }

  return (
    <AuthSplitLayout
      title="Verify operative"
      subtitle="Confirm your email to access the terminal"
    >
      <EmailVerifyForm email={email} />
    </AuthSplitLayout>
  );
}
