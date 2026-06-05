import { EMAIL_VERIFIED_METADATA_KEY, isGoogleAuthUser } from "@/lib/auth/email-verified";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user && isGoogleAuthUser(user)) {
        await supabase.auth.updateUser({
          data: { [EMAIL_VERIFIED_METADATA_KEY]: true },
        });
      }

      return NextResponse.redirect(
        `${origin}${next.startsWith("/") ? next : `/${next}`}`,
      );
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=callback`);
}
