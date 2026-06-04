import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { enableLoginTwoFactor } from "@/lib/db/two-factor";

/** Enable optional 2FA on sign-in (Settings). Requires sign-up 2FA already completed. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await enableLoginTwoFactor(session.user.id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Set up your authenticator during sign-up first" },
      { status: 400 },
    );
  }
}
