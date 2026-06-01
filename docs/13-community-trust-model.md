# TrustGrid — Community Trust Model

**Version:** 1.0  

---

## What Is Trust in This Context?

Trust is not a feeling. In TrustGrid, trust is a **composite signal** derived from verifiable, recorded events in a worker's history within a community.

Trust answers the question:
> **"Given everything this community knows about this person, how confident are we that engaging them will produce a good outcome?"**

---

## Trust Is Contextual

A worker's trust score is **per institution**, not global.

Why:
- A worker trusted by a church convention team may not be appropriate for a hospital facility
- Different institutions weight different signals differently
- A worker can rebuild trust with Institution A after an incident at Institution B
- Workers should not carry consequences across unrelated institutions permanently

However, workers can **consent to sharing their cross-institutional trust summary** — a portable trust credential they voluntarily disclose.

---

## Trust Score Computation

### Formula

```
TrustScore(worker, institution) = 
  Σ (event.delta × event.weightApplied × timeDecayFactor(event.createdAt))
  
  clamped to [0, 100]
```

### Time Decay Factor

```
timeDecayFactor(eventDate) = 0.5 ^ (daysSinceEvent / halfLifeDays)

Default halfLifeDays = 365

Examples:
  Event today:      decay = 1.00   (no decay)
  Event 1 year ago: decay = 0.50   (half weight)
  Event 2 years ago: decay = 0.25  (quarter weight)
  Event 5 years ago: decay = 0.03  (nearly irrelevant)
```

Time decay means trust must be maintained. A worker who was excellent 3 years ago but has been inactive loses score gradually — the community's trust recency matters.

### Trust Grade Mapping

```
90–100  →  A+  (Exceptional)
80–89   →  A   (Excellent)
70–79   →  B+  (Good)
60–69   →  B   (Satisfactory)
50–59   →  C   (Fair)
35–49   →  D   (Below Average)
0–34    →  F   (Poor / Untrusted)
```

---

## Trust Events

Every change to a trust score is traceable to an immutable TrustEvent record.

### Event Catalog

| Event Type | Default Delta | Trigger |
|------------|--------------|---------|
| `ACCOUNT_CREATED` | +5 | Worker joins the platform |
| `IDENTITY_VERIFIED` (partial) | +5 | Document uploaded and reviewed |
| `IDENTITY_VERIFIED` (full) | +10 | NIN/national ID confirmed |
| `BIOMETRIC_VERIFIED` | +5 bonus | Face match confirmed |
| `CREDENTIAL_VERIFIED` | +5 | Professional certificate verified |
| `DEPLOYMENT_COMPLETED` | +2 | Assignment marked complete |
| `DEPLOYMENT_ABANDONED` | -3 | Worker abandoned active assignment |
| `RATING_5_STAR` | +3 | 5-star post-deployment rating |
| `RATING_4_STAR` | +1.5 | |
| `RATING_3_STAR` | +0.5 | |
| `RATING_2_STAR` | -1 | |
| `RATING_1_STAR` | -2.5 | |
| `ENDORSEMENT_ADDED` | +1.5 | Community member endorses worker |
| `ENDORSEMENT_INSTITUTIONAL` | +3 | Institution admin endorses worker |
| `ENDORSEMENT_REMOVED` | -1.5 | Endorsement revoked |
| `INCIDENT_RAISED` | -5 | Incident report filed against worker |
| `INCIDENT_RESOLVED_EXONERATED` | +3 | Investigation concluded, worker cleared |
| `INCIDENT_RESOLVED_PENALIZED` | -2 additional | Investigation confirmed misconduct |
| `INCIDENT_DISMISSED` | +1 | Report was unfounded |
| `INACTIVITY_PENALTY` | -0.5 | 90 days without deployment |
| `MANUAL_BONUS` | configurable | Admin manual positive adjustment |
| `MANUAL_PENALTY` | configurable | Admin manual negative adjustment |
| `SUSPENSION` | -20 | Account suspended |
| `REINSTATEMENT` | +10 | Suspension lifted |

---

## Trust Score Breakdown

The trust score is always presented with a breakdown, not as a black box:

```
Chukwuemeka Adeyemi — Trust Score: 78.5 (Grade: B+)

┌─────────────────────────────────────────────────┐
│  Score Breakdown                                │
├────────────────────┬────────────────────────────┤
│ Identity           │ +15.0  (Full verification) │
│ Deployments        │ +32.0  (23 completed jobs) │
│ Ratings            │ +28.5  (4.6 avg, 19 rated) │
│ Endorsements       │ +10.5  (5 endorsements)    │
│ Incident Penalties │  -0.0  (1 resolved clearly)│
│ Inactivity         │  -7.5  (no decay applied)  │
│                    │                            │
│ TOTAL              │  78.5 / 100                │
└────────────────────┴────────────────────────────┘

Trend: ↑ IMPROVING (up 4.5 in last 90 days)
Percentile: Top 28% of Electricians in registry
```

This transparency is a design principle. Workers should understand what builds or damages their score. Institutions should be able to explain a score to a worker. The score should never feel like an arbitrary judgment.

---

## Trust Tiers and What They Unlock

| Score Range | Grade | Access Level |
|------------|-------|-------------|
| 80–100 | A / A+ | High-trust deployments, VIP assignments, supervisor roles |
| 60–79 | B / B+ | Standard deployments, can be assigned independently |
| 50–59 | C | Basic assignments, must be supervised |
| 35–49 | D | Restricted — pending review or improvement |
| 0–34 | F | Cannot be assigned; requires remediation |

Institutions configure their own minimum trust score per service category (e.g., Security requires ≥70, General Cleaning requires ≥50).

---

## Community Endorsements

Endorsements are one of the most powerful trust signals because they require a human to put their reputation on the line.

### Endorsement Types

| Type | Weight | Who Can Give |
|------|--------|-------------|
| Institution endorsement | 3.0x | Institution admin/operator |
| Resident endorsement | 1.0x | Any verified resident |
| Peer endorsement | 0.5x | Another verified worker |
| Supervisor endorsement | 2.0x | Someone who directly managed the worker |

### Endorsement Accountability

- Endorsements are **signed by name** — anonymous endorsements have no weight
- If an endorsed worker causes a serious incident, the endorser is notified
- Institutions can set "endorsement liability" — endorsers carry partial accountability
- Institutional endorsers (admins) have higher weight because they have more to lose

### Endorsement Decay

By default, endorsements do not expire. Institutions can configure:
- Endorsement expiry (e.g., expires after 2 years if worker is inactive)
- Maximum active endorsements (prevent gaming through bulk endorsement)

---

## Incident Impact on Trust

An incident is not automatically a trust score penalty. The process matters:

```
Incident Filed
    ↓
Trust Score: -5 (incident_raised event) — immediate
    ↓
Investigation Period (configurable: 7–30 days)
    ↓
Resolution:
  EXONERATED    →  Trust Score: +3 (partial recovery)  [net: -2]
  PENALIZED     →  Trust Score: -2 additional          [net: -7]
  DISMISSED     →  Trust Score: +1 (score restored)    [net: -4 recovered]
```

This model:
- Discourages malicious incident reports (partial recovery when exonerated)
- Holds workers accountable for confirmed misconduct
- Provides due process before permanent score impact
- Keeps investigation records permanently in the worker's profile (not hidden)

---

## Portable Trust Credentials

Workers who maintain high trust scores across institutions can opt-in to a **TrustGrid Verified Badge** — a portable digital credential they can share with any institution.

```
TrustGrid Verified Badge
────────────────────────
Chukwuemeka Adeyemi
Electrician

✓ Identity Verified (NIN)
✓ 23 completed deployments
✓ 4.6 average rating
✓ 5 institutional endorsements
★ Grade: B+ (Good)

Valid through: May 2027
Issued by: TrustGrid
Verify at: trust.trustgrid.io/verify/XYZ123
```

The badge is QR-code linked to a verification page. Any institution can scan the QR and see the worker's portable trust summary without needing access to TrustGrid as an institution themselves.

This creates a **trust passport** — a worker's portable professional reputation that moves with them across communities.

---

## Anti-Gaming Design

TrustGrid's trust model is designed to resist gaming:

| Gaming Attempt | Defense |
|----------------|---------|
| Create fake accounts, endorse yourself | Cross-institution deduplication on NIN/BVN; endorsements require identity verification |
| Flood platform with fake 5-star reviews | Reviews tied to verified completed assignments — no assignment, no review |
| Dispute every incident to clear record | Exoneration gives only partial recovery (-5 +3 = net -2); pattern of incidents still visible |
| Pay for bulk endorsements | Endorsers are named and accountable; unusual endorsement patterns flagged |
| Abandon assignments, claim completion | Check-in/check-out system with supervisor confirmation |
| New account after bad history | NIN/BVN deduplication prevents new accounts with same identity |
