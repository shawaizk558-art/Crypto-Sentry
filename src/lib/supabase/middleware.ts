import { isAppEmailVerified } from "@/lib/auth/email-verified";
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseAnonKey, getSupabaseUrl } from "@/lib/supabase/env";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(getSupabaseUrl(), getSupabaseAnonKey(), {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  const isAuthRoute =
    pathname.startsWith("/auth") || pathname === "/login" || pathname === "/signup";

  if (!user && !isAuthRoute) {
    const login = new URL("/auth/login", request.url);
    login.searchParams.set("next", pathname);
    return NextResponse.redirect(login);
  }

  if (user) {
    const verified = isAppEmailVerified(user);
    const onVerifyPage = pathname.startsWith("/auth/verify-email");

    if (!verified && !onVerifyPage && !pathname.startsWith("/auth/callback")) {
      return NextResponse.redirect(new URL("/auth/verify-email", request.url));
    }

    if (
      verified &&
      (pathname === "/auth/login" ||
        pathname === "/auth/signup" ||
        pathname === "/login" ||
        pathname === "/signup")
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    if (verified && onVerifyPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return supabaseResponse;
}
