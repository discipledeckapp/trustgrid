# TrustGrid — Configurability Framework

**Version:** 1.0  

---

## Principle: Configuration Over Hardcoding

TrustGrid is deployed to estates, churches, schools, convention organizers, facility managers, and smart-city operators. Each has different:

- Service categories (an estate needs Plumbing; a hospital needs Medical Technicians)
- Trust score priorities (a security firm weights incident history more; a church weights endorsements more)
- Verification requirements (a school requires criminal background checks; a church doesn't)
- Escalation rules (an estate escalates after 4 hours; a hospital escalates in 30 minutes)
- Endorsement thresholds (a premium estate requires 2 endorsements before activation)

**Nothing important should be hardcoded.**

---

## Configuration Layers

```
Platform Defaults  (TrustGrid ships with sensible defaults)
        ↓
Institution Config  (Institution admin overrides per their context)
        ↓
Department Config   (Optional: sub-unit of institution)
        ↓
Request Config      (Per-request overrides for minimum trust score, skills, etc.)
```

---

## Configuration Domains

### 1. Service Category Configuration

**Schema:**
```json
{
  "serviceCategories": [
    {
      "id": "cat_electrical",
      "name": "Electrical",
      "description": "Electricians, wiring, panel maintenance",
      "icon": "bolt",
      "color": "#F59E0B",
      "requiredSkills": ["Electrician"],
      "allowedWorkerTypes": ["CONTRACTOR", "FREELANCER"],
      "defaultMinTrustScore": 60,
      "requiresVerification": true,
      "isActive": true
    },
    {
      "id": "cat_security",
      "name": "Security",
      "description": "Security guards, access control",
      "icon": "shield",
      "color": "#3B82F6",
      "requiredSkills": ["Security Guard"],
      "allowedWorkerTypes": ["CONTRACTOR"],
      "defaultMinTrustScore": 70,
      "requiresVerification": true,
      "requiresBackgroundCheck": true,
      "isActive": true
    }
  ]
}
```

**Platform defaults:** 12 categories (Electrical, Plumbing, Cleaning, Security, Transport, Medical, IT, Catering, Landscaping, Construction, Event, Welfare)

**Institution control:**
- Add custom categories
- Modify trust score minimums per category
- Disable categories not relevant to their context
- Add category-specific required certifications

---

### 2. Trust Score Weight Configuration

**Schema:**
```json
{
  "trustScoreWeights": {
    "identity_verified": 10.0,
    "credential_verified": 5.0,
    "deployment_completed": 2.0,
    "rating_5_star": 3.0,
    "rating_4_star": 1.5,
    "rating_3_star": 0.5,
    "rating_2_star": -1.0,
    "rating_1_star": -2.5,
    "endorsement_added": 1.5,
    "endorsement_institutional": 3.0,
    "incident_raised": -5.0,
    "incident_resolved_exonerated": 3.0,
    "incident_resolved_penalized": -2.0,
    "inactivity_90_days": -0.5,
    "manual_bonus": 1.0,
    "manual_penalty": -2.0,
    "account_created_bonus": 5.0
  },
  "trustScoreTimeDecayHalfLifeDays": 365,
  "trustScoreMin": 0,
  "trustScoreMax": 100,
  "trustScoreGrades": {
    "A+": { "min": 90, "color": "#10B981", "label": "Exceptional" },
    "A":  { "min": 80, "color": "#34D399", "label": "Excellent" },
    "B+": { "min": 70, "color": "#6EE7B7", "label": "Good" },
    "B":  { "min": 60, "color": "#FCD34D", "label": "Satisfactory" },
    "C":  { "min": 50, "color": "#F59E0B", "label": "Fair" },
    "D":  { "min": 35, "color": "#F97316", "label": "Below Average" },
    "F":  { "min": 0,  "color": "#EF4444", "label": "Poor" }
  }
}
```

**Institution control:**
- Full weight customization per event type
- Set minimum activation trust score (workers below cannot be assigned)
- Configure grade thresholds
- Enable/disable time decay

**Example: Security-focused institution (private estate)**
```json
{
  "trustScoreWeights": {
    "incident_raised": -15.0,         // Incidents hurt more
    "identity_verified": 20.0,        // Identity matters more
    "endorsement_institutional": 5.0, // Institutional endorsement valued more
    "rating_5_star": 2.0             // Ratings weighted less
  }
}
```

**Example: Church convention (endorsement-focused)**
```json
{
  "trustScoreWeights": {
    "endorsement_added": 3.0,         // Endorsements matter more
    "endorsement_institutional": 5.0,
    "incident_raised": -3.0,          // Incidents less punishing
    "identity_verified": 5.0          // Identity less critical
  }
}
```

---

### 3. Verification Requirement Configuration

**Schema:**
```json
{
  "verificationRequirements": {
    "requireIdentityVerification": true,
    "allowedIdentityProviders": ["NIN", "BVN"],
    "requireFaceMatch": false,
    "requireDocumentUpload": true,
    "requiredDocumentTypes": ["NATIONAL_ID"],
    "requireCredentialVerification": false,
    "requireBackgroundCheck": false,
    "verificationExpiryDays": 730,
    "reVerificationRequired": false
  }
}
```

**Institution control:**
- Toggle each requirement independently
- Select which identity providers to accept
- Define which document types are mandatory
- Set verification expiry (re-verify after N days)

---

### 4. Endorsement Configuration

**Schema:**
```json
{
  "endorsementConfig": {
    "endorsementsRequiredForActivation": 0,
    "endorsementsRequiredForHighTrust": 3,
    "allowSelfEndorsement": false,
    "allowResidentEndorsements": true,
    "endorsementWeights": {
      "institution_admin": 3.0,
      "institution_operator": 2.0,
      "resident": 1.0,
      "peer_worker": 0.5
    },
    "endorsementExpiryDays": 0,
    "maxActiveEndorsements": 0
  }
}
```

---

### 5. SLA Rules Configuration

**Schema:**
```json
{
  "slaRules": {
    "serviceRequestReviewHours": 24,
    "assignmentAcceptanceHours": 4,
    "assignmentStartHours": 2,
    "emergencyResponseMinutes": 60,
    "escalationChain": [
      { "afterMinutes": 30, "notifyRole": "INSTITUTION_OPERATOR" },
      { "afterMinutes": 120, "notifyRole": "INSTITUTION_ADMIN" }
    ],
    "overdueAction": "ESCALATE",
    "criticalEscalateImmediately": true
  }
}
```

---

### 6. Geographic Service Zone Configuration

**Schema:**
```json
{
  "serviceZones": [
    {
      "id": "zone_main",
      "name": "Main Estate",
      "description": "Primary residential blocks A–F",
      "polygon": [[3.3792, 6.5244], [3.3800, 6.5244], ...],
      "radius": null,
      "center": null
    },
    {
      "id": "zone_annex",
      "name": "Estate Annex",
      "radius": 500,
      "center": { "lat": 6.5244, "lng": 3.3800 }
    }
  ]
}
```

---

### 7. Notification Channel Configuration

**Schema:**
```json
{
  "notificationChannels": {
    "assignment_created": ["push", "whatsapp"],
    "incident_raised": ["push", "email", "whatsapp"],
    "trust_score_updated": ["push"],
    "service_request_escalated": ["push", "email"],
    "emergency_mobilization": ["push", "sms", "whatsapp"]
  },
  "whatsappEnabled": true,
  "smsEnabled": true,
  "emailEnabled": true,
  "pushEnabled": true
}
```

---

## Configuration API

### Get current institution config
```
GET /config
```

### Update config (partial update supported)
```
PATCH /config
Body: { partial config object }
```

### Reset config domain to platform defaults
```
POST /config/reset
Body: { "domain": "trustScoreWeights" }
```

### Validate config before applying
```
POST /config/validate
Body: { config object }
Response: { "valid": true } | { "valid": false, "errors": [...] }
```

---

## Configuration Change Audit

Every configuration change is logged in the AuditLog with:
- Previous value
- New value
- Changed by (userId)
- Timestamp

Configuration changes do NOT retroactively alter trust scores. The trust score engine uses the **weight at the time the event was recorded**, stored in TrustEvent.weightApplied. This means historical scores are preserved even when institution admins change weights.

---

## Default Configuration Bundle (Platform Defaults)

TrustGrid ships with 4 pre-configured bundles that institutions can select and then customize:

| Bundle | Designed For | Key Characteristics |
|--------|-------------|---------------------|
| `community-standard` | Estates, HOAs | Balanced weights, NIN required, 2 endorsements for high trust |
| `events-and-conventions` | Churches, event orgs | Endorsement-weighted, lighter verification, fast SLAs |
| `institutional-strict` | Schools, universities, hospitals | High verification requirements, incident-heavy weighting, procurement governance |
| `facility-management` | Facility managers, commercial | Multi-site, vendor-heavy, compliance reporting focus |

Institutions choose a bundle on registration, then customize from there. This eliminates configuration overwhelm for new institutions.
