/** Client-safe helpers (no Node crypto). */

export function formatTotpSecretForGoogleAuth(secret: string) {
  return secret.replace(/\s/g, "").toUpperCase().match(/.{1,4}/g)?.join(" ") ?? secret;
}
