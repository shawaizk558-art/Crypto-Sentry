import { auth } from "@/auth";
import { VerifyEmailPending } from "@/components/auth/verify-email-pending";

export default async function VerifyEmailPage() {
  const session = await auth();

  return <VerifyEmailPending email={session?.user?.email ?? null} />;
}
