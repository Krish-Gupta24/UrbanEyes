-- AlterTable
ALTER TABLE "public"."ParkingSpot" ADD COLUMN     "occupiedSpots" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalSpots" INTEGER NOT NULL DEFAULT 0;
