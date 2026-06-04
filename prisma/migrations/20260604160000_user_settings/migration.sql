CREATE TABLE IF NOT EXISTS "UserSettings" (
    "user_id" TEXT NOT NULL,
    "alert_threshold" DOUBLE PRECISION NOT NULL DEFAULT -2.0,
    "aggressive_polling" BOOLEAN NOT NULL DEFAULT false,
    "ui_density" TEXT NOT NULL DEFAULT 'compact',
    "email_reports" BOOLEAN NOT NULL DEFAULT true,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("user_id")
);

ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
