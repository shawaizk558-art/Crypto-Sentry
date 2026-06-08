import { requireSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

// Marks the authenticated user's onboarding tour as completed.
export async function PATCH() {
  try {
    const user = await requireSessionUser();

    await prisma.user.update({
      where: { id: user.id },
      data: { onboarding_completed: true },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not update onboarding." }, { status: 500 });
  }
}
