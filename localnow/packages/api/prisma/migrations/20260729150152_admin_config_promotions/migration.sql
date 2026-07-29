-- CreateTable
CREATE TABLE "platform_config" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "qrExpiryMinutes" INTEGER NOT NULL DEFAULT 15,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_config_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_promotions" (
    "id" TEXT NOT NULL,
    "cityId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pointsMultiplier" DECIMAL(4,2) NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "platform_promotions_cityId_idx" ON "platform_promotions"("cityId");

-- AddForeignKey
ALTER TABLE "platform_promotions" ADD CONSTRAINT "platform_promotions_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "cities"("id") ON DELETE SET NULL ON UPDATE CASCADE;

