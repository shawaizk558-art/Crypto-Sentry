import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { verifyTotpCode } from "@/lib/auth/totp";
import { getTwoFactorState, type TwoFactorState } from "@/lib/db/two-factor";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = await request.json();
  if (!code?.toString()) {
    return NextResponse.json({ error: "Code required" }, { status: 400 });
  }

  const user: TwoFactorState | null = await getTwoFactorState(session.user.id);

  if (!user?.two_factor_enabled || !user.two_factor_secret) {
    return NextResponse.json({ error: "2FA not enabled" }, { status: 400 });
  }

  const valid = verifyTotpCode(user.two_factor_secret, code.toString());
  if (!valid) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  return NextResponse.json({ ok: true });
}
