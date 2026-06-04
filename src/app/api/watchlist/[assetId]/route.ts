import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { removeFromWatchlist } from "@/lib/db/watchlist";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId } = await params;
  await removeFromWatchlist(session.user.id, assetId);

  return NextResponse.json({ ok: true });
}
