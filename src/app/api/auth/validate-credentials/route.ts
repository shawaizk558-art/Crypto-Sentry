import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { getUserByEmailForCredentials } from "@/lib/db/user";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    const normalized = email?.toString().toLowerCase().trim();
    const pwd = password?.toString();

    if (!normalized || !pwd) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const user = await getUserByEmailForCredentials(normalized);
    if (!user?.password_hash) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    const valid = await verifyPassword(pwd, user.password_hash);
    if (!valid) {
      return NextResponse.json({ ok: false }, { status: 401 });
    }

    return NextResponse.json({
      ok: true,
      requires2FA: user.two_factor_enabled,
    });
  } catch {
    return NextResponse.json({ error: "Validation failed" }, { status: 500 });
  }
}
