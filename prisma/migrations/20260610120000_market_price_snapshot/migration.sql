-- CreateTable
CREATE TABLE "MarketPriceSnapshot" (
    "id" TEXT NOT NULL DEFAULT 'global',
    "coins" JSONB NOT NULL,
    "baseline" JSONB NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketPriceSnapshot_pkey" PRIMARY KEY ("id")
);
