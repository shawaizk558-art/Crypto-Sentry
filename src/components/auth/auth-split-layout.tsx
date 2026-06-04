import { Shield } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

export function AuthSplitLayout({
  children,
  title,
  subtitle,
}: {
  children: ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-neon-green/10">
              <Shield className="h-6 w-6 text-neon-green" strokeWidth={2} />
            </div>
            <h1 className="text-2xl font-bold italic tracking-tight text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-bg-panel lg:block">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 30% 20%, rgba(0,255,65,0.15), transparent 50%), radial-gradient(ellipse 50% 50% at 80% 80%, rgba(0,255,65,0.08), transparent), linear-gradient(160deg, #0a0a0a 0%, #111 40%, #0d120d 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0,255,65,0.04) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0,255,65,0.04) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute left-1/4 top-1/3 h-48 w-48 rounded-full border border-neon-green/20 bg-neon-green/5 blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full border border-neon-green/10 bg-transparent" />
        <svg
          className="absolute inset-0 h-full w-full opacity-30"
          viewBox="0 0 400 400"
          aria-hidden
        >
          <path
            d="M0 200 Q100 100 200 200 T400 200"
            fill="none"
            stroke="#00ff41"
            strokeWidth="1"
          />
          <path
            d="M0 250 Q150 350 300 150 T400 280"
            fill="none"
            stroke="#00ff41"
            strokeWidth="0.5"
            opacity="0.5"
          />
        </svg>
        <div className="absolute bottom-10 left-10 right-10 rounded-2xl border border-border/80 bg-bg-deep/60 p-6 backdrop-blur-md">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neon-green">
            Network expansion
          </p>
          <h2 className="mt-2 text-lg font-bold text-foreground">
            Request operative node //
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Every new agent strengthens the Crypto Sentry mesh. Secure access with
            encrypted credentials and optional two-factor verification.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AuthFooterLink({
  text,
  linkText,
  href,
}: {
  text: string;
  linkText: string;
  href: string;
}) {
  return (
    <p className="mt-6 text-center text-sm text-muted">
      {text}{" "}
      <Link href={href} className="font-medium text-neon-green hover:underline">
        {linkText}
      </Link>
    </p>
  );
}
