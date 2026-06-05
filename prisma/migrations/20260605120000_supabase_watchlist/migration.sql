-- Watchlist.user_id stores Supabase auth.users UUID (no local User FK)
ALTER TABLE "Watchlist" DROP CONSTRAINT IF EXISTS "Watchlist_user_id_fkey";

CREATE INDEX IF NOT EXISTS "Watchlist_user_id_idx" ON "Watchlist"("user_id");
