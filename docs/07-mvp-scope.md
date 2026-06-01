# TrustGrid — MVP Scope

**Version:** 1.0  
**Timeframe:** Hackathon MVP (72-hour build)  

---

## MVP Principle

Build the minimum system that can demonstrate the full trust and governance loop for the RCCG Convention Demo scenario:

> **An operations team needs 50 verified workers for a 3-day event. TrustGrid finds them, assigns them, tracks performance, records incidents, and updates trust scores — permanently.**

---

## In MVP

### Module 1: Authentication & Institutions

- [x] Institution registration (name, type, country)
- [x] Admin user registration and login
- [x] JWT authentication (access + refresh tokens)
- [x] Role-based access control (INSTITUTION_ADMIN, INSTITUTION_OPERATOR, WORKER)
- [x] Operator user creation by admin

---

### Module 2: Worker Registry

- [x] Worker onboarding (name, phone, skills, category, worker type)
- [x] Worker profile view with trust score display
- [x] Worker list with filters: skill, category, trust score, verification status, availability
- [x] Worker search (by name, skill)
- [x] Worker availability toggle
- [x] Worker profile photo upload

---

### Module 3: Identity Verification (Simulated)

- [x] NIN submission form
- [x] Simulated verification response (MVP: mock adapter, not live NIN API)
- [x] Verification status badge on profile
- [x] Document upload (stored in S3/local)
- [ ] ~~Live NIN/BVN API~~ (post-MVP)
- [ ] ~~Face match~~ (post-MVP)

---

### Module 4: Trust Score Engine

- [x] Initial trust score on worker creation (based on verification level)
- [x] Trust score display on worker profile
- [x] Trust score updated by: ratings, endorsements, incident resolution
- [x] Trust score breakdown (deployment / rating / endorsement / verification / incident)
- [x] Trust grade display (A+, A, B+, B, C, D, F)
- [ ] ~~Time-decay function~~ (post-MVP, use raw sum)
- [ ] ~~Institution-configurable weights~~ (post-MVP, use defaults)

---

### Module 5: Endorsements

- [x] Add endorsement for a worker (name, role, comment)
- [x] View endorsements on worker profile
- [x] Endorsement triggers trust score update
- [x] Endorsement count displayed on profile

---

### Module 6: Service Requests

- [x] Create service request (title, category, workers needed, dates, location)
- [x] Set minimum trust score requirement
- [x] View matched workers (auto-filtered by skill + trust score)
- [x] Submit and review service requests
- [x] Service request status pipeline (DRAFT → SUBMITTED → ASSIGNED → IN_PROGRESS → COMPLETED)

---

### Module 7: Workforce Assignment

- [x] Create assignment from service request
- [x] Add workers to assignment (multi-select from filtered list)
- [x] Worker receives assignment notification (in-app)
- [x] Worker accepts or declines assignment
- [x] Assignment status tracking
- [x] Mark assignment complete

---

### Module 8: Performance Reviews

- [x] Submit post-assignment performance review
- [x] Overall rating (1–5 stars)
- [x] Comment field
- [x] Rating triggers trust score update
- [x] Reviews visible on worker profile

---

### Module 9: Incident Reporting

- [x] Report incident against a worker
- [x] Severity selection (LOW / MEDIUM / HIGH / CRITICAL)
- [x] Incident list view for operators
- [x] Resolve incident with outcome
- [x] Resolution triggers trust score adjustment

---

### Module 10: Institution Dashboard

- [x] Total workers count
- [x] Verified workers count
- [x] Average trust score
- [x] Recent service requests
- [x] Open incidents
- [x] Trust score distribution chart

---

### Module 11: Worker Mobile App (Flutter)

- [x] Worker registration screen
- [x] Worker home screen (profile, trust score)
- [x] Assignments screen (incoming, active, completed)
- [x] Accept / decline assignment
- [x] View my endorsements
- [x] View my performance reviews

---

### Module 12: Admin Web Dashboard (Flutter Web)

- [x] Institution overview dashboard
- [x] Worker registry table (filterable)
- [x] Worker profile detail view
- [x] Service request creation and management
- [x] Assignment management
- [x] Incident management
- [x] Analytics overview

---

## Post-MVP (Phase 2 & 3)

### Phase 2 (60 days post-hackathon)

- Live NIN/BVN integration (Nigeria identity adapter)
- WhatsApp notification integration
- Face match verification
- Configurable trust score weights per institution
- Vendor registry (full module)
- Procurement governance workflow
- Emergency mobilization push notifications
- Multi-zone geographic filtering
- Performance tracking advanced KPIs

### Phase 3 (6 months)

- Ghana Card adapter
- Huduma (Kenya) adapter
- Multi-currency support
- Volunteer registry
- Convention staffing with real-time supervisor check-ins
- Analytics: workforce utilization, cost per deployment
- Compliance reporting exports
- API access for third-party integrations
- White-label configuration for facility management companies
- Resident app (simplified service request)

### Phase 4 (12+ months)

- Smart city operator dashboard (multi-institution aggregate)
- ML-based trust score optimization
- Predictive workforce availability
- Integration with payroll and HR systems
- Mobile workforce GPS tracking (opt-in)
- Community safety score (neighborhood-level)

---

## MVP Demo Data Seed

The MVP will ship with seeded demo data for the RCCG Convention scenario:

```
Institution: RCCG Convention Operations
─────────────────────────────────────────
Workers: 80 pre-seeded workers
  - 45 Electricians (various trust scores: 45–95)
  - 20 General Workers (various trust scores: 40–85)
  - 10 Security Personnel
  - 5 Medical Volunteers

Service Request: "Convention Staffing — May 2026"
  - Workers needed: 50
  - Skill: Electrician
  - Minimum trust score: 65
  - Start: 2026-05-15
  - End: 2026-05-18

Existing Trust History:
  - 12 workers with full deployment history
  - 8 workers with incident records (some resolved)
  - 25 workers with endorsements
  - 30 workers with performance reviews
```

---

## MVP Technical Constraints

| Constraint | Approach |
|-----------|---------|
| Identity verification | Mock adapter (returns VERIFIED for valid-format NIN) |
| Notifications | In-app only (no WhatsApp/SMS in MVP) |
| File storage | Local filesystem (not S3 in MVP) |
| Tenant isolation | Soft (institution_id column) not schema-per-tenant |
| Auth | JWT only (no OAuth2) |
| Deployment | Single Docker Compose (no Kubernetes) |
| Performance | No Redis caching layer |
