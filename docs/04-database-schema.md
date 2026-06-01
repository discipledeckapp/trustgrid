# TrustGrid — Database Schema

**Version:** 1.0  
**ORM:** Prisma  
**Database:** PostgreSQL  

---

## Schema Overview

```
Platform Tables (shared)
├── Institution
├── InstitutionConfig
├── IdentityProviderConfig
├── PlatformAuditLog
└── AdminUser

Core Registry Tables
├── UserAccount
├── WorkerProfile
├── VendorProfile
├── VolunteerProfile
└── SkillCategory

Verification Tables
├── IdentityVerification
├── CredentialRecord
└── DocumentRecord

Trust & Endorsement Tables
├── TrustScore (materialized view / cached)
├── TrustEvent (immutable log)
└── Endorsement

Service Operations Tables
├── ServiceRequest
├── WorkforceAssignment
├── AssignmentWorker
├── ProcurementRequest
├── ProcurementLineItem
└── ProcurementApproval

Performance & Incident Tables
├── PerformanceReview
├── IncidentReport
├── IncidentNote
└── IncidentResolution

Analytics Tables
├── DailyWorkerStat (materialized)
└── InstitutionMonthlyStats (materialized)
```

---

## Prisma Schema

```prisma
// schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════

enum InstitutionType {
  ESTATE
  CHURCH
  SCHOOL
  UNIVERSITY
  CONVENTION_ORGANIZER
  FACILITY_MANAGER
  SMART_CITY_OPERATOR
  LOCAL_GOVERNMENT
  CORPORATE
  NGO
}

enum UserRole {
  PLATFORM_ADMIN
  INSTITUTION_ADMIN
  INSTITUTION_OPERATOR
  INSTITUTION_VIEWER
  WORKER
  VENDOR_REPRESENTATIVE
  RESIDENT
}

enum VerificationStatus {
  UNVERIFIED
  PENDING
  PARTIALLY_VERIFIED
  FULLY_VERIFIED
  VERIFICATION_FAILED
  SUSPENDED
}

enum TrustEventType {
  ACCOUNT_CREATED
  IDENTITY_VERIFIED
  CREDENTIAL_VERIFIED
  DEPLOYMENT_COMPLETED
  RATING_SUBMITTED
  ENDORSEMENT_ADDED
  ENDORSEMENT_REMOVED
  INCIDENT_RAISED
  INCIDENT_RESOLVED
  INCIDENT_DISMISSED
  INACTIVITY_PENALTY
  MANUAL_ADJUSTMENT
  SUSPENSION
  REINSTATEMENT
}

enum ServiceRequestStatus {
  DRAFT
  SUBMITTED
  REVIEWING
  ASSIGNED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  DISPUTED
  ESCALATED
}

enum AssignmentStatus {
  PENDING_ACCEPTANCE
  ACCEPTED
  DECLINED
  ACTIVE
  COMPLETED
  ABANDONED
  TERMINATED
}

enum IncidentSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum IncidentStatus {
  OPEN
  UNDER_INVESTIGATION
  PENDING_RESOLUTION
  RESOLVED
  DISMISSED
  ESCALATED
}

enum ProcurementStatus {
  DRAFT
  SUBMITTED
  UNDER_REVIEW
  APPROVED
  REJECTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum WorkerType {
  CONTRACTOR
  FREELANCER
  EMPLOYEE
  VOLUNTEER
  INTERN
}

enum DocumentType {
  NATIONAL_ID
  PASSPORT
  DRIVERS_LICENSE
  PROFESSIONAL_CERTIFICATE
  TRADE_LICENSE
  UTILITY_BILL
  REFERENCE_LETTER
}

// ═══════════════════════════════════════════════════════
// INSTITUTION (TENANT)
// ═══════════════════════════════════════════════════════

model Institution {
  id                String           @id @default(cuid())
  name              String
  slug              String           @unique
  type              InstitutionType
  email             String           @unique
  phone             String?
  address           String?
  city              String?
  state             String?
  country           String           @default("NG")
  logoUrl           String?
  websiteUrl        String?
  isActive          Boolean          @default(true)
  isVerified        Boolean          @default(false)
  schemaName        String           @unique  // tenant DB schema
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  config            InstitutionConfig?
  userAccounts      UserAccount[]
  workerProfiles    WorkerProfile[]
  vendorProfiles    VendorProfile[]
  volunteerProfiles VolunteerProfile[]
  serviceRequests   ServiceRequest[]
  assignments       WorkforceAssignment[]
  trustEvents       TrustEvent[]
  incidents         IncidentReport[]
  endorsements      Endorsement[]
  procurements      ProcurementRequest[]
  performanceReviews PerformanceReview[]

  @@map("institutions")
}

// ═══════════════════════════════════════════════════════
// INSTITUTION CONFIG
// ═══════════════════════════════════════════════════════

model InstitutionConfig {
  id                      String      @id @default(cuid())
  institutionId           String      @unique
  
  // Trust Score Configuration (JSON)
  trustScoreWeights       Json        @default("{}")
  trustScoreTimeDecayDays Int         @default(365)
  minimumTrustScore       Int         @default(50)
  
  // Verification Requirements
  requireIdentityVerification   Boolean @default(true)
  requireFaceMatch              Boolean @default(false)
  allowedIdentityProviders      String[] @default(["NIN"])
  
  // Endorsement Config
  endorsementsRequiredForActivation  Int @default(0)
  endorsementsRequiredForHighTrust   Int @default(3)
  
  // Service Categories (JSON array)
  serviceCategories       Json        @default("[]")
  workforceCategories     Json        @default("[]")
  
  // SLA Config (JSON)
  slaRules                Json        @default("{}")
  escalationRules         Json        @default("{}")
  
  // Geographic Config
  serviceZones            Json        @default("[]")
  
  // Notification Config
  notificationChannels    Json        @default("{}")
  
  // Branding
  primaryColor            String?
  customDomain            String?
  
  updatedAt               DateTime    @updatedAt
  
  institution             Institution @relation(fields: [institutionId], references: [id])

  @@map("institution_configs")
}

// ═══════════════════════════════════════════════════════
// USER ACCOUNT
// ═══════════════════════════════════════════════════════

model UserAccount {
  id              String    @id @default(cuid())
  institutionId   String
  email           String?
  phone           String
  phoneVerified   Boolean   @default(false)
  emailVerified   Boolean   @default(false)
  passwordHash    String?
  role            UserRole
  firstName       String
  lastName        String
  profilePhotoUrl String?
  isActive        Boolean   @default(true)
  lastLoginAt     DateTime?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  institution     Institution   @relation(fields: [institutionId], references: [id])
  workerProfile   WorkerProfile?
  vendorRepProfile VendorProfile? @relation("VendorRep")
  
  refreshTokens   RefreshToken[]
  auditLogs       AuditLog[]

  @@unique([institutionId, phone])
  @@unique([institutionId, email])
  @@map("user_accounts")
}

model RefreshToken {
  id          String   @id @default(cuid())
  userId      String
  token       String   @unique
  expiresAt   DateTime
  revokedAt   DateTime?
  createdAt   DateTime @default(now())
  
  user        UserAccount @relation(fields: [userId], references: [id])

  @@map("refresh_tokens")
}

// ═══════════════════════════════════════════════════════
// WORKER PROFILE
// ═══════════════════════════════════════════════════════

model WorkerProfile {
  id                  String         @id @default(cuid())
  institutionId       String
  userId              String         @unique
  workerType          WorkerType     @default(CONTRACTOR)
  
  // Skills and categories
  primarySkill        String
  skills              String[]
  categoryIds         String[]       // references institution config categories
  
  // Work configuration
  isAvailable         Boolean        @default(true)
  availabilityNotes   String?
  serviceZoneIds      String[]
  hourlyRate          Float?
  dailyRate           Float?
  currency            String         @default("NGN")
  
  // Trust and verification
  verificationStatus  VerificationStatus @default(UNVERIFIED)
  trustScore          Float          @default(0)
  trustScoreUpdatedAt DateTime?
  
  // Stats (denormalized for performance)
  totalDeployments    Int            @default(0)
  completedDeployments Int           @default(0)
  averageRating       Float?
  totalEndorsements   Int            @default(0)
  
  // Profile
  bio                 String?
  yearsExperience     Int?
  
  isActive            Boolean        @default(true)
  joinedAt            DateTime       @default(now())
  lastActiveAt        DateTime?
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  institution         Institution    @relation(fields: [institutionId], references: [id])
  user                UserAccount    @relation(fields: [userId], references: [id])
  
  identityVerification IdentityVerification?
  credentials         CredentialRecord[]
  documents           DocumentRecord[]
  trustEvents         TrustEvent[]
  endorsementsReceived Endorsement[]  @relation("EndorsedWorker")
  assignmentWorkers   AssignmentWorker[]
  performanceReviews  PerformanceReview[] @relation("ReviewedWorker")
  incidents           IncidentReport[]    @relation("WorkerIncident")

  @@index([institutionId, isActive])
  @@index([institutionId, trustScore])
  @@index([institutionId, primarySkill])
  @@map("worker_profiles")
}

// ═══════════════════════════════════════════════════════
// VENDOR PROFILE
// ═══════════════════════════════════════════════════════

model VendorProfile {
  id                  String         @id @default(cuid())
  institutionId       String
  repUserId           String?
  
  companyName         String
  rcNumber            String?        // Corporate registration
  taxId               String?
  email               String?
  phone               String
  address             String?
  
  serviceCategories   String[]
  
  verificationStatus  VerificationStatus @default(UNVERIFIED)
  trustScore          Float          @default(0)
  
  totalContracts      Int            @default(0)
  completedContracts  Int            @default(0)
  averageRating       Float?
  
  isPreferred         Boolean        @default(false)
  isBlacklisted       Boolean        @default(false)
  blacklistReason     String?
  
  isActive            Boolean        @default(true)
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  institution         Institution    @relation(fields: [institutionId], references: [id])
  repUser             UserAccount?   @relation("VendorRep", fields: [repUserId], references: [id])
  
  procurements        ProcurementRequest[]
  incidents           IncidentReport[]    @relation("VendorIncident")
  performanceReviews  PerformanceReview[] @relation("ReviewedVendor")
  trustEvents         TrustEvent[]        @relation("VendorTrustEvent")

  @@index([institutionId, isActive])
  @@map("vendor_profiles")
}

// ═══════════════════════════════════════════════════════
// VOLUNTEER PROFILE
// ═══════════════════════════════════════════════════════

model VolunteerProfile {
  id                  String         @id @default(cuid())
  institutionId       String
  
  firstName           String
  lastName            String
  phone               String
  email               String?
  
  skills              String[]
  trainingRecords     Json           @default("[]")
  
  verificationStatus  VerificationStatus @default(UNVERIFIED)
  
  totalDeployments    Int            @default(0)
  isAvailable         Boolean        @default(true)
  
  isActive            Boolean        @default(true)
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  institution         Institution    @relation(fields: [institutionId], references: [id])

  @@map("volunteer_profiles")
}

// ═══════════════════════════════════════════════════════
// IDENTITY VERIFICATION
// ═══════════════════════════════════════════════════════

model IdentityVerification {
  id                  String              @id @default(cuid())
  workerId            String              @unique
  
  providerName        String              // "NIN", "BVN", "GhanaCard"
  countryCode         String              @default("NG")
  idNumber            String              // encrypted
  idNumberHash        String              // for dedup checks
  
  status              VerificationStatus  @default(PENDING)
  verifiedAt          DateTime?
  failureReason       String?
  
  // Biographic data from provider (JSON, encrypted)
  biographicData      String?
  
  faceMatchScore      Float?
  faceMatchPassed     Boolean?
  
  expiresAt           DateTime?
  
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt

  worker              WorkerProfile       @relation(fields: [workerId], references: [id])

  @@map("identity_verifications")
}

model CredentialRecord {
  id                  String         @id @default(cuid())
  workerId            String
  
  credentialType      String         // "TRADE_LICENSE", "PROFESSIONAL_CERT"
  issuingBody         String
  credentialNumber    String?
  issuedAt            DateTime?
  expiresAt           DateTime?
  
  isVerified          Boolean        @default(false)
  verifiedAt          DateTime?
  documentUrl         String?
  
  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  worker              WorkerProfile  @relation(fields: [workerId], references: [id])

  @@map("credential_records")
}

model DocumentRecord {
  id                  String         @id @default(cuid())
  workerId            String
  
  documentType        DocumentType
  fileName            String
  storageKey          String         // S3 key
  mimeType            String
  fileSizeBytes       Int
  
  isVerified          Boolean        @default(false)
  
  uploadedAt          DateTime       @default(now())
  
  worker              WorkerProfile  @relation(fields: [workerId], references: [id])

  @@map("document_records")
}

// ═══════════════════════════════════════════════════════
// TRUST ENGINE
// ═══════════════════════════════════════════════════════

model TrustEvent {
  id              String         @id @default(cuid())
  institutionId   String
  
  workerId        String?
  vendorId        String?
  
  eventType       TrustEventType
  delta           Float          // score change applied
  weightApplied   Float          // weight from config at time of event
  referenceType   String?        // "assignment", "incident", "endorsement"
  referenceId     String?
  
  metadata        Json           @default("{}")
  
  createdAt       DateTime       @default(now())
  createdBy       String?        // userId of actor (null = system)

  institution     Institution    @relation(fields: [institutionId], references: [id])
  worker          WorkerProfile? @relation(fields: [workerId], references: [id])
  vendor          VendorProfile? @relation("VendorTrustEvent", fields: [vendorId], references: [id])

  @@index([workerId, institutionId])
  @@index([vendorId, institutionId])
  @@index([institutionId, createdAt])
  @@map("trust_events")
}

model Endorsement {
  id              String         @id @default(cuid())
  institutionId   String
  workerId        String
  endorsedById    String?        // userId (null = institution-level)
  
  endorserName    String
  endorserRole    String?
  comment         String?
  
  weight          Float          @default(1.0)  // configurable
  isActive        Boolean        @default(true)
  
  createdAt       DateTime       @default(now())
  revokedAt       DateTime?
  revokedReason   String?

  institution     Institution    @relation(fields: [institutionId], references: [id])
  worker          WorkerProfile  @relation("EndorsedWorker", fields: [workerId], references: [id])

  @@map("endorsements")
}

// ═══════════════════════════════════════════════════════
// SERVICE REQUESTS
// ═══════════════════════════════════════════════════════

model ServiceRequest {
  id                  String               @id @default(cuid())
  institutionId       String
  requesterId         String               // userId
  
  title               String
  description         String
  categoryId          String
  
  requiredSkills      String[]
  workersNeeded       Int                  @default(1)
  minimumTrustScore   Float?
  
  scheduledStartAt    DateTime?
  scheduledEndAt      DateTime?
  estimatedHours      Float?
  
  locationAddress     String?
  locationZoneId      String?
  
  status              ServiceRequestStatus @default(DRAFT)
  priority            String               @default("NORMAL")
  
  slaDeadlineAt       DateTime?
  escalatedAt         DateTime?
  
  notes               String?
  
  createdAt           DateTime             @default(now())
  updatedAt           DateTime             @updatedAt
  completedAt         DateTime?
  cancelledAt         DateTime?

  institution         Institution          @relation(fields: [institutionId], references: [id])
  assignment          WorkforceAssignment?
  performanceReviews  PerformanceReview[]

  @@index([institutionId, status])
  @@index([institutionId, createdAt])
  @@map("service_requests")
}

// ═══════════════════════════════════════════════════════
// WORKFORCE ASSIGNMENT
// ═══════════════════════════════════════════════════════

model WorkforceAssignment {
  id                String           @id @default(cuid())
  institutionId     String
  serviceRequestId  String           @unique
  
  title             String
  assignedById      String           // userId of operator
  
  status            AssignmentStatus @default(PENDING_ACCEPTANCE)
  
  startedAt         DateTime?
  completedAt       DateTime?
  
  supervisorNotes   String?
  completionNotes   String?
  
  createdAt         DateTime         @default(now())
  updatedAt         DateTime         @updatedAt

  institution       Institution      @relation(fields: [institutionId], references: [id])
  serviceRequest    ServiceRequest   @relation(fields: [serviceRequestId], references: [id])
  assignmentWorkers AssignmentWorker[]

  @@map("workforce_assignments")
}

model AssignmentWorker {
  id              String           @id @default(cuid())
  assignmentId    String
  workerId        String
  
  role            String           @default("WORKER")  // LEAD, WORKER, SUPERVISOR
  status          AssignmentStatus @default(PENDING_ACCEPTANCE)
  
  acceptedAt      DateTime?
  declinedAt      DateTime?
  declineReason   String?
  startedAt       DateTime?
  completedAt     DateTime?
  
  checkInAt       DateTime?
  checkOutAt      DateTime?
  
  createdAt       DateTime         @default(now())

  assignment      WorkforceAssignment @relation(fields: [assignmentId], references: [id])
  worker          WorkerProfile       @relation(fields: [workerId], references: [id])

  @@unique([assignmentId, workerId])
  @@map("assignment_workers")
}

// ═══════════════════════════════════════════════════════
// PROCUREMENT
// ═══════════════════════════════════════════════════════

model ProcurementRequest {
  id                String            @id @default(cuid())
  institutionId     String
  requestedById     String
  
  title             String
  description       String
  categoryId        String
  
  estimatedBudget   Float?
  currency          String            @default("NGN")
  
  vendorId          String?           // selected vendor
  
  status            ProcurementStatus @default(DRAFT)
  
  requiredByDate    DateTime?
  approvedAt        DateTime?
  approvedById      String?
  
  rejectedAt        DateTime?
  rejectedById      String?
  rejectionReason   String?
  
  completedAt       DateTime?
  
  lineItems         ProcurementLineItem[]
  approvals         ProcurementApproval[]

  institution       Institution       @relation(fields: [institutionId], references: [id])
  vendor            VendorProfile?    @relation(fields: [vendorId], references: [id])

  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt

  @@map("procurement_requests")
}

model ProcurementLineItem {
  id              String             @id @default(cuid())
  procurementId   String
  description     String
  quantity        Float
  unitPrice       Float?
  totalPrice      Float?
  
  procurement     ProcurementRequest @relation(fields: [procurementId], references: [id])

  @@map("procurement_line_items")
}

model ProcurementApproval {
  id              String             @id @default(cuid())
  procurementId   String
  approvedById    String
  
  decision        String             // "APPROVED" | "REJECTED"
  comment         String?
  decidedAt       DateTime           @default(now())
  
  procurement     ProcurementRequest @relation(fields: [procurementId], references: [id])

  @@map("procurement_approvals")
}

// ═══════════════════════════════════════════════════════
// PERFORMANCE & INCIDENTS
// ═══════════════════════════════════════════════════════

model PerformanceReview {
  id              String   @id @default(cuid())
  institutionId   String
  serviceRequestId String?
  
  workerId        String?
  vendorId        String?
  
  reviewedById    String
  
  overallRating   Float    // 1.0 – 5.0
  qualityRating   Float?
  punctualityRating Float?
  communicationRating Float?
  
  comment         String?
  
  isPublic        Boolean  @default(true)
  
  createdAt       DateTime @default(now())

  institution     Institution    @relation(fields: [institutionId], references: [id])
  serviceRequest  ServiceRequest? @relation(fields: [serviceRequestId], references: [id])
  worker          WorkerProfile?  @relation("ReviewedWorker", fields: [workerId], references: [id])
  vendor          VendorProfile?  @relation("ReviewedVendor", fields: [vendorId], references: [id])

  @@map("performance_reviews")
}

model IncidentReport {
  id              String           @id @default(cuid())
  institutionId   String
  
  workerId        String?
  vendorId        String?
  
  reportedById    String
  
  title           String
  description     String
  severity        IncidentSeverity @default(MEDIUM)
  status          IncidentStatus   @default(OPEN)
  
  incidentDate    DateTime
  locationAddress String?
  
  assignedToId    String?          // investigator userId
  
  resolvedAt      DateTime?
  resolution      IncidentResolution?
  notes           IncidentNote[]
  
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt

  institution     Institution    @relation(fields: [institutionId], references: [id])
  worker          WorkerProfile? @relation("WorkerIncident", fields: [workerId], references: [id])
  vendor          VendorProfile? @relation("VendorIncident", fields: [vendorId], references: [id])

  @@map("incident_reports")
}

model IncidentNote {
  id          String         @id @default(cuid())
  incidentId  String
  authorId    String
  content     String
  isInternal  Boolean        @default(false)
  createdAt   DateTime       @default(now())
  
  incident    IncidentReport @relation(fields: [incidentId], references: [id])

  @@map("incident_notes")
}

model IncidentResolution {
  id              String         @id @default(cuid())
  incidentId      String         @unique
  resolvedById    String
  
  outcome         String         // "WORKER_EXONERATED", "WORKER_PENALIZED", "VENDOR_PENALIZED"
  summary         String
  trustScoreImpact Float?
  
  resolvedAt      DateTime       @default(now())
  
  incident        IncidentReport @relation(fields: [incidentId], references: [id])

  @@map("incident_resolutions")
}

// ═══════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════

model AuditLog {
  id              String   @id @default(cuid())
  institutionId   String?
  userId          String?
  
  action          String   // "WORKER_CREATED", "TRUST_SCORE_UPDATED", etc.
  entityType      String
  entityId        String
  
  previousState   Json?
  newState        Json?
  
  ipAddress       String?
  userAgent       String?
  
  createdAt       DateTime @default(now())

  user            UserAccount? @relation(fields: [userId], references: [id])

  @@index([institutionId, createdAt])
  @@index([entityType, entityId])
  @@map("audit_logs")
}
```

---

## Key Index Strategy

| Table | Index | Purpose |
|-------|-------|---------|
| worker_profiles | (institutionId, trustScore DESC) | Trust-ranked searches |
| worker_profiles | (institutionId, primarySkill) | Skill-based filtering |
| worker_profiles | (institutionId, isActive) | Active registry queries |
| trust_events | (workerId, institutionId) | Score computation |
| trust_events | (institutionId, createdAt DESC) | Activity feeds |
| service_requests | (institutionId, status) | Pipeline views |
| incident_reports | (institutionId, status) | Open incidents dashboard |
| audit_logs | (institutionId, createdAt DESC) | Audit trail queries |

---

## Data Encryption

| Field | Encryption Method |
|-------|-----------------|
| idNumber (identity verification) | AES-256-GCM field-level encryption |
| biographicData | AES-256-GCM field-level encryption |
| passwordHash | bcrypt (cost factor 12) |
| Document S3 keys | Access via signed URLs only (TTL: 15 min) |
