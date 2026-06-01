# TrustGrid — API Contracts

**Base URL:** `https://api.trustgrid.io/v1`  
**Auth:** Bearer JWT in `Authorization` header  
**Tenant:** `X-Institution-ID` header on all requests  
**Content-Type:** `application/json`  

---

## Authentication Endpoints

### POST /auth/register
Register a new institution and admin account.

**Request:**
```json
{
  "institution": {
    "name": "Redemption City Estate",
    "type": "ESTATE",
    "email": "admin@redemptioncity.ng",
    "phone": "+2348001234567",
    "country": "NG"
  },
  "admin": {
    "firstName": "Emeka",
    "lastName": "Okafor",
    "phone": "+2348001234567",
    "email": "admin@redemptioncity.ng",
    "password": "SecurePass123!"
  }
}
```

**Response 201:**
```json
{
  "institution": {
    "id": "clx1a2b3c...",
    "name": "Redemption City Estate",
    "slug": "redemption-city-estate"
  },
  "user": {
    "id": "clx1a2b3d...",
    "email": "admin@redemptioncity.ng",
    "role": "INSTITUTION_ADMIN"
  },
  "tokens": {
    "accessToken": "eyJhbGci...",
    "refreshToken": "eyJhbGci...",
    "expiresIn": 900
  }
}
```

---

### POST /auth/login
```json
// Request
{
  "phone": "+2348001234567",
  "password": "SecurePass123!"
}

// Response 200
{
  "user": { "id": "...", "firstName": "Emeka", "role": "INSTITUTION_ADMIN" },
  "tokens": { "accessToken": "...", "refreshToken": "...", "expiresIn": 900 }
}
```

### POST /auth/refresh
```json
// Request
{ "refreshToken": "eyJhbGci..." }

// Response 200
{ "accessToken": "...", "expiresIn": 900 }
```

### POST /auth/logout
Revokes the current refresh token. Requires Bearer auth.

---

## Worker Endpoints

### POST /workers
Onboard a new worker to the institution.

**Roles:** INSTITUTION_ADMIN, INSTITUTION_OPERATOR  
**Request:**
```json
{
  "firstName": "Chukwuemeka",
  "lastName": "Adeyemi",
  "phone": "+2348012345678",
  "primarySkill": "Electrician",
  "skills": ["Electrician", "Panel Wiring", "Generator Maintenance"],
  "categoryIds": ["cat_electrical", "cat_power"],
  "workerType": "CONTRACTOR",
  "yearsExperience": 5,
  "bio": "Certified electrician with COREN registration",
  "hourlyRate": 2500,
  "currency": "NGN"
}
```

**Response 201:**
```json
{
  "id": "clx1worker...",
  "userId": "clx1user...",
  "firstName": "Chukwuemeka",
  "lastName": "Adeyemi",
  "primarySkill": "Electrician",
  "verificationStatus": "UNVERIFIED",
  "trustScore": 0,
  "isActive": true,
  "profileUrl": "/workers/clx1worker..."
}
```

---

### GET /workers
List workers in the institution's registry.

**Query Parameters:**
```
skill=Electrician
categoryId=cat_electrical
verificationStatus=FULLY_VERIFIED
minTrustScore=60
isAvailable=true
zoneId=zone_main
search=chukwu
page=1
limit=20
sortBy=trustScore
sortOrder=desc
```

**Response 200:**
```json
{
  "data": [
    {
      "id": "clx1worker...",
      "firstName": "Chukwuemeka",
      "lastName": "Adeyemi",
      "primarySkill": "Electrician",
      "trustScore": 78.5,
      "verificationStatus": "FULLY_VERIFIED",
      "totalDeployments": 23,
      "averageRating": 4.6,
      "endorsementCount": 5,
      "isAvailable": true,
      "profilePhotoUrl": "https://..."
    }
  ],
  "pagination": {
    "total": 143,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

### GET /workers/:id
Get full worker trust profile.

**Response 200:**
```json
{
  "id": "clx1worker...",
  "firstName": "Chukwuemeka",
  "lastName": "Adeyemi",
  "primarySkill": "Electrician",
  "skills": ["Electrician", "Panel Wiring"],
  "workerType": "CONTRACTOR",
  "trustScore": 78.5,
  "trustScoreBreakdown": {
    "deploymentScore": 32.0,
    "ratingScore": 28.5,
    "endorsementScore": 10.5,
    "verificationScore": 7.5,
    "incidentPenalty": 0.0
  },
  "verificationStatus": "FULLY_VERIFIED",
  "identityVerified": true,
  "totalDeployments": 23,
  "completedDeployments": 21,
  "completionRate": 0.913,
  "averageRating": 4.6,
  "endorsements": [
    {
      "endorserName": "Estate Manager",
      "comment": "Reliable and professional",
      "createdAt": "2026-01-15T09:00:00Z"
    }
  ],
  "recentDeployments": [...],
  "incidentHistory": {
    "total": 1,
    "resolved": 1,
    "open": 0
  },
  "credentials": [...],
  "memberSince": "2025-06-01T00:00:00Z"
}
```

---

### POST /workers/:id/verify-identity
Initiate identity verification for a worker.

**Request:**
```json
{
  "providerName": "NIN",
  "idNumber": "12345678901",
  "selfieImageBase64": "data:image/jpeg;base64,..."
}
```

**Response 202:**
```json
{
  "verificationId": "clxverify...",
  "status": "PENDING",
  "estimatedCompletionSeconds": 30,
  "pollUrl": "/workers/clx1worker.../verification-status"
}
```

---

### GET /workers/:id/trust-score
Get detailed trust score with event breakdown.

**Response 200:**
```json
{
  "workerId": "clx1worker...",
  "score": 78.5,
  "grade": "B+",
  "lastUpdatedAt": "2026-05-30T14:22:00Z",
  "breakdown": {
    "deployments": { "count": 23, "scoreContribution": 32.0 },
    "ratings": { "average": 4.6, "count": 19, "scoreContribution": 28.5 },
    "endorsements": { "count": 5, "scoreContribution": 10.5 },
    "verification": { "level": "FULLY_VERIFIED", "scoreContribution": 7.5 },
    "incidents": { "count": 1, "penaltyApplied": 0.0, "note": "Resolved favorably" }
  },
  "recentEvents": [
    {
      "eventType": "RATING_SUBMITTED",
      "delta": 1.5,
      "createdAt": "2026-05-28T10:00:00Z"
    }
  ],
  "trend": "IMPROVING",
  "percentile": 72
}
```

---

## Service Request Endpoints

### POST /service-requests
Create a new service request.

**Request:**
```json
{
  "title": "Convention Electricians — May 2026",
  "description": "Need 50 verified electricians for 3-day national convention",
  "categoryId": "cat_electrical",
  "requiredSkills": ["Electrician", "Generator Maintenance"],
  "workersNeeded": 50,
  "minimumTrustScore": 65,
  "scheduledStartAt": "2026-05-15T07:00:00Z",
  "scheduledEndAt": "2026-05-18T18:00:00Z",
  "estimatedHours": 8,
  "locationAddress": "Redemption Camp, Km 46, Lagos-Ibadan Expressway",
  "locationZoneId": "zone_redemption_camp",
  "priority": "HIGH"
}
```

**Response 201:**
```json
{
  "id": "clxrequest...",
  "title": "Convention Electricians — May 2026",
  "status": "DRAFT",
  "workersNeeded": 50,
  "matchedWorkers": 67,  // how many workers in registry qualify
  "slaDeadlineAt": "2026-05-14T07:00:00Z"
}
```

---

### GET /service-requests
List service requests with pipeline view.

**Query params:** `status`, `categoryId`, `page`, `limit`

---

### POST /service-requests/:id/submit
Submit a draft request for processing.

### POST /service-requests/:id/assign
Assign workers to the request and create a WorkforceAssignment.

**Request:**
```json
{
  "workerIds": ["clxworker1...", "clxworker2...", "..."],
  "supervisorId": "clxworker_lead..."
}
```

---

## Endorsement Endpoints

### POST /workers/:id/endorsements
Add an endorsement for a worker.

**Request:**
```json
{
  "endorserName": "Adaeze Nwosu",
  "endorserRole": "Estate Manager",
  "comment": "Chukwuemeka has worked with us for 2 years. Highly reliable and professional."
}
```

**Response 201:**
```json
{
  "id": "clxendorse...",
  "workerId": "clxworker...",
  "endorserName": "Adaeze Nwosu",
  "weight": 1.5,
  "trustScoreDelta": 1.5,
  "newTrustScore": 80.0
}
```

---

## Incident Endpoints

### POST /incidents
Report an incident.

**Request:**
```json
{
  "workerId": "clxworker...",
  "title": "Equipment damaged during assignment",
  "description": "Worker accidentally damaged a client's generator panel during installation.",
  "severity": "MEDIUM",
  "incidentDate": "2026-05-20T14:30:00Z",
  "locationAddress": "Block C, Estate Unit 14"
}
```

**Response 201:**
```json
{
  "id": "clxincident...",
  "status": "OPEN",
  "severity": "MEDIUM",
  "assignedToId": null,
  "trustScoreFrozen": false
}
```

---

### PATCH /incidents/:id/resolve
Resolve an incident.

**Request:**
```json
{
  "outcome": "WORKER_PENALIZED",
  "summary": "Investigation confirmed worker negligence. Worker has been counseled and agreed to compensate for damage.",
  "trustScoreImpact": -5.0
}
```

---

## Performance Review Endpoints

### POST /performance-reviews
Submit a performance review after assignment completion.

**Request:**
```json
{
  "serviceRequestId": "clxrequest...",
  "workerId": "clxworker...",
  "overallRating": 4.5,
  "qualityRating": 5.0,
  "punctualityRating": 4.0,
  "communicationRating": 4.5,
  "comment": "Excellent work. Finished ahead of schedule and cleaned up the site."
}
```

---

## Analytics Endpoints

### GET /analytics/dashboard
Institution-level overview dashboard data.

**Response 200:**
```json
{
  "workforce": {
    "totalWorkers": 234,
    "verifiedWorkers": 189,
    "availableWorkers": 142,
    "averageTrustScore": 67.3
  },
  "serviceRequests": {
    "totalThisMonth": 47,
    "completedThisMonth": 43,
    "inProgress": 3,
    "averageCompletionHours": 4.2
  },
  "incidents": {
    "openCount": 2,
    "resolvedThisMonth": 5,
    "criticalOpen": 0
  },
  "topWorkers": [...],
  "recentActivity": [...]
}
```

---

### GET /analytics/trust-distribution
Distribution of trust scores across the institution's workforce.

**Response 200:**
```json
{
  "distribution": [
    { "range": "90-100", "count": 12, "percentage": 5.1 },
    { "range": "80-89", "count": 31, "percentage": 13.2 },
    { "range": "70-79", "count": 54, "percentage": 23.1 },
    { "range": "60-69", "count": 67, "percentage": 28.6 },
    { "range": "50-59", "count": 43, "percentage": 18.4 },
    { "range": "0-49",  "count": 27, "percentage": 11.5 }
  ],
  "averageScore": 67.3,
  "medianScore": 68.0,
  "workforce": 234
}
```

---

## Configuration Endpoints

### GET /config
Get institution configuration.

### PATCH /config
Update institution configuration.

**Request (partial update):**
```json
{
  "trustScoreWeights": {
    "deployment_completed": 2.5,
    "5_star_rating": 4.0,
    "endorsement": 2.0,
    "incident_raised": -6.0
  },
  "minimumTrustScore": 60,
  "serviceCategories": [
    { "id": "cat_electrical", "name": "Electrical", "icon": "bolt" },
    { "id": "cat_plumbing", "name": "Plumbing", "icon": "pipe" },
    { "id": "cat_security", "name": "Security", "icon": "shield" },
    { "id": "cat_cleaning", "name": "Cleaning", "icon": "broom" }
  ]
}
```

---

## Vendor Endpoints

### POST /vendors
Register a vendor in the institution's registry.

### GET /vendors
List vendors with filtering by category, status, trust score.

### GET /vendors/:id
Get full vendor profile with procurement history.

### POST /vendors/:id/blacklist
Blacklist a vendor.

---

## Procurement Endpoints

### POST /procurement
Create a procurement request.

### GET /procurement
List procurement requests by status.

### POST /procurement/:id/approve
Approve a procurement request (requires INSTITUTION_ADMIN role).

### POST /procurement/:id/reject
Reject with reason.

---

## Emergency Mobilization Endpoint

### POST /mobilize
Find and notify available verified workers for an emergency request.

**Request:**
```json
{
  "skill": "Electrician",
  "urgency": "EMERGENCY",
  "description": "Power outage in Block D — need immediate electrician",
  "locationZoneId": "zone_block_d",
  "minimumTrustScore": 60,
  "maxWorkers": 3
}
```

**Response 200:**
```json
{
  "mobilizationId": "clxmobilize...",
  "matchedWorkers": [
    {
      "workerId": "clxworker1...",
      "name": "Chukwuemeka Adeyemi",
      "trustScore": 78.5,
      "estimatedArrivalMinutes": 8,
      "phone": "+234801...",
      "notificationSent": true
    }
  ],
  "totalNotified": 3
}
```

---

## WebSocket Events

**Connection:** `wss://api.trustgrid.io/v1/events`  
**Auth:** Pass JWT in query param `?token=...`

| Event | Payload | Description |
|-------|---------|-------------|
| `assignment.created` | `{ assignmentId, workerId }` | Worker receives new assignment |
| `assignment.started` | `{ assignmentId }` | Assignment marked in-progress |
| `trust_score.updated` | `{ workerId, oldScore, newScore, delta }` | Score changed |
| `incident.raised` | `{ incidentId, workerId, severity }` | Incident reported about worker |
| `mobilization.request` | `{ mobilizationId, description, location }` | Emergency work request |
| `service_request.escalated` | `{ serviceRequestId, reason }` | SLA breach escalation |

---

## Error Responses

All errors follow this shape:

```json
{
  "statusCode": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "details": [
    { "field": "phone", "message": "phone must be a valid Nigerian number" }
  ],
  "requestId": "req_abc123",
  "timestamp": "2026-05-31T10:00:00Z"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Validation error or bad request |
| 401 | Authentication required |
| 403 | Insufficient permissions for this institution/role |
| 404 | Resource not found |
| 409 | Conflict (e.g., phone already registered) |
| 422 | Business rule violation (e.g., trust score too low) |
| 429 | Rate limit exceeded |
| 500 | Internal server error |
