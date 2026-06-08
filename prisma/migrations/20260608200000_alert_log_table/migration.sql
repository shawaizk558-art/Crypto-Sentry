-- CreateTable
CREATE TABLE "AlertLog" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "alert_id" TEXT NOT NULL,
    "asset_symbol" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "drop_pct" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AlertLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AlertLog_user_id_created_at_idx" ON "AlertLog"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "AlertLog_alert_id_idx" ON "AlertLog"("alert_id");

-- AddForeignKey
ALTER TABLE "AlertLog" ADD CONSTRAINT "AlertLog_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Remove alert entries mistakenly stored in system logs
DELETE FROM "SystemLog" WHERE "level" = 'alert';
