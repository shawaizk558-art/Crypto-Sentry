import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { auth } from "@/lib/auth";
import {
  encryptTotpSecret,
  generateTotpSecret,
  getTotpUri,
  verifyPlainTotpCode,
} from "@/lib/auth/totp";
import {
  completeSignupTwoFactor,
  enableLoginTwoFactorWithSecret,
  getTwoFactorState,
} from "@/lib/db/two-factor";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const mode = new URL(request.url).searchParams.get("mode");
  const state = await getTwoFactorState(session.user.id);

  if (mode === "login" && state?.two_factor_secret) {
    return NextResponse.json({
      error: "Authenticator already registered. Enable sign-in 2FA from Settings.",
    }, { status: 400 });
  }

  const secret = generateTotpSecret();
  const uri = getTotpUri(session.user.email, secret);
  const qrDataUrl = await QRCode.toDataURL(uri);

  return NextResponse.json({
    secret,
    qrDataUrl,
    uri,
    mode: mode === "login" ? "login" : "signup",
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code, secret, mode } = await request.json();
  if (!code || !secret) {
    return NextResponse.json({ error: "Code and secret required" }, { status: 400 });
  }

  const valid = verifyPlainTotpCode(secret.toString(), code.toString());
  if (!valid) {
    return NextResponse.json({ error: "Invalid code" }, { status: 401 });
  }

  const encrypted = encryptTotpSecret(secret.toString());

  if (mode === "login") {
    await enableLoginTwoFactorWithSecret(session.user.id, encrypted);
  } else {
    await completeSignupTwoFactor(session.user.id, encrypted);
  }

  return NextResponse.json({ ok: true, mode: mode === "login" ? "login" : "signup" });
}
