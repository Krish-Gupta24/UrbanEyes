-- AlterTable
ALTER TABLE "public"."ParkingSlip" ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "revenue" DOUBLE PRECISION DEFAULT 0;
