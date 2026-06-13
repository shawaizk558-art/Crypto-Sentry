import { OAUTH_INTENT_COOKIE } from "@/lib/auth/oauth-intent";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
const MAX_AGE_SECONDS = 600;

// Stores whether the next Google OAuth flow is signup or login.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const intent = body.intent === "signup" ? "signup" : "login";

  const cookieStore = await cookies();
  cookieStore.set(OAUTH_INTENT_COOKIE, intent, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });

  return NextResponse.json({ ok: true });
}
