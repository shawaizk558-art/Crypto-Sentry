import { prisma } from "@/lib/db/prisma";
import { NextResponse } from "next/server";

type RouteContext = { params: Promise<{ userId: string }> };

// Serves a user's uploaded avatar from PostgreSQL, or redirects to an external image URL.
export async function GET(_request: Request, context: RouteContext) {
  const { userId } = await context.params;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { avatar_data: true, avatar_mime: true, image: true },
  });

  if (!user) {
    return new NextResponse(null, { status: 404 });
  }

  if (user.avatar_data && user.avatar_mime) {
    return new NextResponse(new Uint8Array(user.avatar_data), {
      headers: {
        "Content-Type": user.avatar_mime,
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  }

  if (user.image?.startsWith("http")) {
    return NextResponse.redirect(user.image);
  }

  return new NextResponse(null, { status: 404 });
}
