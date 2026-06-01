# TrustGrid — Build Plan

**Version:** 1.0  
**Hackathon Window:** 72 hours  
**Post-Hackathon:** 90-day production roadmap  

---

## Hackathon Sprint (72 hours)

### Hour 0–4: Foundation

**Backend:**
- [ ] NestJS project scaffold with TypeScript
- [ ] Prisma setup + initial schema (Institution, UserAccount, WorkerProfile)
- [ ] PostgreSQL connection + initial migration
- [ ] Auth module: register, login, JWT, refresh tokens
- [ ] Global middleware: tenant resolution, error handling, logging

**Frontend:**
- [ ] Flutter project scaffold (Android + Web targets)
- [ ] Navigation/routing structure (GoRouter)
- [ ] Auth screens: Login, Registration
- [ ] API service layer (Dio + interceptors)
- [ ] State management setup (Riverpod)

---

### Hour 4–16: Core Modules

**Backend:**
- [ ] WorkerProfile CRUD + service layer
- [ ] Identity verification (mock adapter)
- [ ] Trust Score Engine (basic: verification + deployments + ratings)
- [ ] Trust Event model + event emission
- [ ] Endorsements module
- [ ] Seeding script (RCCG demo data, 80 workers)

**Frontend:**
- [ ] Admin Dashboard screen
- [ ] Worker Registry screen (list + filters)
- [ ] Worker Profile screen (full trust profile)
- [ ] Add Worker form

---

### Hour 16–32: Operational Modules

**Backend:**
- [ ] ServiceRequest CRUD + status machine
- [ ] WorkforceAssignment module
- [ ] Worker-to-assignment matching logic (filter by skill + trust score)
- [ ] AssignmentWorker accept/decline flow
- [ ] PerformanceReview module + trust score trigger
- [ ] IncidentReport module + resolution flow
- [ ] Analytics endpoints (dashboard aggregates)

**Frontend:**
- [ ] Service Request creation screen
- [ ] Matched workers view (filtered list)
- [ ] Assign workers flow
- [ ] Incident reporting screen
- [ ] Performance review submission screen
- [ ] Analytics/dashboard charts (fl_chart)

---

### Hour 32–48: Worker Mobile Experience

**Frontend (worker-facing):**
- [ ] Worker home screen (profile, trust score gauge)
- [ ] My Assignments screen (incoming, active, completed)
- [ ] Accept/Decline assignment UI
- [ ] My Reviews screen
- [ ] My Endorsements screen
- [ ] Trust score history view

**Backend:**
- [ ] Worker-specific API endpoints
- [ ] In-app notification model (simple polling)
- [ ] Emergency mobilization endpoint

---

### Hour 48–64: Polish & Demo Readiness

- [ ] Seed demo data finalized (RCCG Convention scenario)
- [ ] Trust score visualization (gauge chart, grade badge)
- [ ] Error handling across all screens
- [ ] Loading states and empty states
- [ ] Demo-mode flag (skip auth for presentation)
- [ ] Docker Compose setup (backend + postgres + seeder)
- [ ] README with setup instructions

---

### Hour 64–72: Buffer & Presentation

- [ ] Final end-to-end demo walkthrough (2 full runs)
- [ ] Fix any critical demo-breaking bugs
- [ ] Slide deck final review
- [ ] Screen recording backup
- [ ] Deploy to demo environment

---

## Module Build Order (Priority)

```
Priority 1 (MUST DEMO):
  Auth → Worker Registry → Trust Score → Service Request → Assignment

Priority 2 (SHOULD DEMO):
  Performance Reviews → Incidents → Endorsements → Dashboard

Priority 3 (NICE TO HAVE):
  Emergency Mobilization → Procurement → Analytics charts
```

---

## Technical Build Stack

### Backend (NestJS)

```
trustgrid/backend/
├── src/
│   ├── main.ts                      ← App bootstrap
│   ├── app.module.ts                ← Root module
│   ├── prisma/
│   │   ├── prisma.module.ts
│   │   ├── prisma.service.ts
│   │   └── schema.prisma
│   ├── modules/
│   │   ├── auth/                    ← JWT auth
│   │   ├── institutions/            ← Tenant management
│   │   ├── identity/                ← Verification adapters
│   │   ├── workforce/               ← Worker profiles
│   │   ├── vendors/                 ← Vendor profiles
│   │   ├── volunteers/              ← Volunteer profiles
│   │   ├── endorsements/            ← Endorsement engine
│   │   ├── trust-score/             ← Score computation
│   │   ├── service-requests/        ← Service pipeline
│   │   ├── assignments/             ← Workforce assignments
│   │   ├── procurement/             ← Procurement governance
│   │   ├── incidents/               ← Incident management
│   │   ├── performance/             ← Reviews and ratings
│   │   ├── analytics/               ← Dashboard data
│   │   ├── config/                  ← Institution configuration
│   │   └── notifications/           ← Notification dispatch
│   └── common/
│       ├── adapters/                ← Identity provider adapters
│       ├── filters/                 ← Exception filters
│       ├── guards/                  ← Auth guards
│       ├── interceptors/            ← Logging, transform
│       ├── decorators/              ← @CurrentUser, @InstitutionId
│       └── pipes/                   ← Validation pipes
├── test/
├── package.json
├── tsconfig.json
└── .env.example
```

### Frontend (Flutter)

```
trustgrid/frontend/
├── lib/
│   ├── main.dart
│   ├── app.dart                     ← MaterialApp + routing
│   ├── config/
│   │   ├── router.dart              ← GoRouter routes
│   │   ├── theme.dart               ← TrustGrid design system
│   │   └── constants.dart
│   ├── models/
│   │   ├── worker_profile.dart
│   │   ├── trust_score.dart
│   │   ├── service_request.dart
│   │   ├── assignment.dart
│   │   ├── incident.dart
│   │   └── performance_review.dart
│   ├── services/
│   │   ├── api_client.dart          ← Dio HTTP client
│   │   ├── auth_service.dart
│   │   ├── worker_service.dart
│   │   ├── assignment_service.dart
│   │   └── analytics_service.dart
│   ├── providers/                   ← Riverpod state providers
│   │   ├── auth_provider.dart
│   │   ├── workers_provider.dart
│   │   └── dashboard_provider.dart
│   └── screens/
│       ├── auth/
│       │   ├── login_screen.dart
│       │   └── register_screen.dart
│       ├── dashboard/
│       │   └── dashboard_screen.dart
│       ├── workforce/
│       │   ├── worker_list_screen.dart
│       │   ├── worker_profile_screen.dart
│       │   └── add_worker_screen.dart
│       ├── service_requests/
│       │   ├── service_request_list.dart
│       │   ├── create_request_screen.dart
│       │   └── request_detail_screen.dart
│       ├── assignments/
│       │   ├── assignment_list.dart
│       │   └── worker_assignment_screen.dart  ← Worker's view
│       ├── incidents/
│       │   ├── incident_list.dart
│       │   └── report_incident_screen.dart
│       └── analytics/
│           └── analytics_screen.dart
├── pubspec.yaml
└── test/
```

---

## 90-Day Production Roadmap

### Month 1: Stabilize & Harden

- Live NIN verification (NIMC API integration)
- BVN verification (CBN-licensed data provider)
- Real-time notifications (Firebase FCM)
- WhatsApp notification (Twilio / Meta Business API)
- Redis session management
- PostgreSQL connection pooling (PgBouncer)
- Rate limiting enforcement
- Security audit: SQL injection, auth bypass, IDOR
- Automated test suite (unit + integration)

### Month 2: Expand Features

- Vendor registry full implementation
- Procurement governance workflow (approval chains)
- Institution configuration editor (admin UI)
- Configurable trust score weights (per institution)
- Multi-zone geographic service areas
- Worker mobile app performance (offline support)
- Analytics: workforce utilization, cost analysis

### Month 3: Scale & Go-Live

- Kubernetes deployment (AWS EKS or GCP GKE)
- CI/CD pipeline (GitHub Actions)
- Monitoring: Datadog / Grafana + PagerDuty alerts
- Staging environment
- Production deployment with SSL, CDN
- RCCG pilot: 10 churches, 500 workers
- Redemption City estate pilot: 3 estates, 150 domestic workers
- Customer success onboarding playbook

---

## Risk Register

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| NIN API unavailable/rate-limited | HIGH | HIGH | Mock adapter in MVP; queue + retry in prod |
| Low worker smartphone adoption | MEDIUM | HIGH | Agent-assisted onboarding; WhatsApp bot |
| Institutions reluctant to pay | MEDIUM | HIGH | Free pilot with 5 flagship institutions |
| Data privacy concerns (NIN/BVN) | MEDIUM | HIGH | Field-level encryption; NDPR compliance |
| Competitor launch | LOW | MEDIUM | RCCG exclusivity agreement; data moat |
| Flutter web performance issues | MEDIUM | LOW | Optimize for mobile-first; web as secondary |
