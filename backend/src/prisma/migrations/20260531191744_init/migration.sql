-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('ESTATE', 'CHURCH', 'SCHOOL', 'UNIVERSITY', 'CONVENTION_ORGANIZER', 'FACILITY_MANAGER', 'SMART_CITY_OPERATOR', 'LOCAL_GOVERNMENT', 'CORPORATE', 'NGO');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PLATFORM_ADMIN', 'INSTITUTION_ADMIN', 'INSTITUTION_OPERATOR', 'INSTITUTION_VIEWER', 'WORKER', 'VENDOR_REPRESENTATIVE', 'RESIDENT');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('UNVERIFIED', 'PENDING', 'PARTIALLY_VERIFIED', 'FULLY_VERIFIED', 'VERIFICATION_FAILED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "TrustEventType" AS ENUM ('ACCOUNT_CREATED', 'IDENTITY_VERIFIED', 'CREDENTIAL_VERIFIED', 'DEPLOYMENT_COMPLETED', 'DEPLOYMENT_ABANDONED', 'RATING_SUBMITTED', 'ENDORSEMENT_ADDED', 'ENDORSEMENT_REMOVED', 'INCIDENT_RAISED', 'INCIDENT_RESOLVED', 'INCIDENT_DISMISSED', 'INACTIVITY_PENALTY', 'MANUAL_ADJUSTMENT', 'SUSPENSION', 'REINSTATEMENT');

-- CreateEnum
CREATE TYPE "ServiceRequestStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEWING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "AssignmentStatus" AS ENUM ('PENDING_ACCEPTANCE', 'ACCEPTED', 'DECLINED', 'ACTIVE', 'COMPLETED', 'ABANDONED', 'TERMINATED');

-- CreateEnum
CREATE TYPE "IncidentSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IncidentStatus" AS ENUM ('OPEN', 'UNDER_INVESTIGATION', 'PENDING_RESOLUTION', 'RESOLVED', 'DISMISSED', 'ESCALATED');

-- CreateEnum
CREATE TYPE "ProcurementStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "WorkerType" AS ENUM ('CONTRACTOR', 'FREELANCER', 'EMPLOYEE', 'VOLUNTEER', 'INTERN');

-- CreateTable
CREATE TABLE "institutions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "InstitutionType" NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT NOT NULL DEFAULT 'NG',
    "logoUrl" TEXT,
    "websiteUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "institution_configs" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "trustScoreWeights" JSONB NOT NULL DEFAULT '{}',
    "trustScoreTimeDecayDays" INTEGER NOT NULL DEFAULT 365,
    "minimumTrustScore" INTEGER NOT NULL DEFAULT 50,
    "requireIdentityVerification" BOOLEAN NOT NULL DEFAULT true,
    "requireFaceMatch" BOOLEAN NOT NULL DEFAULT false,
    "allowedIdentityProviders" TEXT[] DEFAULT ARRAY['NIN']::TEXT[],
    "endorsementsRequiredForActivation" INTEGER NOT NULL DEFAULT 0,
    "endorsementsRequiredForHighTrust" INTEGER NOT NULL DEFAULT 3,
    "serviceCategories" JSONB NOT NULL DEFAULT '[]',
    "workforceCategories" JSONB NOT NULL DEFAULT '[]',
    "slaRules" JSONB NOT NULL DEFAULT '{}',
    "escalationRules" JSONB NOT NULL DEFAULT '{}',
    "serviceZones" JSONB NOT NULL DEFAULT '[]',
    "notificationChannels" JSONB NOT NULL DEFAULT '{}',
    "primaryColor" TEXT,
    "customDomain" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "institution_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_accounts" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "profilePhotoUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worker_profiles" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "workerType" "WorkerType" NOT NULL DEFAULT 'CONTRACTOR',
    "primarySkill" TEXT NOT NULL,
    "skills" TEXT[],
    "categoryIds" TEXT[],
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "availabilityNotes" TEXT,
    "serviceZoneIds" TEXT[],
    "hourlyRate" DOUBLE PRECISION,
    "dailyRate" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "trustScoreUpdatedAt" TIMESTAMP(3),
    "totalDeployments" INTEGER NOT NULL DEFAULT 0,
    "completedDeployments" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "totalEndorsements" INTEGER NOT NULL DEFAULT 0,
    "bio" TEXT,
    "yearsExperience" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastActiveAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "worker_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_profiles" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "rcNumber" TEXT,
    "taxId" TEXT,
    "email" TEXT,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "serviceCategories" TEXT[],
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "trustScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalContracts" INTEGER NOT NULL DEFAULT 0,
    "completedContracts" INTEGER NOT NULL DEFAULT 0,
    "averageRating" DOUBLE PRECISION,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "isBlacklisted" BOOLEAN NOT NULL DEFAULT false,
    "blacklistReason" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "volunteer_profiles" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "skills" TEXT[],
    "trainingRecords" JSONB NOT NULL DEFAULT '[]',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'UNVERIFIED',
    "totalDeployments" INTEGER NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "volunteer_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "identity_verifications" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "providerName" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL DEFAULT 'NG',
    "idNumber" TEXT NOT NULL,
    "idNumberHash" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedAt" TIMESTAMP(3),
    "failureReason" TEXT,
    "biographicData" TEXT,
    "faceMatchScore" DOUBLE PRECISION,
    "faceMatchPassed" BOOLEAN,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "identity_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "credential_records" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "credentialType" TEXT NOT NULL,
    "issuingBody" TEXT NOT NULL,
    "credentialNumber" TEXT,
    "issuedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credential_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "document_records" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "documentType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "storageKey" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "fileSizeBytes" INTEGER NOT NULL,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "document_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "trust_events" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "workerId" TEXT,
    "vendorId" TEXT,
    "eventType" "TrustEventType" NOT NULL,
    "delta" DOUBLE PRECISION NOT NULL,
    "weightApplied" DOUBLE PRECISION NOT NULL,
    "referenceType" TEXT,
    "referenceId" TEXT,
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,

    CONSTRAINT "trust_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "endorsements" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "endorsedById" TEXT,
    "endorserName" TEXT NOT NULL,
    "endorserRole" TEXT,
    "comment" TEXT,
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" TIMESTAMP(3),
    "revokedReason" TEXT,

    CONSTRAINT "endorsements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "requiredSkills" TEXT[],
    "workersNeeded" INTEGER NOT NULL DEFAULT 1,
    "minimumTrustScore" DOUBLE PRECISION,
    "scheduledStartAt" TIMESTAMP(3),
    "scheduledEndAt" TIMESTAMP(3),
    "estimatedHours" DOUBLE PRECISION,
    "locationAddress" TEXT,
    "locationZoneId" TEXT,
    "status" "ServiceRequestStatus" NOT NULL DEFAULT 'DRAFT',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "slaDeadlineAt" TIMESTAMP(3),
    "escalatedAt" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workforce_assignments" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "serviceRequestId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "assignedById" TEXT NOT NULL,
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING_ACCEPTANCE',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "supervisorNotes" TEXT,
    "completionNotes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workforce_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment_workers" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'WORKER',
    "status" "AssignmentStatus" NOT NULL DEFAULT 'PENDING_ACCEPTANCE',
    "acceptedAt" TIMESTAMP(3),
    "declinedAt" TIMESTAMP(3),
    "declineReason" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "checkInAt" TIMESTAMP(3),
    "checkOutAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assignment_workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_requests" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "estimatedBudget" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'NGN',
    "vendorId" TEXT,
    "status" "ProcurementStatus" NOT NULL DEFAULT 'DRAFT',
    "requiredByDate" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "approvedById" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectedById" TEXT,
    "rejectionReason" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurement_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_line_items" (
    "id" TEXT NOT NULL,
    "procurementId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unitPrice" DOUBLE PRECISION,
    "totalPrice" DOUBLE PRECISION,

    CONSTRAINT "procurement_line_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_approvals" (
    "id" TEXT NOT NULL,
    "procurementId" TEXT NOT NULL,
    "approvedById" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comment" TEXT,
    "decidedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procurement_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "performance_reviews" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "serviceRequestId" TEXT,
    "workerId" TEXT,
    "vendorId" TEXT,
    "reviewedById" TEXT NOT NULL,
    "overallRating" DOUBLE PRECISION NOT NULL,
    "qualityRating" DOUBLE PRECISION,
    "punctualityRating" DOUBLE PRECISION,
    "communicationRating" DOUBLE PRECISION,
    "comment" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "performance_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_reports" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "workerId" TEXT,
    "vendorId" TEXT,
    "reportedById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "severity" "IncidentSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "IncidentStatus" NOT NULL DEFAULT 'OPEN',
    "incidentDate" TIMESTAMP(3) NOT NULL,
    "locationAddress" TEXT,
    "assignedToId" TEXT,
    "resolvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incident_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_notes" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "isInternal" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "incident_resolutions" (
    "id" TEXT NOT NULL,
    "incidentId" TEXT NOT NULL,
    "resolvedById" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "trustScoreImpact" DOUBLE PRECISION,
    "resolvedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incident_resolutions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "previousState" JSONB,
    "newState" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "institutions_slug_key" ON "institutions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "institutions_email_key" ON "institutions"("email");

-- CreateIndex
CREATE UNIQUE INDEX "institution_configs_institutionId_key" ON "institution_configs"("institutionId");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_institutionId_phone_key" ON "user_accounts"("institutionId", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "user_accounts_institutionId_email_key" ON "user_accounts"("institutionId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "worker_profiles_userId_key" ON "worker_profiles"("userId");

-- CreateIndex
CREATE INDEX "worker_profiles_institutionId_isActive_idx" ON "worker_profiles"("institutionId", "isActive");

-- CreateIndex
CREATE INDEX "worker_profiles_institutionId_trustScore_idx" ON "worker_profiles"("institutionId", "trustScore");

-- CreateIndex
CREATE INDEX "worker_profiles_institutionId_primarySkill_idx" ON "worker_profiles"("institutionId", "primarySkill");

-- CreateIndex
CREATE UNIQUE INDEX "identity_verifications_workerId_key" ON "identity_verifications"("workerId");

-- CreateIndex
CREATE INDEX "trust_events_workerId_institutionId_idx" ON "trust_events"("workerId", "institutionId");

-- CreateIndex
CREATE INDEX "trust_events_institutionId_createdAt_idx" ON "trust_events"("institutionId", "createdAt");

-- CreateIndex
CREATE INDEX "service_requests_institutionId_status_idx" ON "service_requests"("institutionId", "status");

-- CreateIndex
CREATE INDEX "service_requests_institutionId_createdAt_idx" ON "service_requests"("institutionId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "workforce_assignments_serviceRequestId_key" ON "workforce_assignments"("serviceRequestId");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_workers_assignmentId_workerId_key" ON "assignment_workers"("assignmentId", "workerId");

-- CreateIndex
CREATE UNIQUE INDEX "incident_resolutions_incidentId_key" ON "incident_resolutions"("incidentId");

-- CreateIndex
CREATE INDEX "audit_logs_institutionId_createdAt_idx" ON "audit_logs"("institutionId", "createdAt");

-- CreateIndex
CREATE INDEX "audit_logs_entityType_entityId_idx" ON "audit_logs"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "institution_configs" ADD CONSTRAINT "institution_configs_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_accounts" ADD CONSTRAINT "user_accounts_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_profiles" ADD CONSTRAINT "worker_profiles_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_profiles" ADD CONSTRAINT "worker_profiles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_accounts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_profiles" ADD CONSTRAINT "vendor_profiles_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "volunteer_profiles" ADD CONSTRAINT "volunteer_profiles_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "identity_verifications" ADD CONSTRAINT "identity_verifications_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "credential_records" ADD CONSTRAINT "credential_records_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_records" ADD CONSTRAINT "document_records_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_events" ADD CONSTRAINT "trust_events_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_events" ADD CONSTRAINT "trust_events_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trust_events" ADD CONSTRAINT "trust_events_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "endorsements" ADD CONSTRAINT "endorsements_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_requests" ADD CONSTRAINT "service_requests_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_assignments" ADD CONSTRAINT "workforce_assignments_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workforce_assignments" ADD CONSTRAINT "workforce_assignments_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "service_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_workers" ADD CONSTRAINT "assignment_workers_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "workforce_assignments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment_workers" ADD CONSTRAINT "assignment_workers_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_requests" ADD CONSTRAINT "procurement_requests_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_requests" ADD CONSTRAINT "procurement_requests_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_line_items" ADD CONSTRAINT "procurement_line_items_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "procurement_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procurement_approvals" ADD CONSTRAINT "procurement_approvals_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "procurement_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_serviceRequestId_fkey" FOREIGN KEY ("serviceRequestId") REFERENCES "service_requests"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "performance_reviews" ADD CONSTRAINT "performance_reviews_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "institutions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "worker_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_reports" ADD CONSTRAINT "incident_reports_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendor_profiles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_notes" ADD CONSTRAINT "incident_notes_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incident_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "incident_resolutions" ADD CONSTRAINT "incident_resolutions_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "incident_reports"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user_accounts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
