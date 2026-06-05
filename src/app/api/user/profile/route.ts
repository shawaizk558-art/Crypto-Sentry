import { requireSessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function PATCH(request: Request) {
  try {
    const user = await requireSessionUser();
    const body = await request.json();
    const name = body.name?.toString().trim();

    if (!name) {
      return NextResponse.json({ error: "Name cannot be empty." }, { status: 400 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name },
      select: { id: true, name: true, email: true, image: true },
    });

    return NextResponse.json({ user: updated });
  } catch (err) {
    if (err instanceof Error && err.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Could not update profile." }, { status: 500 });
  }
}
