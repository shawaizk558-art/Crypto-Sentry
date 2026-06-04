"use client";

import { formatTotpSecretForGoogleAuth } from "@/lib/auth/totp-client";

type Props = {
  manualKey?: string | null;
  compact?: boolean;
};

export function GoogleAuthenticatorGuide({ manualKey, compact }: Props) {
  const formattedKey = manualKey ? formatTotpSecretForGoogleAuth(manualKey) : null;

  return (
    <div className="space-y-4 rounded-xl border border-border bg-bg-elevated/50 p-4">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white">
          <GoogleAuthenticatorIcon />
        </div>
        <div>
          <p className="text-sm font-semibold text-foreground">Google Authenticator</p>
          <p className="text-xs text-muted">
            Codes are generated on your phone — not inside Crypto Sentry.
          </p>
        </div>
      </div>

      {!compact && (
        <ol className="list-decimal space-y-2 pl-4 text-sm text-muted">
          <li>
            Install{" "}
            <a
              href="https://apps.apple.com/app/google-authenticator/id388497605"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-green hover:underline"
            >
              iOS
            </a>{" "}
            or{" "}
            <a
              href="https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neon-green hover:underline"
            >
              Android
            </a>{" "}
            Google Authenticator.
          </li>
          <li>
            Tap <span className="text-foreground">+</span> →{" "}
            <span className="text-foreground">Scan a QR code</span> and scan below.
          </li>
          <li>
            Or choose <span className="text-foreground">Enter a setup key</span> and paste
            the key.
          </li>
          <li>
            Enter the 6-digit code shown <span className="text-foreground">in Google Authenticator</span>{" "}
            below to confirm.
          </li>
        </ol>
      )}

      {formattedKey && (
        <div>
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted">
            Setup key (manual entry)
          </p>
          <code className="block break-all rounded-lg border border-border bg-bg-deep px-3 py-2 font-mono text-sm text-neon-green">
            {formattedKey}
          </code>
        </div>
      )}
    </div>
  );
}

function GoogleAuthenticatorIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden>
      <path
        fill="#4285F4"
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93V18h2v1.93A8.01 8.01 0 0 0 12 20c-1.74 0-3.34-.55-4.65-1.47L8.5 17.5A6 6 0 0 1 12 18a6 6 0 0 1 3.5 1.12l.85-1.43A7.96 7.96 0 0 0 12 20a7.96 7.96 0 0 1-5-1.79V18h2v2.93z"
      />
      <path
        fill="#34A853"
        d="M12 6c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 .74-.4 1.41-1.03 1.76l-.97.58V14h2v-.66l1.24-.74C16.68 12.08 17 11.08 17 10c0-2.21-1.79-4-4-4z"
      />
    </svg>
  );
}
