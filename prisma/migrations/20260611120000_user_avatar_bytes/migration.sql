-- Store uploaded profile avatars in PostgreSQL (replaces Supabase Storage).
ALTER TABLE "User" ADD COLUMN "avatar_data" BYTEA;
ALTER TABLE "User" ADD COLUMN "avatar_mime" TEXT;
