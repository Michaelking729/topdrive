-- CreateEnum
CREATE TYPE "RideStatus" AS ENUM ('REQUESTED', 'ACCEPTED', 'ARRIVING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL,
    "pickup" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "estimate" DOUBLE PRECISION NOT NULL,
    "offeredPrice" DOUBLE PRECISION,
    "status" "RideStatus" NOT NULL DEFAULT 'REQUESTED',
    "driverName" TEXT,
    "driverLat" DOUBLE PRECISION,
    "driverLng" DOUBLE PRECISION,
    "driverUpdatedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ride_pkey" PRIMARY KEY ("id")
);
