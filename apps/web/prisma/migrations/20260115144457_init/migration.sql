-- CreateTable
CREATE TABLE "Ride" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pickup" TEXT NOT NULL,
    "destination" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "estimate" INTEGER NOT NULL,
    "offeredPrice" INTEGER,
    "status" TEXT NOT NULL DEFAULT 'REQUESTED',
    "driverName" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
