import { hashPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = body.email?.toString().trim().toLowerCase();
    const password = body.password?.toString();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required." }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    const password_hash = await hashPassword(password);

    await prisma.user.create({
      data: {
        email,
        password_hash,
        name: email.split("@")[0],
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Could not create account." }, { status: 500 });
  }
}
