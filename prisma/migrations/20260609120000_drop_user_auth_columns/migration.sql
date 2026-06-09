-- Remove unused email verification and 2FA columns from User
ALTER TABLE "User" DROP COLUMN IF EXISTS "emailVerified";
ALTER TABLE "User" DROP COLUMN IF EXISTS "two_factor_enabled";
ALTER TABLE "User" DROP COLUMN IF EXISTS "two_factor_secret";
ALTER TABLE "User" DROP COLUMN IF EXISTS "signup_2fa_completed";
