# TrustGrid

> **Trusted People. Accountable Service. Stronger Communities.**

TrustGrid is a **Community Workforce & Service Governance Infrastructure Platform** — the trust operating system for communities, institutions, estates, schools, churches, campuses, event operators, and smart-city administrators.

**Challenge:** Kingdom Hack 3.0 — Smart City Innovation  
**Track:** TRACK_0C — Verified Service Access

---

## What TrustGrid Is

TrustGrid enables institutions to **verify, deploy, monitor, evaluate, and govern** service providers, volunteers, contractors, and community workers.

Think: **LinkedIn + Vendor Management + Workforce Governance + Identity Verification** for Smart Communities.

---

## Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+
- Flutter 3.x

### 1. Backend (Docker)

```bash
cd trustgrid/backend

# Copy env
cp .env.example .env

# Start Postgres + API
docker-compose up -d

# Run migrations & seed demo data
npm install
npx prisma migrate dev --name init
npm run db:seed
```

API running at: `http://localhost:3000/api`  
Swagger docs: `http://localhost:3000/api/docs`

### 2. Backend (Manual)

```bash
cd trustgrid/backend
npm install
cp .env.example .env
# Edit .env: set DATABASE_URL to your PostgreSQL instance
npx prisma generate
npx prisma migrate dev --name init
npm run db:seed
npm run start:dev
```

### 3. Flutter Frontend

```bash
cd trustgrid/frontend
flutter pub get
flutter run -d chrome       # Web
flutter run -d android      # Android
flutter run -d ios          # iOS (macOS only)
```

**Demo credentials (after seeding):**
- Phone: `08001234567`
- Password: `Admin123!`
- Institution ID: (shown in seed output)

---

## Project Structure

```
trustgrid/
├── docs/                        ← 18 product & architecture documents
│   ├── 01-product-brief.md
│   ├── 02-stage-2-submission.md
│   ├── 03-system-architecture.md
│   ├── 04-database-schema.md
│   ├── 05-api-contracts.md
│   ├── 06-business-design.md
│   ├── 07-mvp-scope.md
│   ├── 08-demo-script.md
│   ├── 09-pitch-outline.md
│   ├── 10-build-plan.md
│   ├── 11-configurability-framework.md
│   ├── 12-identity-adapter-architecture.md
│   ├── 13-community-trust-model.md
│   ├── 14-low-literacy-accessibility-strategy.md
│   ├── 15-smart-city-operating-model.md
│   ├── 16-revenue-model.md
│   ├── 17-competitive-analysis.md
│   └── 18-investor-perspective.md
│
├── backend/                     ← NestJS API
│   ├── src/
│   │   ├── main.ts
│   │   ├── app.module.ts
│   │   ├── prisma/
│   │   │   └── schema.prisma    ← Full Prisma schema
│   │   └── modules/
│   │       ├── auth/            ← JWT auth, registration, login
│   │       ├── workforce/       ← Worker registry, profiles
│   │       ├── trust-score/     ← Trust Score Engine
│   │       ├── endorsements/    ← Community endorsements
│   │       ├── service-requests/ ← Service request pipeline
│   │       ├── assignments/     ← Workforce assignments
│   │       ├── performance/     ← Ratings and reviews
│   │       ├── incidents/       ← Incident management
│   │       ├── vendors/         ← Vendor registry
│   │       └── analytics/       ← Dashboard and insights
│   ├── package.json
│   ├── Dockerfile
│   └── .env.example
│
├── frontend/                    ← Flutter app (Android/iOS/Web)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── app.dart
│   │   ├── config/
│   │   │   ├── router.dart      ← GoRouter navigation
│   │   │   └── theme.dart       ← TrustGrid design system
│   │   ├── models/
│   │   ├── services/
│   │   │   └── api_client.dart  ← Dio HTTP client
│   │   └── screens/
│   │       ├── auth/            ← Login, registration
│   │       ├── dashboard/       ← Institution overview
│   │       ├── workforce/       ← Worker registry
│   │       ├── service_requests/ ← Request pipeline
│   │       ├── incidents/       ← Incident management
│   │       ├── analytics/       ← Trust distribution
│   │       └── worker_app/      ← Worker-facing screens
│   └── pubspec.yaml
│
├── docker-compose.yml           ← One-command demo startup
└── README.md
```

---

## Demo Scenario

**RCCG Convention Operations — May 2026**

The convention operations team needs 50 verified electricians for a 3-day national convention.

**Demo flow:**
1. Login as admin → View institution dashboard
2. Navigate to Worker Registry → Filter by Electrician, Trust Score ≥65
3. Open the "Convention Electricians" service request
4. View 40+ matched, verified workers ranked by trust score
5. Select top 50 workers → Assign to convention
6. Submit a performance review → Watch trust score update in real time
7. Switch to worker app view → See the assignment from Chukwuemeka's perspective

---

## Core Modules

| Module | Description |
|--------|-------------|
| **Identity Verification** | Adapter-based (NIN/BVN → Ghana Card → Huduma) |
| **Workforce Registry** | Searchable, filterable, trust-ranked worker database |
| **Trust Score Engine** | Algorithmic, configurable, time-decayed trust scores |
| **Community Endorsements** | Weighted, accountable peer and institutional endorsements |
| **Service Requests** | Full pipeline from DRAFT → COMPLETED |
| **Workforce Assignment** | Multi-worker event staffing with accept/decline flow |
| **Performance Reviews** | Post-deployment ratings that update trust scores |
| **Incident Management** | Report → Investigate → Resolve → Trust score impact |
| **Analytics Dashboard** | Workforce metrics, trust distribution, activity feed |

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend API | NestJS + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Frontend | Flutter 3 (Android • iOS • Web) |
| Authentication | JWT + refresh tokens |
| Identity | Adapter pattern (MOCK in MVP, NIN/BVN in production) |
| API Docs | Swagger / OpenAPI |
| Containerization | Docker Compose |

---

## Documentation Index

| Document | Description |
|----------|-------------|
| [01-product-brief](docs/01-product-brief.md) | Full product overview and positioning |
| [02-stage-2-submission](docs/02-stage-2-submission.md) | Hackathon competition submission |
| [03-system-architecture](docs/03-system-architecture.md) | Architecture diagrams and decisions |
| [04-database-schema](docs/04-database-schema.md) | Full Prisma schema documentation |
| [05-api-contracts](docs/05-api-contracts.md) | REST API request/response contracts |
| [06-business-design](docs/06-business-design.md) | Revenue model and customer segments |
| [07-mvp-scope](docs/07-mvp-scope.md) | MVP vs post-MVP feature decisions |
| [08-demo-script](docs/08-demo-script.md) | Full demo walkthrough script |
| [09-pitch-outline](docs/09-pitch-outline.md) | 7-slide pitch narrative |
| [10-build-plan](docs/10-build-plan.md) | 72-hour hackathon build plan |
| [11-configurability-framework](docs/11-configurability-framework.md) | Configuration-driven architecture |
| [12-identity-adapter-architecture](docs/12-identity-adapter-architecture.md) | Multi-country identity adapters |
| [13-community-trust-model](docs/13-community-trust-model.md) | Trust score algorithm and model |
| [14-low-literacy-accessibility-strategy](docs/14-low-literacy-accessibility-strategy.md) | UX for low-literacy users |
| [15-smart-city-operating-model](docs/15-smart-city-operating-model.md) | Redemption City vision |
| [16-revenue-model](docs/16-revenue-model.md) | Pricing, projections, unit economics |
| [17-competitive-analysis](docs/17-competitive-analysis.md) | Why TrustGrid wins |
| [18-investor-perspective](docs/18-investor-perspective.md) | Investment thesis Q&A |

---

## The Tagline

> **"If Redemption City became a city of one million people, what infrastructure would be needed to govern trusted services and trusted workers? That is TrustGrid."**

---

*Built for Kingdom Hack 3.0 by Oluwaseyi Adelaju*
