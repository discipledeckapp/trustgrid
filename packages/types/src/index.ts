// ─── Enums ────────────────────────────────────────────────────────────────────

export type InstitutionType =
  | 'ESTATE' | 'CHURCH' | 'SCHOOL' | 'UNIVERSITY'
  | 'CONVENTION_ORGANIZER' | 'FACILITY_MANAGER'
  | 'SMART_CITY_OPERATOR' | 'LOCAL_GOVERNMENT'
  | 'CORPORATE' | 'NGO'

export type UserRole =
  | 'PLATFORM_ADMIN' | 'INSTITUTION_ADMIN' | 'INSTITUTION_OPERATOR'
  | 'INSTITUTION_VIEWER' | 'WORKER' | 'VENDOR_REPRESENTATIVE' | 'RESIDENT'

export type VerificationStatus =
  | 'UNVERIFIED' | 'PENDING' | 'PARTIALLY_VERIFIED'
  | 'FULLY_VERIFIED' | 'VERIFICATION_FAILED' | 'SUSPENDED'

export type ServiceRequestStatus =
  | 'DRAFT' | 'SUBMITTED' | 'REVIEWING' | 'ASSIGNED'
  | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'DISPUTED' | 'ESCALATED'

export type AssignmentStatus =
  | 'PENDING_ACCEPTANCE' | 'ACCEPTED' | 'DECLINED'
  | 'ACTIVE' | 'COMPLETED' | 'ABANDONED' | 'TERMINATED'

export type IncidentSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type IncidentStatus =
  | 'OPEN' | 'UNDER_INVESTIGATION' | 'PENDING_RESOLUTION'
  | 'RESOLVED' | 'DISMISSED' | 'ESCALATED'

export type WorkerType = 'CONTRACTOR' | 'FREELANCER' | 'EMPLOYEE' | 'VOLUNTEER' | 'INTERN'

export type TrustEventType =
  | 'ACCOUNT_CREATED' | 'IDENTITY_VERIFIED' | 'CREDENTIAL_VERIFIED'
  | 'DEPLOYMENT_COMPLETED' | 'DEPLOYMENT_ABANDONED'
  | 'RATING_SUBMITTED' | 'ENDORSEMENT_ADDED' | 'ENDORSEMENT_REMOVED'
  | 'INCIDENT_RAISED' | 'INCIDENT_RESOLVED' | 'INCIDENT_DISMISSED'
  | 'INACTIVITY_PENALTY' | 'MANUAL_ADJUSTMENT' | 'SUSPENSION' | 'REINSTATEMENT'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

export interface LoginResponse {
  user: {
    id: string
    firstName: string
    lastName: string
    role: UserRole
    institutionId: string
  }
  tokens: AuthTokens
}

// ─── Worker ───────────────────────────────────────────────────────────────────

export interface WorkerSummary {
  id: string
  firstName: string
  lastName: string
  profilePhotoUrl?: string
  primarySkill: string
  skills: string[]
  trustScore: number
  trustGrade: string
  trustGradeColor: string
  verificationStatus: VerificationStatus
  totalDeployments: number
  averageRating?: number
  endorsementCount: number
  isAvailable: boolean
  hourlyRate?: number
  dailyRate?: number
  currency: string
}

export interface WorkerProfile extends WorkerSummary {
  phone: string
  email?: string
  bio?: string
  yearsExperience?: number
  workerType: WorkerType
  identityVerified: boolean
  completedDeployments: number
  completionRate?: number
  totalEndorsements: number
  trustGradeLabel: string
  endorsements: Endorsement[]
  recentReviews: PerformanceReview[]
  incidentHistory: { total: number; open: number; resolved: number }
  joinedAt: string
  lastActiveAt?: string
}

export interface TrustScoreBreakdown {
  score: number
  grade: string
  gradeLabel: string
  gradeColor: string
  deploymentScore: number
  ratingScore: number
  endorsementScore: number
  verificationScore: number
  incidentPenalty: number
  trend: 'IMPROVING' | 'DECLINING' | 'STABLE'
  lastUpdatedAt: string | null
  recentEvents: Array<{ eventType: TrustEventType; delta: number; createdAt: string }>
}

// ─── Endorsement ──────────────────────────────────────────────────────────────

export interface Endorsement {
  id: string
  workerId: string
  endorserName: string
  endorserRole?: string
  comment?: string
  weight: number
  isActive: boolean
  createdAt: string
  revokedAt?: string
}

// ─── Service Request ──────────────────────────────────────────────────────────

export interface ServiceRequest {
  id: string
  institutionId: string
  requesterId: string
  title: string
  description: string
  categoryId: string
  requiredSkills: string[]
  workersNeeded: number
  minimumTrustScore?: number
  status: ServiceRequestStatus
  priority: string
  locationAddress?: string
  scheduledStartAt?: string
  scheduledEndAt?: string
  estimatedHours?: number
  notes?: string
  slaDeadlineAt?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
}

// ─── Assignment ───────────────────────────────────────────────────────────────

export interface AssignmentWorker {
  id: string
  assignmentId: string
  workerId: string
  role: string
  status: AssignmentStatus
  acceptedAt?: string
  declinedAt?: string
  declineReason?: string
  startedAt?: string
  completedAt?: string
  checkInAt?: string
  checkOutAt?: string
}

// ─── Incident ─────────────────────────────────────────────────────────────────

export interface IncidentReport {
  id: string
  institutionId: string
  workerId?: string
  vendorId?: string
  title: string
  description: string
  severity: IncidentSeverity
  status: IncidentStatus
  incidentDate: string
  locationAddress?: string
  createdAt: string
  worker?: { user: { firstName: string; lastName: string } }
  resolution?: IncidentResolution
}

export interface IncidentResolution {
  id: string
  outcome: 'WORKER_EXONERATED' | 'WORKER_PENALIZED' | 'VENDOR_PENALIZED' | 'INCONCLUSIVE'
  summary: string
  trustScoreImpact?: number
  resolvedAt: string
}

// ─── Performance ──────────────────────────────────────────────────────────────

export interface PerformanceReview {
  id: string
  overallRating: number
  qualityRating?: number
  punctualityRating?: number
  communicationRating?: number
  comment?: string
  isPublic: boolean
  createdAt: string
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface DashboardData {
  workforce: {
    totalWorkers: number
    verifiedWorkers: number
    verifiedPercentage: number
    availableWorkers: number
    averageTrustScore: number
  }
  serviceRequests: {
    totalThisMonth: number
    completedThisMonth: number
    inProgress: number
    completionRate: number
  }
  incidents: {
    openCount: number
    resolvedThisMonth: number
    criticalOpen: number
  }
  topWorkers: WorkerSummary[]
  recentActivity: ActivityEvent[]
}

export interface ActivityEvent {
  id: string
  eventType: TrustEventType
  delta: number
  workerName?: string
  createdAt: string
}

export interface TrustDistribution {
  distribution: { range: string; count: number; percentage: number }[]
  averageScore: number
  medianScore: number
  workforce: number
}

// ─── Pagination ───────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
