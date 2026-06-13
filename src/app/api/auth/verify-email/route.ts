import { signIn } from "@/auth";
import { isVerificationTokenValid } from "@/lib/auth/email-verification";
import { NextResponse } from "next/server";

// Verifies email from the link in the user's inbox and signs them in.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token")?.trim();
  if (!token || !(await isVerificationTokenValid(token))) {
    return NextResponse.redirect(new URL("/auth/login?error=InvalidVerification", request.url));
  }

  await signIn("credentials", {
    verificationToken: token,
    redirectTo: "/",
  });
}
