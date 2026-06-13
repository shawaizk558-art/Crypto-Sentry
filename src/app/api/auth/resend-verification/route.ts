import { auth } from "@/auth";
import { createAndSendVerificationEmail } from "@/lib/auth/email-verification";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// Resends the verification email for the currently signed-in user.
export async function POST() {
  try {
    const session = await auth();
    const userId = session?.user?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Email is already verified." }, { status: 400 });
    }

    await createAndSendVerificationEmail(userId, user.email);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/auth/resend-verification]", err);
    return NextResponse.json(
      { error: "Could not resend verification email. Restart the dev server and try again." },
      { status: 500 },
    );
  }
}
