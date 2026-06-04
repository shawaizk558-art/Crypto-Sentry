-- CreateTable (User)
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable (Watchlist)
CREATE TABLE "Watchlist" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "added_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
);

-- CreateTable (CryptoAlert)
CREATE TABLE "CryptoAlert" (
    "id" TEXT NOT NULL,
    "asset_id" TEXT NOT NULL,
    "asset_name" TEXT NOT NULL,
    "price_at_drop" DOUBLE PRECISION NOT NULL,
    "drop_percentage" DOUBLE PRECISION NOT NULL,
    "detected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CryptoAlert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (User)
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex (Watchlist)
CREATE UNIQUE INDEX "Watchlist_user_id_asset_id_key" ON "Watchlist"("user_id", "asset_id");

-- AddForeignKey (Watchlist)
ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
