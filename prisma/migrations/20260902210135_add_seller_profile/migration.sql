-- CreateTable
CREATE TABLE "SellerProfile" (
    "id" TEXT NOT NULL,
    "sellerAddress" TEXT NOT NULL,
    "monthlyRevenueReais" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerProfile_sellerAddress_key" ON "SellerProfile"("sellerAddress");
