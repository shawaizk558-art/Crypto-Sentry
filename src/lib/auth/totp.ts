import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";
import { generateSecret, generateURI, verifySync } from "otplib";

function getEncryptionKey() {
  const secret =
    process.env.TOTP_ENCRYPTION_KEY ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("TOTP_ENCRYPTION_KEY or AUTH_SECRET must be set");
  }
  return createHash("sha256").update(secret).digest();
}

export function encryptTotpSecret(plain: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `${iv.toString("base64")}.${tag.toString("base64")}.${encrypted.toString("base64")}`;
}

export function decryptTotpSecret(stored: string): string {
  const key = getEncryptionKey();
  const [ivB64, tagB64, dataB64] = stored.split(".");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Invalid encrypted secret");
  const iv = Buffer.from(ivB64, "base64");
  const tag = Buffer.from(tagB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
}

export function generateTotpSecret() {
  return generateSecret();
}

/** Standard `otpauth://` URI — works with Google Authenticator (not a custom in-app 2FA). */
export function getTotpUri(email: string, secret: string) {
  return generateURI({
    issuer: "CryptoSentry",
    label: email,
    secret,
    algorithm: "sha1",
    digits: 6,
    period: 30,
  });
}

export function formatTotpSecretForGoogleAuth(secret: string) {
  return secret.replace(/\s/g, "").toUpperCase().match(/.{1,4}/g)?.join(" ") ?? secret;
}

export function verifyTotpCode(secretEncrypted: string, code: string) {
  const secret = decryptTotpSecret(secretEncrypted);
  return verifySync({ secret, token: code.replace(/\s/g, "") }).valid;
}

export function verifyPlainTotpCode(secret: string, code: string) {
  return verifySync({ secret, token: code.replace(/\s/g, "") }).valid;
}
