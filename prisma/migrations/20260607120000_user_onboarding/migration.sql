ALTER TABLE "User" ADD COLUMN "onboarding_completed" BOOLEAN NOT NULL DEFAULT false;

-- Only new signups after this migration should see the induction tour.
UPDATE "User" SET "onboarding_completed" = true;
