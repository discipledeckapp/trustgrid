# TrustGrid — Investor Perspective

**Version:** 1.0  
**Format:** Investment thesis Q&A  

---

## Why Now?

**Three forces converging in 2026:**

### 1. Smart City Infrastructure Investment Surge
Nigeria's government and private sector are investing billions in smart city projects — Redemption City, Eko Atlantic, Apapa Hub, Abuja techno-corridors. These cities need human service infrastructure, not just physical and digital infrastructure. TrustGrid fills the human layer.

### 2. The Post-COVID Gig Economy Reality
The informal gig economy in Nigeria grew 340% between 2019 and 2024. An estimated 35 million Nigerians are now engaged in informal service work. This workforce needs a trust infrastructure that traditional employment platforms don't provide. The demand exists. The infrastructure doesn't. Not yet.

### 3. Smartphone Penetration Reaching Tipping Point
Nigeria's smartphone penetration crossed 40% in 2024 and is projected to reach 65% by 2028. For the first time, the informal worker demographic can be reached via mobile. The platform timing is exactly right — not too early (workers don't have phones), not too late (the market is already taken).

**The combination:** A growing formal smart city sector that needs governance infrastructure + a growing informal workforce that needs a trust credential + the mobile penetration that makes the solution possible. **This combination didn't exist 5 years ago. It exists now.**

---

## Why This Team?

**Oluwaseyi Adelaju — Product Architect & CTO**

The most important thing about this team is not the pedigree — it's the insight.

We identified that the real problem is not **discovery** but **governance**. This repositioning is everything. Building a marketplace is a crowded race. Building governance infrastructure is building a category.

**What makes this team right for this problem:**

1. **Systems thinking at the right altitude** — TrustGrid is designed for a city of one million people, not just a pilot. The architecture (multi-tenant, adapter-based, configuration-driven) reflects that ambition from day one.

2. **RCCG ecosystem access** — Distribution is the hardest problem in African institutional SaaS. This team has access to the best institutional distribution network in Nigeria: 5M+ RCCG members, 800+ churches, and a flagship project (Redemption City) that has never been more relevant.

3. **Deep context on the real users** — The workers who will use this platform, the estate managers who will pay for it, the church coordinators who will run it. This is lived context, not market research.

4. **Execution pace** — TrustGrid went from concept to full product documentation and working MVP in a hackathon window. This is the execution profile of a team that will ship.

---

## Why This Market?

### The Numbers

- **Nigeria's informal services workforce:** 35 million workers
- **Formal institutions engaging informal workers:** 500,000+ (estates, churches, schools, facilities, events)
- **Current annual spend on workforce management (informal):** Estimated ₦800B+ (agency fees, manual coordination, incident costs, re-hiring costs)
- **SaaS penetration target (3 years):** 0.1% = 500 institutions = ₦960M ARR
- **10-year vision:** 5% of West African institutions = ₦20B ARR potential

### Why Institutions Will Pay

The unit economics are brutal without TrustGrid:

| Without TrustGrid | Cost |
|------------------|------|
| One security incident from unverified worker | ₦100K–₦5M |
| Agency fees for 500-person convention | ₦1.1M |
| Staff time on manual worker coordination (annual) | ₦2M–₦8M |
| Rehiring cycle when coordinator changes | ₦500K lost in institutional memory |

| With TrustGrid (Growth tier) | Cost |
|-----------------------------|------|
| Annual subscription | ₦459,000 |
| Convention staffing (500 workers) | ₦400,000 |
| **Total cost** | **₦859,000** |
| **Savings** | **₦2M–₦14M+/year** |

**This is not a discretionary spend. This is insurance against a systemic operational risk that institutions already experience.**

---

## Why Will This Scale?

### Network Effects (Two Kinds)

**Supply-side network effect:**  
More workers join TrustGrid → each worker's trust profile becomes more valuable → institutions trust the registry more → more institutions join → more workers want to join.

**Cross-institution data effect:**  
A worker's trust data from Institution A is visible (with consent) to Institution B. The more institutions use TrustGrid, the more trust data a worker accumulates. The richer the data, the better the platform's matching and governance. Data compounds.

### RCCG as Distribution Flywheel

RCCG's organizational structure is hierarchical and disciplined:
- National mandate → Province coordinators → District coordinators → Local church pastors
- One decision at the national level propagates to 800+ churches within 6 months
- TrustGrid is seeking a national endorsement, not 800 individual sales

**This is not a sales channel. This is an institutional distribution mechanism that no competitor can replicate.**

### Configuration Enables Vertical Expansion

TrustGrid's configuration-driven architecture means entering a new vertical (hospitals, schools, NGOs) requires no new code — only a new configuration bundle and sales motion. This dramatically lowers the cost of vertical expansion.

---

## Why Won't WhatsApp Win?

This is the most important competitive question to answer cleanly.

**WhatsApp cannot do what TrustGrid does because WhatsApp is a communication platform, not a governance platform.**

| Capability | WhatsApp | TrustGrid |
|-----------|---------|-----------|
| Persistent worker registry | ✗ | ✓ |
| Identity verification | ✗ | ✓ |
| Trust score computation | ✗ | ✓ |
| Multi-worker assignment | ✗ | ✓ |
| Incident investigation | ✗ | ✓ |
| Performance tracking | ✗ | ✓ |
| Procurement governance | ✗ | ✓ |
| Compliance reporting | ✗ | ✓ |

WhatsApp adding these features would require Meta to build an enterprise SaaS product for African institutions. That is not their business model, not their market focus, and not aligned with their product philosophy.

**Furthermore:** TrustGrid integrates WhatsApp as a notification layer. Workers receive TrustGrid notifications via WhatsApp. This means WhatsApp's ubiquity is an advantage for TrustGrid, not a threat.

---

## What Are the Biggest Risks?

### Risk 1: Worker Adoption
**Risk:** Workers resist digital onboarding. The registry stays empty. Institutions don't see value.  
**Mitigation:**  
- Agent-assisted onboarding removes the self-registration barrier
- RCCG field network can onboard 1,000 workers in a single weekend
- WhatsApp integration makes the platform familiar from day one
- First 100 verified workers receive ₦5,000 airtime credit
- Institutions that mandate TrustGrid create the pull — workers register to access work

### Risk 2: NIN API Access
**Risk:** NIMC's NIN verification API is rate-limited, unstable, or expensive.  
**Mitigation:**  
- MVP uses mock adapter (demo works regardless)
- Multiple licensed resellers of NIN verification in Nigeria (Prembly, Youverify, IdentityPass)
- Manual verification fallback always available
- Adapter architecture means switching providers requires changing one class

### Risk 3: Institutional Sales Cycles
**Risk:** Institutions take 6–12 months to sign contracts. Revenue lags.  
**Mitigation:**  
- Month-to-month pricing (no long contract required to start)
- Free 3-month pilot lowers the commitment threshold
- RCCG mandate shortens sales cycles from months to weeks for the church network

### Risk 4: Data Privacy and NDPR Compliance
**Risk:** Storing NIN numbers, BVN, and worker biometric data creates regulatory and reputational risk.  
**Mitigation:**  
- Field-level encryption for all PII data from day one
- Data retention controls (workers can request deletion per NDPR)
- Legal counsel engaged for NDPR compliance framework
- Insurance for data breach liability in Year 2

### Risk 5: Competitor Entry
**Risk:** A well-funded Nigerian startup copies the model after we demonstrate product-market fit.  
**Mitigation:**  
- First-mover in governance infrastructure — category creation advantage
- RCCG exclusive relationship creates a 3-year distribution moat
- Trust data takes years to accumulate — latecomers face a data gap
- Configuration depth and adapter architecture creates technical moat

---

## The Investment Case in Three Points

**1. Category creation opportunity.**  
TrustGrid is building a new software category: Community Workforce Governance. The first company to own this category in Africa will define the standards, the pricing, and the trust model that every institution adopts. LinkedIn did this for professional identity. TrustGrid does it for community workforce trust.

**2. Unfair distribution advantage.**  
The RCCG network is the best institutional distribution channel in sub-Saharan Africa for this specific product. 5 million members, 800+ institutions, a flagship smart city project. This access is not replicable by a competitor. It is the starting position that makes the go-to-market not just viable, but fast.

**3. Compounding data moat.**  
Every worker deployment, every rating, every endorsement makes TrustGrid more valuable. The trust data is not interoperable — it lives in TrustGrid. Switching costs for institutions grow linearly with the size of their workforce registry. By Year 3, a 500-institution platform with 50,000 workers has a trust dataset that cannot be rebuilt. That is a durable moat.

---

## Ask

**Hackathon Stage:**
- Stage 2 advancement for 60-day build sprint
- Pilot partnership with Redemption City management

**Seed Round (₦300M / ~$180K USD):**

| Use | Allocation |
|-----|-----------|
| Product engineering (backend, frontend) | 40% |
| Go-to-market (RCCG pilot, estate sales) | 25% |
| Verification API integrations (NIN, BVN) | 10% |
| Operations & legal (NDPR, incorporation) | 15% |
| Working capital buffer | 10% |

**Projected milestones post-seed:**
- Month 3: 10 pilot institutions live, 500 workers registered
- Month 6: 30 institutions, 2,000 workers, ₦5M MRR
- Month 12: 80 institutions, 8,000 workers, ₦12M MRR
- Month 18: Series A ready (100+ institutions, predictable revenue, West Africa expansion)
