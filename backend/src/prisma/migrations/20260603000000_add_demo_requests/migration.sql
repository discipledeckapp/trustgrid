-- CreateTable
CREATE TABLE "demo_requests" (
    "id" TEXT NOT NULL,
    "institutionName" TEXT NOT NULL,
    "institutionType" TEXT,
    "contactName" TEXT NOT NULL,
    "contactRole" TEXT,
    "contactPhone" TEXT NOT NULL,
    "contactEmail" TEXT,
    "message" TEXT,
    "status" TEXT NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_requests_pkey" PRIMARY KEY ("id")
);
