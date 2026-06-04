import { NextResponse } from "next/server";
import { hashPassword, validatePasswordStrength } from "@/lib/auth/password";
import { prisma } from "@/lib/db/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = body.name?.toString().trim();
    const email = body.email?.toString().toLowerCase().trim();
    const password = body.password?.toString();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return NextResponse.json({ error: passwordError }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const password_hash = await hashPassword(password);

    await prisma.user.create({
      data: {
        name,
        email,
        password_hash,
        emailVerified: new Date(),
        signup_2fa_completed: true,
      },
    });

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
