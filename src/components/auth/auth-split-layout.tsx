import { CyberBackground } from "@/components/layout/cyber-background";
import { Shield } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

// Two-column layout for login and signup pages.
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
    <div className="relative grid min-h-screen lg:grid-cols-2">
      <CyberBackground />

      <div className="relative flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-16">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-8">
            <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-sm border border-neon-cyan/30 bg-neon-cyan/10">
              <Shield className="h-6 w-6 text-neon-cyan cyan-glow" strokeWidth={2} />
              <span className="absolute -left-px -top-px h-2 w-2 border-l border-t border-neon-cyan" />
              <span className="absolute -bottom-px -right-px h-2 w-2 border-b border-r border-neon-magenta" />
            </div>
            <p className="font-display text-[10px] font-semibold uppercase tracking-[0.3em] text-neon-cyan">
              Crypto Sentry
            </p>
            <h1 className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-foreground sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted">
              {subtitle}
            </p>
          </div>
          {children}
        </div>
      </div>

      <div className="relative hidden overflow-hidden bg-bg-panel/80 lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 30% 20%, rgba(0,240,255,0.12), transparent 50%), radial-gradient(ellipse 50% 50% at 80% 80%, rgba(255,42,109,0.1), transparent), linear-gradient(160deg, #07070d 0%, #0c0c16 40%, #0a0a14 100%)",
          }}
        />
        <div className="absolute inset-0 cyber-grid opacity-60" />
        <div className="absolute inset-0 scanlines opacity-30" />

        <div className="absolute left-1/4 top-1/3 h-48 w-48 rounded-full border border-neon-cyan/20 bg-neon-cyan/5 blur-2xl" />
        <div className="absolute bottom-1/4 right-1/4 h-64 w-64 rounded-full border border-neon-magenta/15" />

        <svg
          className="absolute inset-0 h-full w-full opacity-20"
          viewBox="0 0 400 400"
          aria-hidden
        >
          <path
            d="M0 200 Q100 100 200 200 T400 200"
            fill="none"
            stroke="#00f0ff"
            strokeWidth="1"
          />
          <path
            d="M0 250 Q150 350 300 150 T400 280"
            fill="none"
            stroke="#ff2a6d"
            strokeWidth="0.5"
            opacity="0.6"
          />
        </svg>

        <div className="absolute bottom-10 left-10 right-10 card-surface card-glow-cyan p-6 backdrop-blur-md">
          <p className="font-mono text-[10px] uppercase tracking-widest text-neon-cyan">
            Network expansion
          </p>
          <h2 className="mt-2 font-display text-lg font-bold uppercase text-foreground">
            Join the mesh
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Every new operative strengthens the Crypto Sentry surveillance network.
            Sign in with email or Google — email signups verify with a one-time code.
          </p>
          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neon-cyan animate-pulse-dot" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-dim">
                Encrypted
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-neon-magenta animate-pulse-dot" />
              <span className="font-mono text-[9px] uppercase tracking-wider text-dim">
                Real-time
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Footer link for switching between login and signup.
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
      <Link href={href} className="font-medium text-neon-cyan hover:underline">
        {linkText}
      </Link>
    </p>
  );
}

// Horizontal divider with an "or" label between auth methods.
export function AuthOrDivider() {
  return (
    <div className="relative py-2">
      <div className="absolute inset-0 flex items-center">
        <span className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center text-xs uppercase">
        <span className="bg-bg-deep px-2 font-mono text-dim">or</span>
      </div>
    </div>
  );
}

