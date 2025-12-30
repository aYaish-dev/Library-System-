-- AlterTable
ALTER TABLE "ResourceCopy" ADD COLUMN     "holdUntil" TIMESTAMP(3),
ADD COLUMN     "holdUserId" INTEGER;
