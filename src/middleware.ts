import { authConfig } from "@/auth.config";
import NextAuth from "next-auth";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

// Send guests to login. Block API pages unless logged in.
export default auth((request) => {
  const { pathname } = request.nextUrl;
  const isLoggedIn = !!request.auth;

  const isAuthPage =
    pathname.startsWith("/auth") ||
    pathname === "/login" ||
    pathname === "/signup";

  const isPublicApi =
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/prices") ||
    pathname.startsWith("/api/market");

  if (pathname.startsWith("/api/") && isPublicApi) {
    return NextResponse.next();
  }

  if (!isLoggedIn && !isAuthPage) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (
    isLoggedIn &&
    (pathname === "/auth/login" ||
      pathname === "/auth/signup" ||
      pathname === "/login" ||
      pathname === "/signup")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
