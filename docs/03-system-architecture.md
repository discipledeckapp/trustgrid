# TrustGrid — System Architecture

**Version:** 1.0  
**Status:** Design  

---

## Architecture Philosophy

TrustGrid is built on five architectural principles:

1. **Multi-tenant first** — one platform serves many institutions, each isolated
2. **Configuration-driven** — no hardcoded business rules; everything configurable per institution
3. **Adapter-based identity** — pluggable identity verification for any country
4. **Audit-everything** — every state change is logged for institutional accountability
5. **Event-sourced trust** — trust scores are derived from immutable event history

---

## High-Level Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                                  │
│                                                                      │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐     │
│  │  Flutter Mobile  │  │   Flutter Web   │  │  WhatsApp Bot   │     │
│  │  (Android/iOS)  │  │   (PWA/Admin)   │  │  (Low-literacy) │     │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘     │
└───────────┼─────────────────────┼─────────────────────┼────────────┘
            │                     │                     │
            └─────────────────────▼─────────────────────┘
                                  │ HTTPS / WSS
┌─────────────────────────────────▼────────────────────────────────────┐
│                         API GATEWAY LAYER                            │
│                                                                      │
│   ┌──────────────────────────────────────────────────────────────┐  │
│   │                  NestJS API Gateway                          │  │
│   │  • JWT Authentication    • Rate Limiting                     │  │
│   │  • Tenant Resolution     • Request Logging                   │  │
│   │  • Role-based Guards     • API Versioning (v1)               │  │
│   └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────────┐
│                        DOMAIN MODULES                                │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │    Auth &    │  │  Identity &  │  │  Workforce   │              │
│  │   Sessions   │  │ Verification │  │   Registry   │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Vendor     │  │  Volunteer   │  │ Endorsements │              │
│  │   Registry   │  │   Registry   │  │   Module     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Trust Score  │  │   Service    │  │  Workforce   │              │
│  │   Engine     │  │  Requests    │  │ Assignments  │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │ Procurement  │  │  Incidents   │  │ Performance  │              │
│  │  Governance  │  │  & Disputes  │  │  Tracking    │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  Emergency   │  │  Analytics   │  │Configuration │              │
│  │ Mobilization │  │  Dashboard   │  │   Engine     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└─────────────────────────────────┬────────────────────────────────────┘
                                  │
┌─────────────────────────────────▼────────────────────────────────────┐
│                      DATA & INTEGRATION LAYER                        │
│                                                                      │
│  ┌──────────────────────┐  ┌─────────────────────────────────────┐  │
│  │   PostgreSQL         │  │     External Integrations           │  │
│  │   (Primary Store)    │  │                                     │  │
│  │   • Multi-tenant     │  │  ┌─────────┐  ┌─────────────────┐  │  │
│  │   • Prisma ORM       │  │  │NIN/BVN  │  │ Firebase (Push) │  │  │
│  │   • Audit tables     │  │  │ API     │  └─────────────────┘  │  │
│  └──────────────────────┘  │  └─────────┘                       │  │
│                             │  ┌─────────┐  ┌─────────────────┐  │  │
│  ┌──────────────────────┐  │  │WhatsApp │  │  S3 Storage     │  │  │
│  │   Redis              │  │  │Business │  │  (Documents,    │  │  │
│  │   (Cache + Sessions) │  │  │  API    │  │   Photos)       │  │  │
│  └──────────────────────┘  │  └─────────┘  └─────────────────┘  │  │
│                             └─────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Multi-Tenancy Model

TrustGrid uses **schema-per-tenant** isolation for security-sensitive data, with a shared schema for platform-level data.

```
Platform Schema (public)
├── institutions          ← all tenant registrations
├── institution_configs   ← per-tenant configuration
├── identity_providers    ← available ID adapters
└── platform_audit_log    ← cross-tenant events

Tenant Schema (tenant_{institution_id})
├── workers              ← workforce registry
├── vendors              ← vendor registry  
├── volunteers           ← volunteer registry
├── trust_events         ← immutable trust event log
├── service_requests     ← all service requests
├── assignments          ← workforce assignments
├── incidents            ← incident reports
├── performance_records  ← performance ratings
└── endorsements         ← peer endorsements
```

**Tenant resolution:** Every API request carries the `X-Institution-ID` header or resolves the tenant from the JWT claims. Middleware resolves the database schema before any domain handler executes.

---

## Domain Module Architecture

Each domain module follows NestJS Clean Architecture:

```
module/
├── dto/                 ← input/output data transfer objects
│   ├── create-*.dto.ts
│   ├── update-*.dto.ts
│   └── response-*.dto.ts
├── entities/            ← Prisma-mapped domain entities
├── *.module.ts          ← NestJS module declaration
├── *.controller.ts      ← HTTP endpoint handlers
├── *.service.ts         ← Business logic
├── *.repository.ts      ← Database access (Prisma wrapper)
└── *.spec.ts            ← Unit tests
```

---

## Identity & Verification Architecture

The identity subsystem uses an **Adapter Pattern** to support multiple national identity schemes.

```typescript
interface IdentityProviderAdapter {
  countryCode: string;
  providerName: string;
  verify(request: VerificationRequest): Promise<VerificationResult>;
  extractBiographicData(result: VerificationResult): BiographicData;
  getSupportedDocumentTypes(): DocumentType[];
}

// Implementations
NigeriaIdentityAdapter      implements IdentityProviderAdapter  // NIN + BVN
GhanaIdentityAdapter        implements IdentityProviderAdapter  // Ghana Card
KenyaIdentityAdapter        implements IdentityProviderAdapter  // Huduma
RwandaIdentityAdapter       implements IdentityProviderAdapter  // NIDA
SouthAfricaIdentityAdapter  implements IdentityProviderAdapter  // DHA
ManualVerificationAdapter   implements IdentityProviderAdapter  // Fallback
```

The `IdentityVerificationService` selects the correct adapter based on the institution's country configuration, not by hardcoded logic.

---

## Trust Score Engine Architecture

Trust scores are **derived, not stored** — they are computed from an immutable log of trust events.

```
TrustEvent (immutable)
├── event_type: DEPLOYMENT_COMPLETED | RATING_SUBMITTED | INCIDENT_RAISED |
│              INCIDENT_RESOLVED | ENDORSEMENT_ADDED | CREDENTIAL_VERIFIED |
│              INACTIVITY_PENALTY | ACCOUNT_CREATED
├── weight_applied: float       ← from institution config at time of event
├── delta: float                ← score change
├── reference_id: string        ← links to source record
└── created_at: timestamp

TrustScoreEngine.compute(workerId, institutionId):
  → load all trust events for worker in institution
  → apply configurable weights per event type
  → apply time-decay function (recent events weighted higher)
  → clamp to 0–100
  → return score + breakdown
```

**Configuration (per institution):**
```json
{
  "trust_score_weights": {
    "deployment_completed": 2.0,
    "5_star_rating": 3.0,
    "4_star_rating": 1.5,
    "3_star_rating": 0.5,
    "2_star_rating": -1.0,
    "1_star_rating": -2.5,
    "incident_raised": -5.0,
    "incident_resolved_favorably": 2.0,
    "endorsement": 1.5,
    "credential_verified": 5.0,
    "inactivity_90_days": -1.0
  },
  "time_decay_half_life_days": 365
}
```

---

## Service Request Lifecycle

```
DRAFT → SUBMITTED → ASSIGNED → IN_PROGRESS → COMPLETED → RATED

                              ↓ (exception paths)
                        CANCELLED / DISPUTED / ESCALATED
```

State transitions are governed by the institution's SLA configuration. Automatic escalation fires when SLA thresholds are breached.

---

## Notification Architecture

```
NotificationService
├── push_notification(userId, payload)    → Firebase FCM
├── sms_notification(phone, message)      → Termii / Twilio
├── whatsapp_notification(phone, message) → WhatsApp Business API
└── in_app_notification(userId, payload)  → WebSocket (Socket.io)
```

Notification channel selection is configurable per institution and per event type.

---

## Security Architecture

| Layer | Mechanism |
|-------|-----------|
| Authentication | JWT (access token 15min, refresh token 7d) |
| Authorization | Role-based (PLATFORM_ADMIN, INSTITUTION_ADMIN, INSTITUTION_OPERATOR, WORKER, RESIDENT) |
| Tenant isolation | Schema-level database isolation |
| API security | Rate limiting (per IP + per user), CORS, Helmet.js |
| Data in transit | TLS 1.3 |
| Data at rest | AES-256 for PII fields |
| Audit | Immutable audit log for all state-changing operations |
| Document storage | Signed URLs with TTL for identity documents |

---

## Deployment Architecture

```
┌─────────────────────────────────┐
│         Load Balancer           │
│        (Nginx / AWS ALB)        │
└────────────┬────────────────────┘
             │
┌────────────▼────────────────────┐
│   NestJS API (Docker containers)│
│   Horizontal scaling via        │
│   container orchestration       │
└────────────┬────────────────────┘
             │
      ┌──────┴──────┐
      │             │
┌─────▼─────┐ ┌─────▼──────┐
│ PostgreSQL │ │   Redis    │
│  Primary  │ │  Cluster   │
│ + Replica │ │            │
└───────────┘ └────────────┘
```

**MVP deployment:** Single Docker Compose stack for hackathon demo.  
**Production:** Kubernetes on cloud (AWS EKS / GCP GKE).

---

## Data Flow: Worker Onboarding

```
1. Worker submits registration (name, phone, skills, ID document)
         ↓
2. IdentityVerificationService selects adapter (based on country)
         ↓
3. Adapter calls national identity API (NIN/BVN)
         ↓
4. Biographic data extracted + face match performed
         ↓
5. VerificationRecord created (status: VERIFIED / PENDING / FAILED)
         ↓
6. WorkerProfile created in institution's workforce registry
         ↓
7. Initial TrustEvent emitted: ACCOUNT_CREATED + CREDENTIAL_VERIFIED
         ↓
8. Trust score computed: base score = f(verification level)
         ↓
9. Worker visible in institution's searchable registry
```

---

## Scalability Considerations

| Concern | Solution |
|---------|---------|
| Large event staffing (1000+ workers) | Batch assignment API, queue-based processing |
| Real-time trust score updates | Event-driven via message queue (BullMQ) |
| Multi-institution analytics | Materialized views, async aggregation |
| Document storage at scale | CDN-backed S3 with signed URLs |
| WhatsApp volume | Rate-limited queue, exponential backoff |

---

## Technology Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Backend framework | NestJS | Structured, modular, TypeScript-native; ideal for domain-heavy applications |
| ORM | Prisma | Type-safe, schema-first, excellent migration tooling |
| Database | PostgreSQL | ACID compliance for financial and trust-critical data |
| Frontend | Flutter | Single codebase for Android, iOS, and Web; strong offline support |
| Cache | Redis | Session management, rate limiting, real-time features |
| Auth | JWT + refresh tokens | Stateless, scalable, revocable via refresh token blacklist |
