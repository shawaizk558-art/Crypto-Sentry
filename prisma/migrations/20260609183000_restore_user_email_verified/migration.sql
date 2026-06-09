-- Required by @auth/prisma-adapter when creating OAuth users
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3);
