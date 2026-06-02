# TrustGrid — Competitive Intelligence Report
*Generated from deep research across 5 reference platforms*

---

## Platform-by-Platform Lessons

---

### 1. MyGate — Estate & Residential Communities

**Their edge:** Guard-first UX (number-pad, multilingual, voice entry), unique persistent worker codes, 6-hour offline mode, ₹20/flat/month at 25K+ societies.

**What they're missing that TrustGrid has:**
- No algorithmic trust score — they track attendance but no composite TGP
- No government identity verification — no Aadhaar/NIN integration at all
- No portable worker identity — profile is locked to one society
- No hierarchical community structure
- No trust-gated opportunity network
- No white-label subdomains

**Direct lessons for TrustGrid:**
1. **Persistent worker codes**: every domestic worker gets a short permanent code (not just QR). Guards enter it, residents get push notification on check-in/out. Works without smartphones.
2. **Three dedicated app surfaces**: resident (approvals), guard (entry logging — big buttons, number pad), admin/operator (dashboard). Don't give guards the same UI as operators.
3. **Offline-first gate entry**: store last-known trust state locally on the guard device. Nigeria's power infrastructure demands >6 hours offline capability.
4. **Visitor overstay alerting**: time-bound approvals with automated escalation if guest stays past stated duration.
5. **Recurring invite with daily OTP rotation**: frequent workers (domestic staff, bus) get a new code each day automatically — security without daily admin friction.
6. **Pre-approve with leave-at-gate**: residents pre-authorize drop-offs without needing to be present.

**Nigerian adaptation:** Persistent worker code (not smartphone-dependent) is essential — most domestic workers in Nigerian estates don't have smartphones. Guard UX must work with basic USSD or an offline device. The ₹20/flat/month model scales only at density; TrustGrid's institution-level SaaS (₦15K–₦120K/month) is a better entry point.

**Key takeaway:** *TrustGrid should build a guard/gate interface that works without smartphones on either end — the worker shows a printed TGP card or gives their code, the guard enters it on a simple device.*

---

### 2. Rosterfy — Volunteer & Event Staffing

**Their edge:** Best-in-class volunteer lifecycle (apply → screen → onboard → schedule → check-in → report). Used by FIFA, Commonwealth Games, Red Cross. Shift allocation with skill-matching. Compliance document tracking with expiry alerts.

**What they're missing that TrustGrid has:**
- No identity verification (they take documents at face value)
- No trust score — just compliance checklists
- No community hierarchy — flat event-level structure
- No portable cross-organization profile
- Not built for developing markets or informal economy

**Direct lessons for TrustGrid:**
1. **Shift-based assignment with skill filtering**: volunteers are matched to shifts by skill, not just assigned broadly. TrustGrid's service requests should support shift slots with minimum trust score gates.
2. **Self-service onboarding wizard**: volunteers complete their own profile, upload documents, and pass through configurable screening steps. The operator just approves/rejects. TrustGrid's join flow should mirror this.
3. **Document expiry tracking**: certifications, permits, and credentials have expiry dates. TrustGrid Trust Credentials already have `expiresAt` — surface expiry alerts on the dashboard.
4. **Check-in/check-out via QR at the event**: volunteers scan their QR at a station to mark attendance. This is exactly what TrustGrid's Trust Passport QR enables — make it explicit for event contexts.
5. **Post-event automated reporting**: attendance, no-shows, hours worked. Operators should get this without manual work.
6. **Role-based group communication**: send targeted messages to "all electricians assigned to Stage B". TrustGrid's notification layer should support segment-based messaging.

**Nigerian adaptation:** Rosterfy's compliance focus maps well to RCCG's HOD structure — Department Heads own their volunteer pools. TrustGrid's authority engine (Parish HOD role) should drive shift assignments, not just trust scores. The event module (₦150K–₦1.2M) directly competes with Rosterfy's event licensing.

**Key takeaway:** *For Redemption City convention staffing, TrustGrid needs shift slots with QR check-in, skill-filtered matching, and automated post-event attendance reports — Rosterfy proves this workflow converts institutions into paying customers.*

---

### 3. ComplyFlow — Multi-Site Contractor Compliance

**Their edge:** Real-time compliance dashboards across multiple job sites, document expiry alerts, competency/induction tracking, access zone management, live site headcount, subcontractor chain visibility.

**What they're missing that TrustGrid has:**
- No identity verification layer (compliance ≠ identity)
- No trust score — binary compliant/non-compliant only
- No community hierarchy
- No opportunity network
- Expensive and complex for SME institutions

**Direct lessons for TrustGrid:**
1. **Compliance status as a gate, not just a badge**: a worker shouldn't be assignable to a job if their certifications have expired. TrustGrid's service request assignment should check credential validity, not just trust score.
2. **Subcontractor chain visibility**: if an organisation brings workers to an estate, the estate operator should see the org's compliance status AND the individual workers'. Implement organisation-level trust scores.
3. **Access zone mapping**: different areas of a site have different trust/compliance requirements. A security guard (trust ≥ 70) can access the main building; an electrician (trust ≥ 65 + COREN cert) can access the server room. TrustGrid's opportunity gate already supports this — make it spatial.
4. **Live headcount dashboard**: for large events, show in real time who is checked in where. This is the convention ops control room view.
5. **Document expiry push alerts**: 30 days before a credential expires, notify the worker AND the institution. Currently TrustGrid stores `expiresAt` on TrustCredential but sends no alert.

**Nigerian adaptation:** Nigerian facilities management companies (Primrose Estate, VGC) face exactly the multi-site problem. A worker at Site A who performs poorly should be flagged before Site B hires them. TrustGrid's portable trust score solves this — ComplyFlow cannot.

**Key takeaway:** *Build a live event/site headcount dashboard and automatic credential expiry alerts — these are the two ComplyFlow features that facility managers cite as deal-clinchers.*

---

### 4. Appruv — Vendor Qualification & Procurement

**Their edge:** Structured vendor prequalification (financial docs, insurance, H&S, references), configurable questionnaires, multi-reviewer approval workflows, supplier portal for self-service doc upload, audit trail for compliance reporting.

**What they're missing that TrustGrid has:**
- No identity verification of the people behind the vendor
- No trust score on individual workers within a vendor company
- No community hierarchy or membership concept
- Expensive for Nigerian SME context

**Direct lessons for TrustGrid:**
1. **Vendor self-service portal**: vendors upload their own CAC cert, insurance, tax compliance docs. An operator configures what's required, vendors fill it in, operators approve. TrustGrid's organisation onboarding should work this way — not manually entered by operators.
2. **Configurable qualification questionnaire**: different institution types need different vendor questions. An estate asks about insurance and references; a school asks about child safeguarding and DBS checks. TrustGrid's Institution Catalog Override concept should extend to vendor qualification requirements.
3. **Multi-stage approval workflow with named approvers**: Head of Procurement approves Stage 1, Finance Director approves Stage 2. Map this to TrustGrid's authority engine — Province-level roles approve Provincial suppliers, Area-level roles approve local vendors.
4. **Audit-ready procurement records**: every approval, rejection, and document version is logged with timestamps and approver identity. TrustGrid's AuditLog model is the foundation — surface it as a compliance export.
5. **Preferred supplier list**: institutions mark certain vendors as preferred (faster re-engagement, priority matching for service requests). Implement as a `isPreferred` flag on OrganisationWorker.

**Nigerian adaptation:** Nigerian schools and universities face donor/accreditor requirements to demonstrate vendor governance. Appruv's audit export maps directly to this — TrustGrid can generate a compliance PDF showing every vendor verified, when, by whom, and against what criteria.

**Key takeaway:** *Build a vendor self-onboarding portal where organisations upload their CAC cert and compliance docs — this removes the manual burden from operators and makes the platform self-scaling.*

---

### 5. Checkr — Verification & Trust Infrastructure

**Their edge:** API-first background check platform, worker-owned portable profile ("Checkr Go"), continuous monitoring (re-check workers on the job), instant results for many check types, serves Uber, Lyft, DoorDash, Amazon Flex.

**What they're missing that TrustGrid has:**
- US-only (no Nigeria, no NIN/BVN integration)
- No community hierarchy or membership concept
- No trust score — just pass/fail per check type
- No opportunity network — just background check API
- No white-label community portals

**Direct lessons for TrustGrid:**
1. **Worker-owned portable profile ("Trust Passport as a product")**: Checkr Go lets workers carry their verified background check and share it with multiple employers without re-checking. TrustGrid's TGP is the same concept but richer — lean into this. Workers should be able to share their passport link directly with any employer, community, or gig platform.
2. **Continuous monitoring, not one-time verification**: Checkr re-runs checks when workers are already on a job. TrustGrid should monitor for new incidents, expired credentials, and trust score drops on active assignments — not just at onboarding.
3. **API-first verification for third-party platforms**: Checkr's revenue is 70% API. TrustGrid should offer `GET /verify/:passportCode` as a paid API that other Nigerian platforms (property management software, HR systems, gig platforms) can embed. ₦100/call.
4. **Instant results with confidence tiers**: Checkr shows "Identity Confirmed", "Clear", "Consider", "Suspended" — four tiers with different meanings. TrustGrid's trust grades (A+ to F) achieve this but the labels need to be clearer for quick operator decisions.
5. **Adverse action workflow**: when a worker is rejected based on their check, Checkr provides a legal workflow for notifying the worker and allowing them to dispute. TrustGrid's incident and blacklist flows should include a dispute/appeal mechanism.
6. **Gig/freelance context as a first-class use case**: Checkr built specifically for gig platforms. TrustGrid's global worker profiles (isGlobal: true) and Opportunity Network should explicitly market to Nigerian gig platforms (food delivery, home services, logistics) as a verification API layer.

**Nigerian adaptation:** Checkr charges $25-100 per background check in the US. Nigerian equivalent should be ₦5K–₦25K per NIN+BVN verification. The API access tier (₦100/call) becomes the enterprise revenue stream as Nigerian platforms (Glovo Nigeria, Jumia Food, etc.) embed TrustGrid verification.

**Key takeaway:** *TrustGrid should build a public verification API (`GET /verify/:code` → trust grade + credentials) and market it to Nigerian gig platforms as their embedded trust infrastructure — this is Checkr's core moat and TrustGrid can own it for Nigeria.*

---

## Cross-Cutting Themes

### Theme 1: Guard/Gate Interface Is the Critical Enforcement Layer
All 5 platforms underinvest in the enforcement UX. MyGate is the best but still struggles with guards who have low digital literacy. **TrustGrid opportunity:** A printed TGP card (QR + code + photo) that works completely offline — the guard scans it with a basic camera or enters the code on a keypad. No smartphone required on the worker side.

### Theme 2: Document/Credential Expiry Is Universally Unresolved
Every platform tracks documents but only ComplyFlow sends expiry alerts. Most platforms fail to close the loop. **TrustGrid opportunity:** Automated 30-day, 7-day, and day-of expiry alerts via Termii SMS + Zeptomail — built on the existing `TrustCredential.expiresAt` field.

### Theme 3: Worker Portability Is The Unfilled Gap
None of the 5 platforms have a truly portable worker identity that travels across organizations. MyGate is estate-locked, Rosterfy is event-locked, Checkr is employer-verified-only. **TrustGrid's Trust Passport is the only portable cross-community trust identity in this space.**

### Theme 4: Community/Organisation Trust Score Is Missing Everywhere
Every platform verifies workers but none score organizations/vendors algorithmically. TrustGrid can apply the same trust engine to organisations (completion rate, incident rate, credential validity) for a vendor trust score shown on their profile.

### Theme 5: API Revenue Is The Enterprise Tier
Checkr (70% API revenue), MyGate (developer APIs), Rosterfy (API for event platforms). The B2B2C API play — selling verification-as-a-service to other Nigerian platforms — is the highest-margin revenue stream available to TrustGrid.

---

## TrustGrid's Genuine Differentiators (None of the 5 Have These)

1. **Hierarchical community trust propagation** — a Parish's trust flows to Area, Area to Province. No competitor models this.
2. **NIN/BVN government identity anchor** — the most rigorous identity layer in Nigeria, unavailable to any of the 5 (US/India-focused).
3. **Trust score that is portable, algorithmic, and time-decayed** — not just pass/fail compliance.
4. **White-label community subdomains** — each RCCG parish, estate, or school gets its own branded portal.
5. **Community hierarchy engine** — model any org structure: RCCG 7-level, estate 4-level, university department.
6. **Opportunity Network with trust gates** — jobs that only unlock when your score is high enough.

---

## Prioritized Build List (from competitive analysis)

| Feature | Inspired By | Impact | Effort |
|---------|-------------|--------|--------|
| Printed Trust Passport (PDF with QR + code + photo) | MyGate gate workflow | High | Low |
| Credential expiry alerts (SMS + email) | ComplyFlow | High | Low |
| Guard/gate app view (simplified, offline-capable) | MyGate guard UX | High | Medium |
| Vendor self-onboarding portal (doc upload + approval) | Appruv | High | Medium |
| Shift-based event staffing with QR check-in | Rosterfy | High | Medium |
| Continuous monitoring (re-score on credential expiry) | Checkr | High | Medium |
| Organisation trust score | Checkr + ComplyFlow | High | Medium |
| Public verification API (₦100/call) | Checkr | High | Low |
| Worker dispute/appeal mechanism for blacklist | Checkr adverse action | Medium | Low |
| Post-event automated attendance report | Rosterfy | Medium | Low |

---

## Competitive Positioning Narrative

TrustGrid is the trust infrastructure that powers Nigerian communities — the layer that MyGate, Rosterfy, and Checkr each touch but none fully own. While MyGate locks worker records to a single estate and Checkr locks them to a single employer, TrustGrid's Trust Passport travels with the worker across every church, estate, school, and gig platform they ever serve. And while Checkr is building trust infrastructure for Silicon Valley, TrustGrid is building it for the 5 million RCCG members, 500 Lagos estates, and 40 million informal economy workers who the global platforms will never reach — grounded in NIN/BVN identity, hierarchical community authority, and a portable trust score that compounds over a lifetime of honest work.
