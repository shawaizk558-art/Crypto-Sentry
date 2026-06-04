import { auth } from "@/lib/auth/middleware-auth";
import { NextResponse } from "next/server";

const authEntryPaths = [
  "/auth/login",
  "/auth/signup",
  "/auth/complete",
  "/auth/google-verified",
  "/login",
  "/signup",
];

const authApiPrefix = "/api/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith(authApiPrefix)) {
    return NextResponse.next();
  }

  if (authEntryPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/auth/2fa/verify")) {
    if (!session?.user) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/auth/2fa/setup")) {
    return NextResponse.redirect(new URL("/auth/signup", req.url));
  }

  if (!session?.user) {
    const login = new URL("/auth/login", req.url);
    login.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(login);
  }

  if (session.user.twoFactorEnabled && !session.user.is2FAVerified) {
    if (!pathname.startsWith("/auth/2fa/verify")) {
      return NextResponse.redirect(new URL("/auth/2fa/verify", req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
