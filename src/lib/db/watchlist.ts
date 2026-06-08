import "server-only";
import { prisma } from "@/lib/db/prisma";

// Get user's saved coins, newest first.
export async function getUserWatchlist(userId: string) {
  return prisma.watchlist.findMany({
    where: { user_id: userId },
    orderBy: { added_at: "desc" },
  });
}

// Add a coin to user's watchlist.
export async function addToWatchlist(
  userId: string,
  assetId: string,
  assetName: string,
) {
  return prisma.watchlist.upsert({
    where: {
      user_id_asset_id: { user_id: userId, asset_id: assetId },
    },
    create: {
      user_id: userId,
      asset_id: assetId,
      asset_name: assetName,
    },
    update: { asset_name: assetName },
  });
}

// Remove a coin from user's watchlist.
export async function removeFromWatchlist(userId: string, assetId: string) {
  return prisma.watchlist.deleteMany({
    where: { user_id: userId, asset_id: assetId },
  });
}

// Get all coin IDs that anyone has on their watchlist.
export async function getAllDistinctWatchlistAssetIds(): Promise<string[]> {
  const rows = await prisma.watchlist.findMany({
    select: { asset_id: true },
    distinct: ["asset_id"],
  });
  return rows.map((r) => r.asset_id);
}
