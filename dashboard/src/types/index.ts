export interface Worker {
  id: string
  firstName: string
  lastName: string
  profilePhotoUrl?: string
  primarySkill: string
  skills: string[]
  trustScore: number
  trustGrade: string
  trustGradeColor: string
  verificationStatus: 'UNVERIFIED' | 'PENDING' | 'PARTIALLY_VERIFIED' | 'FULLY_VERIFIED'
  totalDeployments: number
  averageRating?: number
  endorsementCount: number
  isAvailable: boolean
  hourlyRate?: number
  dailyRate?: number
}

export interface WorkerProfile extends Worker {
  phone: string
  email?: string
  bio?: string
  yearsExperience?: number
  workerType: string
  identityVerified: boolean
  completedDeployments: number
  completionRate?: number
  totalEndorsements: number
  endorsements: Endorsement[]
  recentReviews: PerformanceReview[]
  incidentHistory: { total: number; open: number; resolved: number }
  trustGradeLabel: string
  joinedAt: string
}

export interface Endorsement {
  id: string
  endorserName: string
  endorserRole?: string
  comment?: string
  weight: number
  createdAt: string
}

export interface PerformanceReview {
  id: string
  overallRating: number
  comment?: string
  createdAt: string
}

export interface ServiceRequest {
  id: string
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
  createdAt: string
}

export type ServiceRequestStatus =
  | 'DRAFT' | 'SUBMITTED' | 'REVIEWING'
  | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED'
  | 'CANCELLED' | 'DISPUTED' | 'ESCALATED'

export interface Incident {
  id: string
  title: string
  description: string
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  status: 'OPEN' | 'UNDER_INVESTIGATION' | 'RESOLVED' | 'DISMISSED'
  incidentDate: string
  worker?: { user: { firstName: string; lastName: string } }
}

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
  topWorkers: Worker[]
  recentActivity: ActivityEvent[]
}

export interface ActivityEvent {
  id: string
  eventType: string
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
