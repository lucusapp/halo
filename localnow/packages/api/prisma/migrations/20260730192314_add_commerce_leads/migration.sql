-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CONVERTED', 'DISMISSED');

-- AlterTable
ALTER TABLE "commerces" ALTER COLUMN "authId" DROP NOT NULL,
ALTER COLUMN "cif" DROP NOT NULL;

-- CreateTable
CREATE TABLE "commerce_leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "businessName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "message" TEXT,
    "city" TEXT NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "commerce_leads_status_idx" ON "commerce_leads"("status");

