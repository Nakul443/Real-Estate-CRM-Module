-- DropForeignKey
ALTER TABLE "Deal" DROP CONSTRAINT "Deal_propertyId_fkey";

-- AlterTable
ALTER TABLE "Deal" ALTER COLUMN "propertyId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "Property"("id") ON DELETE SET NULL ON UPDATE CASCADE;
