# TrustGrid — Community Hierarchy Architecture

**Version:** 2.0

---

## The Community Node

Everything in TrustGrid v2 is organized around **Community Nodes**.

A Community Node is any organized unit within a trust hierarchy:
- A parish
- An estate
- A school
- A department
- A province

Every Community Node has:
- A parent (except the root)
- Zero or more children
- Members with roles
- Authority assignments
- Endorsement capability
- Opportunity publication rights
- A trust network boundary

---

## Node Type System

Community Node Types are configured per tenant (or platform-wide).

### RCCG Hierarchy

```
Level 1: Global Organization    (RCCG International)
Level 2: Continent              (Africa)
Level 3: Country                (Nigeria)
Level 4: Region                 (Southwest)
Level 5: Province               (Lagos Province)
Level 6: Zone                   (Lagos Zone)
Level 7: Area                   (Area 5)
Level 8: Parish                 (El-Shaddai Parish)
```

### Estate Hierarchy

```
Level 1: Estate                 (Redemption City Estate)
Level 2: Phase                  (Phase 1)
Level 3: Street                 (Abraham Avenue)
Level 4: Block                  (Block C)
```

### University Hierarchy

```
Level 1: University             (Covenant University)
Level 2: College                (College of Engineering)
Level 3: Department             (Electrical Engineering)
Level 4: Study Group            (Final Year 2026)
```

---

## Trust Propagation Rules

Trust flows upward and downward through the hierarchy.

### Upward Propagation (Aggregation)
- Parish trust scores roll up to Area
- Area trust scores roll up to Zone
- Zone trust scores roll up to Province

Province leadership can see:
- Which Parishes have the most verified members
- Which Areas have the highest trust density
- Platform-wide health metrics

### Downward Propagation (Inheritance)
- Province-level endorsements carry weight in all child nodes
- Area authority can endorse for all their Parishes
- Provincial Trust Credentials are valid across all parishes in the province

### Cross-Node Trust (Portability)
- A Trust Credential from El-Shaddai Parish is visible to:
  - Any member of the same Area
  - Any institution that accepts RCCG Parish credentials
  - Any opportunity that requires Active Parish Membership

---

## Community Verification Chain

Communities themselves must be verifiable.

```
El-Shaddai Parish
  Verified by: Area 5
  Verification date: March 2026
  Status: Active

Area 5
  Verified by: Lagos Zone
  Status: Active

Lagos Zone
  Verified by: Southwest Province
  Status: Active
```

An unverified community node cannot issue endorsements that carry institutional weight.
A community node's verification status is inherited by its members' credentials.

---

## Authority Model

### The Problem with Self-Declared Authority

TrustGrid v1 allowed anyone to endorse anyone. This was wrong.

**An endorsement is only as valuable as the authority behind it.**

In v2, every endorsement traces back to an Authority Assignment.

### Authority Assignment

```
Pastor John Adeyemi
  Role:         Parish Pastor
  Community:    El-Shaddai Parish, Area 5
  Granted by:   Area Pastor Emmanuel
  Grant date:   January 2026
  Expiry:       December 2027
  Status:       Active

  Permissions:
    ✓ Issue Parish Member endorsements
    ✓ Issue Volunteer endorsements
    ✓ Approve service requests within parish
    ✗ Issue Province-level endorsements
    ✗ Assign Area-level roles
```

### Authority Inheritance

```
Provincial Pastor
  → Can grant Area Pastor roles
  → Area Pastor endorsements carry Provincial weight for intra-province contexts

Area Pastor
  → Can grant Parish Pastor roles
  → Parish Pastor endorsements carry Area weight for intra-area contexts

Parish Pastor
  → Can endorse members in their parish
  → Endorsements are valid within their Area
```

---

## Membership Model

### Membership States

```
PENDING     → Applied, awaiting approval
ACTIVE      → Verified member
SUSPENDED   → Temporarily suspended
REVOKED     → Membership revoked
EXPIRED     → Time-limited membership ended
TRANSFERRED → Moved to another node
```

### Membership Types

```
RESIDENT    → Lives/belongs to this community
WORKER      → Provides services to this community
VOLUNTEER   → Unpaid service member
ASSOCIATE   → Affiliated but not full member
AUTHORITY   → Has governance role
VISITOR     → Temporary access
```

### Membership Verification

A membership is only as strong as how it was verified.

```
Verification Levels:
  SELF_DECLARED    → Person claims membership (weakest)
  PEER_VOUCHED     → Another member vouched
  AUTHORITY_ISSUED → An authority role confirmed
  BIOMETRIC        → Identity verified + NIN match
```

---

## Opportunity Network

### What Is an Opportunity?

An Opportunity is a trust-gated call to action.

```
Opportunity: Convention Volunteer — Holy Ghost Congress 2026

Published by:   Lagos Zone (Authority: Area Coordinator)
Type:           VOLUNTEER
Location:       Redemption Camp
Dates:          May 15-18, 2026
Slots:          200

Eligibility:
  ✓ Active Parish Membership (any RCCG parish in Lagos Zone)
  ✓ Trust Score ≥ 60
  ✓ No open incidents in last 6 months

Skills needed: [General Labour, Security, Medical, Electrical]
```

### Opportunity Types

```
VOLUNTEER       → Unpaid community service
JOB             → Paid employment
PROJECT         → Defined-scope contract work
EVENT_STAFFING  → Temporary event support
MINISTRY        → Faith-based volunteer role
SERVICE_REQUEST → Specific service needed
INTERNSHIP      → Development opportunity
```

### Trust-Gated Access

Opportunities can require:
- Minimum trust score
- Active membership in specific node(s)
- Specific credentials (e.g. COREN registered)
- No open incidents
- Specific endorsement type
- Biometric verification level

---

## The Trust Passport (v2)

The Trust Passport is the visible face of the Trust Graph.

### What It Contains

```
TRUST PASSPORT                          TGP-92A81

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

IDENTITY
  Name:           Chukwuemeka Adeyemi
  Verified Name:  CHUKWUEMEKA SUNDAY ADEYEMI (NIMC)
  Photo:          [Live selfie from liveness check]
  NIN Verified:   ✓ March 2026

COMMUNITY MEMBERSHIP
  Primary:        El-Shaddai Parish, Area 5
                  Member since: Jan 2024 · Status: Active
                  Verified by: Area Pastor Emmanuel
  Also member of: RCCG Lagos Zone Electrical Team

AUTHORITY ROLES
  None currently assigned

TRUST CREDENTIALS
  ✓ Verified Parish Member          (issued by El-Shaddai Parish)
  ✓ RCCG Convention Volunteer       (issued by Lagos Zone, expires Dec 2026)
  ✓ Certified Electrician           (COREN verified)

ENDORSEMENTS (12)
  ★ Area 5 Endorsement              (issued by Area Coordinator)
  ★ Estate Manager Endorsement      (Redemption City Estate)
  ★ 10 Peer Endorsements

TRUST SCORE                         91.5 / A+

ASSIGNMENT HISTORY
  47 completed · 4.9 avg rating · 0 open incidents

LAST VERIFIED                       June 1, 2026
PASSPORT VALID UNTIL                December 2026

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Verify at: verify.trustgrid.ng/TGP-92A81
[QR CODE]
```

### Public Verification

When someone scans `TGP-92A81`:

```
https://verify.trustgrid.ng/TGP-92A81

TRUSTGRID VERIFICATION

Status:         ACTIVE ✓
Name:           C. Adeyemi
Trust Score:    91.5 (A+)
Primary Community: El-Shaddai Parish, RCCG Area 5
NIN Verified:   Yes (NIMC)
Active Credentials: 3
Last Verified:  June 1, 2026
Passport Valid: December 2026

[VERIFY IDENTITY] [VIEW CREDENTIALS] [REPORT CONCERN]
```

This page is:
- Publicly accessible (no login)
- Read-only (privacy protected — no address, no phone)
- Real-time (verifies against live database)
- QR-ready
- API-accessible for external systems

---

## Data Model Summary

```
Tenant (Organization)
  └── CommunityNode (hierarchical)
        ├── CommunityNodeType
        ├── CommunityVerification
        ├── Membership (Person ↔ Node)
        │     └── MembershipType, Status, VerificationLevel
        ├── AuthorityAssignment (Person → Role → Node)
        │     └── AuthorityRole (permissions)
        ├── Opportunity (trust-gated)
        │     └── OpportunityApplication
        └── EndorsementIssuance (from this node)

Person
  ├── Identity (NIN/BVN verification)
  ├── TrustPassport (one per person, globally unique)
  │     ├── PassportCode (TGP-XXXXX)
  │     ├── TrustCredential[] (issued credentials)
  │     └── QRCode
  ├── Membership[] (community nodes)
  ├── AuthorityAssignment[] (roles held)
  ├── Endorsement[] (received)
  ├── TrustScore (computed)
  ├── TrustScoreEvent[] (immutable log)
  ├── Assignment[] (jobs/opportunities)
  └── Review[] (performance history)
```
