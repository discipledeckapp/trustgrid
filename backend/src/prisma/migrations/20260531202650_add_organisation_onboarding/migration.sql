-- CreateEnum
CREATE TYPE "OrganisationType" AS ENUM ('SOLE_PROPRIETOR', 'LIMITED_LIABILITY', 'PARTNERSHIP', 'NGO', 'COOPERATIVE', 'STAFFING_AGENCY', 'FACILITIES_COMPANY', 'SECURITY_COMPANY', 'CLEANING_COMPANY', 'OTHER');

-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'NEEDS_MORE_INFO', 'APPROVED', 'REJECTED', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "OnboardingType" AS ENUM ('INDIVIDUAL_WORKER', 'ORGANISATION', 'BRANCH');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "UserRole" ADD VALUE 'ORGANISATION_ADMIN';
ALTER TYPE "UserRole" ADD VALUE 'ORGANISATION_MANAGER';

-- CreateTable
CREATE TABLE "organisations" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "OrganisationType" NOT NULL DEFAULT 'OTHER',
    "rcNumber" TEXT,
    "taxId" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'NG',
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "description" TEXT,
    "serviceCategories" TEXT[],
    "serviceZoneIds" TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "onboardingStatus" "OnboardingStatus" NOT NULL DEFAULT 'DRAFT',
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalContracts" INTEGER NOT NULL DEFAULT 0,
    "completedContracts" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistReason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "adminUserId" TEXT,
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation_branches" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "serviceZoneIds" TEXT[],
    "managerUserId" TEXT,
    "managerName" TEXT,
    "managerPhone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "organisation_branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation_workers" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "branchId" TEXT,
    "workerId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'WORKER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "leftAt" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "organisation_workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisation_documents" (
    "id" TEXT NOT NULL,
    "organisationId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organisation_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "onboarding_applications" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "type" "OnboardingType" NOT NULL,
    "status" "OnboardingStatus" NOT NULL DEFAULT 'DRAFT',
    "firstName" TEXT,
    "lastName" TEXT,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "primarySkill" TEXT,
    "organisationName" TEXT,
    "stepCompleted" INTEGER NOT NULL DEFAULT 0,
    "formData" JSONB NOT NULL DEFAULT '{}',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewNotes" TEXT,
    "rejectionReason" TEXT,
    "workerId" TEXT,
    "organisationId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "onboarding_applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "organisations_institutionId_isActive_idx" ON "organisations"("institutionId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "organisations_institutionId_slug_key" ON "organisations"("institutionId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "organisation_workers_organisationId_workerId_key" ON "organisation_workers"("organisationId", "workerId");

-- CreateIndex
CREATE UNIQUE INDEX "onboarding_applications_workerId_key" ON "onboarding_applications"("workerId");

-- CreateIndex
CREATE INDEX "onboarding_applications_institutionId_status_idx" ON "onboarding_applications"("institutionId", "status");

-- CreateIndex
CREATE INDEX "onboarding_applications_phone_idx" ON "onboarding_applications"("phone");

-- AddForeignKey
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_branches" ADD CONSTRAINT "organisation_branches_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_workers" ADD CONSTRAINT "organisation_workers_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_workers" ADD CONSTRAINT "organisation_workers_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "organisation_branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_workers" ADD CONSTRAINT "organisation_workers_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisation_documents" ADD CONSTRAINT "organisation_documents_organisationId_fkey" FOREIGN KEY ("organisationId") REFERENCES "organisations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "onboarding_applications" ADD CONSTRAINT "onboarding_applications_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
