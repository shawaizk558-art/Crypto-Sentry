import "server-only";

import { randomBytes } from "crypto";
import { sendEmail } from "@/lib/auth/email";
import { prisma } from "@/lib/db/prisma";

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

function appBaseUrl(): string {
  return (
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000"
  );
}

// Creates a verification token and emails the link to the user.
export async function createAndSendVerificationEmail(userId: string, email: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + TOKEN_TTL_MS);

  await prisma.verificationToken.deleteMany({ where: { identifier: userId } });
  await prisma.verificationToken.create({
    data: { identifier: userId, token, expires },
  });

  const verifyUrl = `${appBaseUrl()}/api/auth/verify-email?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Verify your Crypto Sentry account",
    text: `Welcome to Crypto Sentry.\n\nVerify your email to access the dashboard:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
    html: `
      <p>Welcome to <strong>Crypto Sentry</strong>.</p>
      <p>Verify your email to access the dashboard:</p>
      <p><a href="${verifyUrl}">Verify email</a></p>
      <p>Or copy this link:<br /><code>${verifyUrl}</code></p>
      <p>This link expires in 24 hours.</p>
    `,
  });
}

export async function isVerificationTokenValid(token: string): Promise<boolean> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  return !!record && record.expires >= new Date();
}

// Validates a verification token, marks the user verified, and consumes the token.
export async function consumeVerificationToken(
  token: string,
): Promise<{ id: string; email: string; name: string | null; image: string | null } | null> {
  const record = await prisma.verificationToken.findUnique({ where: { token } });
  if (!record || record.expires < new Date()) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: record.identifier },
    select: { id: true, email: true, name: true, image: true },
  });
  if (!user) {
    return null;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { token } }),
  ]);

  return user;
}
