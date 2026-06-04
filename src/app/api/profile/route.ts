import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getOrCreateUserSettings } from "@/lib/db/settings";
import { prisma } from "@/lib/db/prisma";
import { getUserWatchlist } from "@/lib/db/watchlist";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user, settings, watchlist] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        created_at: true,
        signup_2fa_completed: true,
        accounts: { where: { provider: "google" }, select: { provider: true } },
      },
    }),
    getOrCreateUserSettings(session.user.id),
    getUserWatchlist(session.user.id),
  ]);

  if (!user) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    name: user.name,
    email: user.email,
    image: user.image,
    createdAt: user.created_at,
    usesGoogle: user.accounts.length > 0,
    twoFactorVerified: user.signup_2fa_completed,
    watchlistCount: watchlist.length,
    alertThreshold: settings.alert_threshold,
    emailReports: settings.email_reports,
  });
}

export async function PATCH(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();
  if (!name?.toString().trim()) {
    return NextResponse.json({ error: "Name required" }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { id: session.user.id },
    data: { name: name.toString().trim() },
    select: { name: true, email: true, image: true },
  });

  return NextResponse.json(user);
}
