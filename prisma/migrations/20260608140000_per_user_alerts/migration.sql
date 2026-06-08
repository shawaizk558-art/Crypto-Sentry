-- Remove legacy global alerts (no user association)
DELETE FROM "CryptoAlert";

-- AlterTable
ALTER TABLE "CryptoAlert" ADD COLUMN "user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "CryptoAlert" ADD CONSTRAINT "CryptoAlert_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX "CryptoAlert_user_id_idx" ON "CryptoAlert"("user_id");

-- CreateIndex
CREATE INDEX "CryptoAlert_user_id_detected_at_idx" ON "CryptoAlert"("user_id", "detected_at");
