-- Mandatory TOTP setup on first sign-up (separate from optional login 2FA)

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "signup_2fa_completed" BOOLEAN NOT NULL DEFAULT false;

-- Existing accounts are grandfathered so they are not forced through sign-up 2FA again
UPDATE "User" SET "signup_2fa_completed" = true;
