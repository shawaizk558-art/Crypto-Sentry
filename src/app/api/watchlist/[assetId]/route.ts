import { NextResponse } from "next/server";
import { removeFromWatchlist } from "@/lib/db/watchlist";
import { getSessionUser } from "@/lib/auth/session";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ assetId: string }> },
) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId } = await params;
  await removeFromWatchlist(user.id, assetId);
  return NextResponse.json({ ok: true });
}
