import { AuthSplitLayout } from "@/components/auth/auth-split-layout";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const messages: Record<string, { title: string; body: string }> = {
  Configuration: {
    title: "Auth configuration error",
    body:
      "Google sign-in failed. In Google Cloud Console → APIs & Services → Credentials, open your OAuth client, create a new Client secret, paste it into GOOGLE_CLIENT_SECRET in .env (no extra quotes or spaces), and restart npm run dev. Redirect URI must be http://localhost:3000/api/auth/callback/google",
  },
  OAuthAccountNotLinked: {
    title: "Google account not linked",
    body:
      "That email already has a Crypto Sentry password account. Sign in with email and password first, or sign up with Google using a new email. You can also try Google again — we now allow linking the same email.",
  },
  AccessDenied: {
    title: "Access denied",
    body: "You cancelled sign-in or your account is not allowed to access this app.",
  },
  Verification: {
    title: "Verification failed",
    body: "The sign-in link expired or was already used. Try again from the login page.",
  },
  Default: {
    title: "Sign-in error",
    body: "Something went wrong during authentication. Try again or use email and password.",
  },
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const info = messages[error ?? ""] ?? messages.Default;

  return (
    <AuthSplitLayout
      title={info.title}
      subtitle="Crypto Sentry / authentication"
    >
      <div className="card-surface space-y-6 p-6">
        <p className="text-sm leading-relaxed text-muted">{info.body}</p>
        {process.env.NODE_ENV === "development" && error && (
          <p className="font-mono text-xs text-dim">
            Error code: <span className="text-neon-green">{error}</span>
          </p>
        )}
        <Link href="/auth/login" className="block">
          <Button type="button" variant="primary" size="lg" className="w-full">
            Back to login
          </Button>
        </Link>
      </div>
    </AuthSplitLayout>
  );
}
