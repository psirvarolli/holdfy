-- CreateTable
CREATE TABLE "SellerWhatsapp" (
    "id" TEXT NOT NULL,
    "sellerAddress" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerWhatsapp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SellerWhatsapp_sellerAddress_key" ON "SellerWhatsapp"("sellerAddress");

-- CreateIndex
CREATE UNIQUE INDEX "SellerWhatsapp_phone_key" ON "SellerWhatsapp"("phone");
