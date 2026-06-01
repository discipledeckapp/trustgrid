# TrustGrid — Product Brief

**Version:** 2.0  
**Date:** May 2026  
**Challenge:** Kingdom Hack 3.0 — Smart City Innovation  
**Track:** TRACK_0C — Verified Service Access  

---

## Tagline

> **"Trusted People. Accountable Service. Stronger Communities."**

---

## What TrustGrid Is

TrustGrid is a **Community Workforce & Service Governance Infrastructure Platform**.

It is the operating trust layer for communities, institutions, estates, schools, churches, campuses, event operators, and smart-city administrators — enabling them to verify, deploy, monitor, evaluate, and govern service providers, volunteers, contractors, community workers, and **service organisations**.

Think of TrustGrid as:
> **LinkedIn + Vendor Management + Workforce Governance + Identity Verification + Organisation Registry for Smart Communities.**

---

## What TrustGrid Is NOT

- Not an artisan marketplace
- Not an Uber for artisans
- Not a service provider directory
- Not a listing or classifieds platform

TrustGrid does not exist to help residents discover workers. It exists to give institutions the infrastructure to govern trusted people and organisations at scale.

---

## Who Can Join TrustGrid

TrustGrid serves **four distinct participant types**, each with their own onboarding path, dashboard, and capabilities:

| Participant | Who They Are | How They Join |
|-------------|-------------|--------------|
| **Institution** | Estate, church, school, facility manager, smart city operator | Admin registers institution + configures platform |
| **Organisation** | A service company (e.g. "Emeka Electrical Services Ltd") with multiple workers and branches | Organisation admin registers company, adds workers |
| **Individual Worker** | Sole trader, freelancer, contractor, volunteer | Self-registers via mobile app or web |
| **Resident** | Community member requesting services | Invited by institution admin |

---

## The Problem

Communities and institutions regularly engage:
- Electricians, plumbers, technicians, cleaners
- Security personnel, medical volunteers, welfare workers
- Event workers, transport operators, contractors
- **Service companies with multiple field workers**
- **Staffing agencies deploying teams**

**The problem is not discovery. The problem is governance.**

| Question Institutions Cannot Answer Today | Root Cause |
|-------------------------------------------|-----------|
| Who can we trust? | No verification layer |
| Which company should we hire? | No vendor governance system |
| Does this company have verified workers? | No org-to-worker trust chain |
| Who has worked for us before? | Records in WhatsApp groups |
| Which branch of this company covers our area? | No branch registry |
| Who performed well? | Memory and verbal recommendations |
| Who should be rehired? | No performance history |
| Who has unresolved incidents? | No incident tracking |
| How do we manage 500 workers over a 3-day event? | No workforce management system |

---

## The Vision

Imagine Redemption City in 10 years — a city of one million people. Every service interaction should be:
- **Trusted** — verified identities and credentials
- **Accountable** — performance tracked, incidents recorded
- **Traceable** — full audit trail of who did what, where, when
- **Measurable** — trust scores, completion rates, quality ratings

TrustGrid becomes the operating trust layer for that city.

---

## Primary Customers (Who Pays)

| Customer Type | Use Case |
|---------------|----------|
| Community Management Organizations | Govern vendors, contractors, maintenance workers |
| Estates & Gated Communities | Screen and track domestic workers, security, contractors |
| Churches & Religious Organizations | Manage volunteers, event workers, welfare teams |
| Convention & Event Organizers | Staff large events with verified temporary workers |
| Schools & Universities | Manage facility vendors, security, maintenance |
| Facility Management Companies | Centralize vendor governance across multiple properties |
| Smart-City Operators | City-wide service trust infrastructure |
| Local Governments | Contractor compliance and workforce accountability |

**Residents are users. Institutions are customers.**

---

## Core Product Modules

### MODULE 1 — Workforce Network & Onboarding

The entry point for all participants. Supports multiple registration paths.

**Capabilities:**

#### 1.1 Individual Worker Self-Registration
Five-step guided wizard:
1. **Identity** — Name, phone, photo upload
2. **Skills** — Primary skill, categories, years of experience, rates
3. **Verification** — NIN/BVN identity verification
4. **Credentials** — Certificate and licence upload
5. **Availability** — Working hours, service zones, activation

#### 1.2 Organisation Registration
Four-step guided wizard:
1. **Company Details** — Name, RC number, type, contact info
2. **Services** — Service categories, coverage zones
3. **Documents** — CAC certificate, tax clearance, proof of address
4. **Team Setup** — Key contact, branch setup, initial worker invites

#### 1.3 Branch Registration
Organisations can register multiple branches:
- Branch name and address
- Service zone coverage
- Branch manager designation
- Worker allocation per branch

#### 1.4 Endorsement Workflow
Structured multi-step endorsement process:
1. Worker/org submits profile for review
2. Institution operator notified
3. Operator reviews credentials, identity, history
4. Operator endorses (or requests more information)
5. Institution admin approves activation
6. Worker/org is activated in the registry
7. Trust score initialised based on endorsement level

#### 1.5 Credential Upload & Verification
- Professional certificates (COREN, NBTE, NIA, etc.)
- Trade licences
- Medical fitness certificates
- Insurance certificates
- Document verified by institution admin or third-party integration

#### 1.6 Identity Verification
- NIN verification (Nigeria)
- BVN verification (Nigeria)
- Ghana Card, Huduma, NIDA (expansion markets)
- Face match (optional)
- Manual document review fallback

#### 1.7 Availability Management
- Working hours setup (daily/weekly schedule)
- Service zone selection
- Blackout dates (unavailable periods)
- Real-time availability toggle
- Capacity limits (max concurrent jobs)

#### 1.8 Profile Activation States

```
DRAFT → SUBMITTED → UNDER_REVIEW → APPROVED → ACTIVE
                                 ↓
                           NEEDS_MORE_INFO
                                 ↓
                           (resubmit) → UNDER_REVIEW
```

---

### MODULE 2 — Identity & Verification
Multi-adapter identity verification across countries.

### MODULE 3 — Workforce Registry
Central registry of verified workers per institution.

### MODULE 4 — Organisation Registry
Central registry of verified service organisations, their branches, and their workers.

### MODULE 5 — Vendor Registry
Organisation-level vendor governance.

### MODULE 6 — Volunteer Registry
Volunteer profiles with skills, availability, deployment history.

### MODULE 7 — Community Endorsements
Structured peer and institutional endorsements.

### MODULE 8 — Trust Score Engine
Algorithmic trust score per worker and organisation.

### MODULE 9 — Service Request Management
Structured service requests from institutions or residents.

### MODULE 10 — Workforce Assignment
Match workforce to requests. Assign verified workers.

### MODULE 11 — Procurement Governance
Manage procurement workflows for large institutions.

### MODULE 12 — Incident & Dispute Management
Record incidents, disputes, complaints.

### MODULE 13 — Performance Tracking
Post-service ratings, structured feedback, KPI tracking.

### MODULE 14 — Emergency Workforce Mobilization
Rapid deployment of pre-verified workers for emergency scenarios.

### MODULE 15 — Community Analytics
Dashboard for community operators.

### MODULE 16 — Configuration Engine
Institution-level configuration.

---

## User Types & Their Experiences

### 1. Platform Super Admin
**Who:** TrustGrid staff  
**Dashboard:** `admin.trustgrid.ng`  
**Can do:**
- Approve/reject institution registrations
- Approve/reject organisation registrations
- Manage identity verification queue
- View platform-wide analytics
- Manage subscriptions and billing
- Suspend/reinstate any account
- Configure global platform settings

### 2. Institution Admin
**Who:** Estate manager, church administrator, school bursar  
**Dashboard:** `app.trustgrid.ng`  
**Can do:**
- Full institution configuration
- Approve worker and organisation onboarding applications
- Create and manage service requests
- View all workforce data
- Manage institution operators
- Access compliance reports

### 3. Institution Operator
**Who:** Day-to-day operations staff  
**Dashboard:** `app.trustgrid.ng` (restricted view)  
**Can do:**
- View and manage service requests
- Assign workers and organisations
- Record incidents
- Submit performance reviews
- Manage worker availability

### 4. Organisation Admin
**Who:** Company owner, managing director of service company  
**Dashboard:** `app.trustgrid.ng/my-organisation`  
**Can do:**
- Manage company profile and branches
- Add/remove workers from organisation
- View contracts and assignments
- Track organisation trust score
- Manage worker credentials

### 5. Individual Worker
**Who:** Electrician, plumber, cleaner, security guard  
**App:** Mobile-first Flutter app + web  
**Can do:**
- Manage personal profile
- Upload credentials
- Verify identity
- Set availability
- Accept/decline assignments
- View trust score and history

### 6. Resident
**Who:** Homeowner, tenant, community member  
**App:** Simplified web/mobile view  
**Can do:**
- Request services
- Track service status
- Rate completed services
- View assigned worker's trust profile

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | NestJS + TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Frontend — Dashboard | Next.js (app.trustgrid.ng) |
| Frontend — Admin | Next.js (admin.trustgrid.ng) |
| Frontend — Mobile | Flutter (Android + iOS) |
| Frontend — Marketing | Next.js (trustgrid.ng) |
| Identity | Adapter-based (NIN/BVN → Ghana Card → Huduma) |
| Auth | JWT + OAuth2 |
| Queue | BullMQ + Redis (Upstash) |
| Observability | Sentry + Pino |
| CI/CD | GitHub Actions |
| Hosting | Render (API) + Vercel (web) + Neon (database) |

---

## Key Differentiators

1. **Governance-first, not marketplace-first**
2. **Supports both individuals AND organisations** with full branch hierarchy
3. **Trust Score Engine** — algorithmic, configurable, persistent
4. **Structured onboarding** — multi-step wizard, not a form dump
5. **Configuration-driven** — no hardcoded categories, rules, or weights
6. **Multi-country identity adapters** — designed for pan-African scale
7. **Low-literacy accessible** — voice, agent-assisted, WhatsApp-friendly
8. **Event-scale workforce management** — 500 workers in 3 days
9. **Permanent institutional memory** — communities never lose their trust data
