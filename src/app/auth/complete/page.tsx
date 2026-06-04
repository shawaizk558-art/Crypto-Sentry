import { auth } from "@/lib/auth";
import { getUserSessionFieldsById, skipMandatorySignupTwoFactor } from "@/lib/db/user";
import { redirect } from "next/navigation";

export default async function AuthCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent: rawIntent } = await searchParams;
  const intent = rawIntent === "signup" ? "signup" : "login";

  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/login");
  }

  await skipMandatorySignupTwoFactor(session.user.id);

  const dbUser = await getUserSessionFieldsById(session.user.id);

  if (dbUser?.two_factor_enabled) {
    redirect("/auth/2fa/verify");
  }

  if (intent === "signup") {
    redirect("/auth/google-verified?intent=signup");
  }

  redirect("/");
}
