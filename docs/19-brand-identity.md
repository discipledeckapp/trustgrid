# TrustGrid — Brand Identity System

**Version:** 2.0  
**Status:** Recommended for Implementation  
**Author:** Brand Strategy  

---

## 1. Brand Strategy

### Brand Essence
TrustGrid is **the operating system for trusted communities**.

Not a security product. Not an HR platform. Not a compliance tool.

TrustGrid is the invisible infrastructure that makes communities work — the layer of trust that lets institutions deploy the right people, at the right time, with full accountability.

### Brand Positioning Statement
> For communities, institutions, and smart-city operators who need to govern trusted service workers and organisations at scale, TrustGrid is the community workforce operating system that turns scattered WhatsApp recommendations into permanent, algorithmic, accountable trust — enabling institutions to deploy with confidence and workers to build reputations that move with them.

### Brand Personality

| Dimension | TrustGrid Is | TrustGrid Is NOT |
|-----------|-------------|-----------------|
| Voice | Confident, warm, clear | Cold, technical, corporate |
| Tone | Human, direct, optimistic | Bureaucratic, passive, guarded |
| Feel | LinkedIn × Airbnb × Stripe | Oracle × SAP × compliance SaaS |
| Energy | Purposeful, alive, credible | Sterile, generic, forgettable |

### What TrustGrid sounds like
- "Chukwuemeka has done 47 jobs. 5 people vouch for him. This is his permanent record."
- "Your community, your standards."
- "Trust travels with you."
- "Verified by the community. Trusted by institutions."

### What TrustGrid does NOT sound like
- "Identity verification and workforce compliance solutions"
- "Enterprise-grade security infrastructure"
- "Multi-tenant SaaS platform with configurable modules"

---

## 2. Logo Strategy

### The Core Insight
The best logos encode meaning that cannot be unseen once discovered:
- FedEx → the arrow between E and x
- Amazon → the smile + A to Z delivery
- Pinterest → the P is a pin
- Notion → the N is made of blocks

TrustGrid should follow this principle: **the brand mark should live inside the wordmark**.

---

## 3. Logo Concept A — NETWORK G (Primary Recommendation)

### Why G?
- The "G" begins the most brand-distinctive word: **Grid**
- Grid → network → connections → community
- G is a visually powerful shape with natural tension between openness and structure
- A G reimagined as a network graph communicates everything TrustGrid is about

### The Design
The G is constructed entirely from **connected nodes** (small circles) joined by **bezier curves**.

- The outer arc of the G: 7 nodes connected by smooth curves
- The horizontal bar of the G: 3 nodes connected by a horizontal path
- The inner horizontal spur: continues as network connections INTO the G's counter space
- The counter space (the opening of the G): left deliberately open — representing **the accessible community, not a closed system**

The nodes at key junctions are slightly larger, suggesting **primary trust nodes** — institutions, verified workers, endorsers.

The connections between nodes carry slight variation in weight — thicker = stronger trust relationship.

### What it communicates
Reading the mark in 3 seconds:
1. **It's a G** → TrustGrid
2. **The G is a network** → community, connections, trust graph
3. **The nodes are people and institutions** → workforce ecosystem
4. **The opening of the G** → accessible, human, not a locked system

### Logo Mark SVG Specification

```
Network G — Construction Rules

CANVAS: 100×100 viewBox, 56px touch target minimum

OUTER ARC NODES (7 nodes, r=3px each):
  N1: (50, 8)     — top center
  N2: (76, 18)    — upper right
  N3: (88, 40)    — right mid-upper
  N4: (88, 62)    — right mid-lower
  N5: (76, 80)    — lower right
  N6: (50, 90)    — bottom center
  N7: (24, 80)    — lower left
  N8: (12, 62)    — left mid-lower
  N9: (12, 40)    — left mid-upper
  N10: (24, 18)   — upper left

INNER HORIZONTAL BAR NODES (3 nodes, r=3px):
  N11: (52, 50)   — entry point (left of bar)
  N12: (66, 50)   — mid bar
  N13: (80, 50)   — end of bar (right)

CONNECTION PATHS:
  Outer arc: N10 → N1 → N2 → N3 → N4 → N5 → N6 → N7 → N8 → N9
  (smooth cubic bezier following G arc)
  
  Top opening: N10 → [gap where G opens] → NOT connected to close
  (this is what makes the G, not a circle)
  
  Spur: N9 → N8 curve → N11 (connects arc to bar)
  
  Bar: N11 → N12 → N13 (horizontal)

STROKE: 2px
NODE FILL: same as stroke (filled circles)
NEGATIVE SPACE: the opening between N9/N10 defines the G

OPTIONAL: Add 2-3 subtle secondary connections within the counter space
showing a mini trust graph (small dashed lines between non-adjacent nodes)
to suggest depth of network connections
```

### Colour Application on Logo Mark

```
Option 1 — Gradient (preferred for digital)
  Fill: linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%)
  This gradient says: Indigo trust → Teal community

Option 2 — Solid (for single-colour contexts)
  Fill: #4F46E5 (Brand Indigo)

Option 3 — Reverse (on dark backgrounds)
  Fill: white
  Background: #4F46E5 or gradient

Option 4 — Monochrome
  Fill: #0F172A (Slate-950)
```

---

## 4. Logo Concept B — TRUST T (Secondary)

### The Design
The T is constructed as a shield + checkmark fusion where:
- The crossbar of the T becomes a widened shield crown
- The stem carries a subtle upward V notch (checkmark within the stem)
- The overall silhouette reads as T but implies "Trusted"

This is more conservative than Concept A but communicates trust directly.

**Weakness:** Risk of reading as a compliance/security product. Less distinctive.

---

## 5. Logo Concept C — TRUST DOT

### The Design
Focus on the lowercase "i" in TrustGrid.
- The dot above the "i" is replaced with a trust badge — a small filled circle with a tiny checkmark
- This dot can float slightly higher, creating visual delight
- The "i" stem and dot create a minimal trust signal icon

Works well as a favicon/app icon in isolation.

**Weakness:** Less ownable as a standalone mark without full wordmark context.

---

## 6. FINAL RECOMMENDATION

**Implement Concept A: Network G.**

Primary reasoning:
1. Most distinctive — no other workforce/trust platform uses a network-node letterform
2. Encodes the entire product story in one mark
3. Scales beautifully from 16px favicon to billboard
4. Does not read as security/compliance — reads as network/community
5. The "discovery" moment (realising the G is a trust graph) creates brand memory
6. Gradient execution positions it alongside Stripe, Linear, Notion

---

## 7. Wordmark

### Lettering
```
Font Base: Geist Sans Semibold (or Inter Semibold as fallback)
Letter-spacing: -0.02em (tight, confident)
Weight: 600
Case: Sentence case (TrustGrid — not TRUSTGRID, not trustgrid)
```

### Wordmark Lockups

```
Horizontal (primary):
  [Network G mark] TrustGrid

Stacked (secondary):
  [Network G mark]
  TrustGrid

Icon only (app/favicon):
  [Network G mark]
  
Wordmark only (text-only contexts):
  TrustGrid  (with first T slightly bolder)
```

### Safe Zone
Minimum clear space = height of the G mark on all sides.

---

## 8. Colour System

### Philosophy
Move away from **corporate navy** and generic SaaS blue.

TrustGrid's colour story:
- **Indigo** → depth, credibility, intelligence, gravity of trust
- **Teal/Cyan** → community, connections, human relationships, openness
- **Emerald** → verified, healthy, growing, safe
- **Amber** → pending, caution, attention needed (not alarm)
- **Rose** → incident, alert, serious concern
- **Slate** → neutral, professional, text, backgrounds

This is a **warm-cool split system** — Indigo (cool authority) + Teal (warm community).

---

### Primary Brand Palette

```
BRAND INDIGO (Primary)
  Name:    TrustGrid Indigo
  Hex:     #4F46E5
  HSL:     243° 86% 57%
  Use:     Primary actions, logo, brand moments
  Meaning: Authority, credibility, trust, intelligence

BRAND TEAL (Secondary)
  Name:    TrustGrid Teal
  Hex:     #0D9488
  HSL:     173° 86% 30%
  Use:     Community signals, endorsements, connections
  Meaning: Community, relationships, growth, human connection

GRADIENT (Logo + Hero)
  Start:   #4F46E5 (Brand Indigo)
  End:     #06B6D4 (Cyan)
  Direction: 135°
  Use:     Logo mark, hero sections, premium moments
```

---

### Semantic Trust Colour System

```
TRUST STATUS COLOURS

FULLY_VERIFIED (Biometric + ID):
  Colour:  #059669  (Emerald-600)
  Light:   #D1FAE5  (Emerald-100)
  Name:    "Fully Verified"
  Icon:    ShieldCheck filled

PARTIALLY_VERIFIED (ID only):
  Colour:  #0D9488  (Teal-600)
  Light:   #CCFBF1  (Teal-100)
  Name:    "ID Confirmed"
  Icon:    Shield half-filled

ENDORSED (Institutional):
  Colour:  #4F46E5  (Indigo-600)
  Light:   #E0E7FF  (Indigo-100)
  Name:    "Institution Endorsed"
  Icon:    Badge with star

COMMUNITY_APPROVED (Multiple endorsements):
  Colour:  #7C3AED  (Violet-600)
  Light:   #EDE9FE  (Violet-100)
  Name:    "Community Approved"
  Icon:    ThumbsUp group

PENDING:
  Colour:  #D97706  (Amber-600)
  Light:   #FEF3C7  (Amber-100)
  Name:    "Verification Pending"
  Icon:    Clock

UNVERIFIED:
  Colour:  #64748B  (Slate-500)
  Light:   #F1F5F9  (Slate-100)
  Name:    "Not Verified"
  Icon:    Shield outline

INCIDENT_OPEN:
  Colour:  #E11D48  (Rose-600)
  Light:   #FFE4E6  (Rose-100)
  Name:    "Open Incident"
  Icon:    AlertTriangle

EXPIRED:
  Colour:  #92400E  (Amber-800)
  Light:   #FEF9C3  (Yellow-100)
  Name:    "Credentials Expired"
  Icon:    ShieldX
```

---

### Trust Score Grade Colours

```
A+  90-100  Exceptional     #059669 → #10B981  (Emerald)
A   80-89   Excellent       #0D9488 → #14B8A6  (Teal)
B+  70-79   Good            #4F46E5 → #6366F1  (Indigo)
B   60-69   Satisfactory    #7C3AED → #8B5CF6  (Violet)
C   50-59   Fair            #D97706 → #F59E0B  (Amber)
D   35-49   Below Average   #EA580C → #F97316  (Orange)
F   0-34    Poor            #DC2626 → #EF4444  (Red)

Visual rule: A+/A = cool greens (healthy)
             B+/B = indigo/violet (credible but developing)
             C = amber (caution)
             D/F = orange/red (concern)
```

---

### Full Colour Token Map

```css
:root {
  /* Brand */
  --brand-indigo:     #4F46E5;
  --brand-teal:       #0D9488;
  --brand-gradient:   linear-gradient(135deg, #4F46E5 0%, #06B6D4 100%);

  /* Backgrounds */
  --bg-canvas:        #F8FAFC;  /* Almost white, warm */
  --bg-surface:       #FFFFFF;
  --bg-elevated:      #F1F5F9;
  --bg-overlay:       rgba(15, 23, 42, 0.5);

  /* Text */
  --text-primary:     #0F172A;  /* Slate-950 */
  --text-secondary:   #334155;  /* Slate-700 */
  --text-tertiary:    #64748B;  /* Slate-500 */
  --text-muted:       #94A3B8;  /* Slate-400 */
  --text-inverse:     #FFFFFF;

  /* Borders */
  --border-subtle:    #E2E8F0;  /* Slate-200 */
  --border-default:   #CBD5E1;  /* Slate-300 */
  --border-strong:    #94A3B8;  /* Slate-400 */

  /* Trust semantic */
  --trust-verified:       #059669;
  --trust-verified-bg:    #D1FAE5;
  --trust-partial:        #0D9488;
  --trust-partial-bg:     #CCFBF1;
  --trust-endorsed:       #4F46E5;
  --trust-endorsed-bg:    #E0E7FF;
  --trust-pending:        #D97706;
  --trust-pending-bg:     #FEF3C7;
  --trust-unverified:     #64748B;
  --trust-unverified-bg:  #F1F5F9;
  --trust-incident:       #E11D48;
  --trust-incident-bg:    #FFE4E6;
}
```

---

## 9. Typography

### Font Stack

```
DISPLAY / HEADINGS
  Font:    "Plus Jakarta Sans" (preferred) or "Geist Sans"
  Weights: 700 (Bold), 800 (ExtraBold)
  Use:     Hero headlines, trust scores, impact numbers
  Why:     More personality than Inter for headings.
           Modern, geometric, confident. Used by premium startups.

BODY / UI
  Font:    "Inter"
  Weights: 400 (Regular), 500 (Medium), 600 (SemiBold)
  Use:     All body text, labels, UI components
  Why:     Gold standard for screen readability.

MONOSPACE (IDs, scores, codes)
  Font:    "JetBrains Mono" or "Geist Mono"
  Weights: 400, 500
  Use:     Trust scores as numbers, worker IDs, verification numbers
  Why:     Adds credibility and precision to trust data
```

### Type Scale

```
DISPLAY    48px / 52px lh / -0.03em  (Hero stats, trust scores)
H1         32px / 40px lh / -0.02em  (Page titles)
H2         24px / 32px lh / -0.01em  (Section titles)
H3         18px / 28px lh / -0.01em  (Card titles)
H4         15px / 24px lh / 0em      (Sub-section headers)
BODY-LG    16px / 28px lh / 0em      (Primary text)
BODY       14px / 22px lh / 0em      (Standard text)
CAPTION    12px / 18px lh / 0.01em   (Labels, metadata)
MICRO      11px / 16px lh / 0.02em   (Tags, badges)

NUMERIC (for trust scores)
  Size: 48-72px
  Font: JetBrains Mono 700 or Inter Black
  Color: Grade-appropriate semantic colour
```

---

## 10. Design System Principles

### Layout
- **Content max-width**: 1200px
- **Page padding**: 24px mobile / 40px desktop
- **Section gap**: 32px
- **Card gap**: 16px
- **Grid**: 12-column, 24px gutter

### Spacing Scale (4px base)
```
2px   xs    — micro spacing, border adjustments
4px   sm    — tight spacing within components
8px   md    — standard padding within elements
12px  lg    — comfortable padding
16px  xl    — section padding
24px  2xl   — card padding
32px  3xl   — section gaps
48px  4xl   — major section breaks
64px  5xl   — hero spacing
```

### Corner Radius
```
4px   — tags, badges, chips
8px   — inputs, small buttons
12px  — buttons, small cards
16px  — cards, modals
20px  — profile cards
24px  — hero cards, profile sections
9999px — pills, avatars, score rings
```

### Shadow System
```
sm:  0 1px 3px rgba(0,0,0,0.06)    — subtle lift
md:  0 4px 12px rgba(0,0,0,0.08)   — card hover
lg:  0 12px 32px rgba(0,0,0,0.12)  — modal, overlay
xl:  0 24px 48px rgba(0,0,0,0.16)  — hero sections
brand: 0 8px 24px rgba(79,70,229,0.18) — brand-coloured shadow
```

---

## 11. Trust Visualisation Patterns

### Pattern 1: Trust Ring (Avatar)
Wrap profile avatars with a coloured ring indicating trust grade:
```
Ring thickness: 3px (small), 4px (medium), 5px (large)
Ring colour: Grade-appropriate (A+ = emerald, B = indigo, etc.)
Ring gap: 2px between avatar edge and ring
Animation: Subtle pulse for "Available" status
```

### Pattern 2: Trust Score Gauge (Circular)
Already implemented. Enhancement:
- Add grade-to-grade sector markers at 35, 50, 60, 70, 80, 90
- Gradient fill (grade start → grade end colour)
- Number in centre uses JetBrains Mono
- Add "vs. community" percentile below score

### Pattern 3: Trust Timeline
Horizontal timeline of trust events:
- Icons at each event node
- Colour coding by event type (green for positive, red for incident)
- Hover to expand event detail
- Group by month

### Pattern 4: Trust Breakdown Bar (Horizontal)
Already in use. Enhancement:
- Animate bars in on scroll/load
- Show percentage labels on each bar
- Color-code each dimension (emerald = verification, blue = deployments, etc.)

### Pattern 5: Trust Passport Card
The flagship experience (see Section 13).

### Pattern 6: Endorsement Faces
Stack avatar faces of endorsers (like LinkedIn's "Seen by"):
```
Design: Overlapping circles (each -8px offset from previous)
Max display: 5 faces + "+N more" overflow indicator
Size: 28px × 28px circles, 2px white border
Order: Institutional endorsers first (weighted)
```

### Pattern 7: Trust Network Mini-Map
Small graph visualization in worker profile sidebar:
- Central node = worker
- Connected nodes = institutions served + endorsers
- Edge thickness = relationship strength
- Optional, power-user feature

---

## 12. Iconography Strategy

### Icon Library
Use **Lucide Icons** as the base (already implemented).

Custom icon additions for TrustGrid-specific concepts:

```
TRUST PASSPORT     — identity card with shield
TRUST RING         — circular badge with checkmark
ENDORSEMENT        — hands/thumbs with star
NETWORK NODE       — interconnected dots
COMMUNITY          — three figures with connection line
DEPLOYMENT         — figure with checkmark moving forward
WORKFORCE          — group with gear
SMART CITY         — building with network signals
INSTITUTION STAMP  — official seal
TRUST TIMELINE     — horizontal path with milestones
```

### Icon Sizing
```
12px  — inline text icons
16px  — standard UI icons
20px  — feature icons
24px  — section icons
32px  — empty state icons
48px  — illustration icons
64px  — hero icons
```

---

## 13. Trust Passport — Flagship Screen Specification

### Purpose
The **Community Trust Passport** is the centrepiece of TrustGrid's product story.
It should be the most memorable screen in the demo. It communicates in under 3 seconds:
- Who this person is
- How trusted they are
- Who vouches for them
- What they've done
- Their permanent institutional record

### Visual Layout

```
┌──────────────────────────────────────────────────────┐
│                                                      │
│  PASSPORT HEADER (gradient: indigo → teal)           │
│  ┌───────────┐  Name: Chukwuemeka Adeyemi            │
│  │  [AVATAR] │  Skill: Electrician                  │
│  │  with     │  Member since: June 2024             │
│  │  trust    │                                      │
│  │  RING     │  [VERIFIED] [ID CONFIRMED] [3yr]     │
│  └───────────┘                                      │
│                                                      │
│  TRUST SCORE SECTION                                 │
│  ┌──────────┐  ┌───────────────────────────────┐    │
│  │  GAUGE   │  │ BREAKDOWN                     │    │
│  │  91.5    │  │ ■■■■■■■■■■ Identity    +15   │    │
│  │   A+     │  │ ■■■■■■■■■■■■■ Jobs      +32   │    │
│  │ Trending │  │ ■■■■■■■■■■ Ratings    +28   │    │
│  │    ↑     │  │ ■■■■■■■ Endorsements  +10   │    │
│  └──────────┘  └───────────────────────────────┘    │
│                                                      │
│  VERIFICATION BADGES                                 │
│  [●NIN ✓] [●BVN ✓] [●Face ✓] [●COREN ✓]           │
│                                                      │
│  PEOPLE WHO VOUCH                                    │
│  [Face][Face][Face][Face][Face] + 7 more             │
│  "Deacon Emeka, Estate Manager, and 11 others"       │
│                                                      │
│  INSTITUTIONS SERVED                                 │
│  [RCCG] [RC Estate] [School] 3 institutions         │
│                                                      │
│  COMMUNITY RECORD                                    │
│  47 jobs completed · 4.8⭐ avg · 0 open incidents   │
│  Top 5% of Electricians in this registry            │
│                                                      │
│  RECENT DEPLOYMENTS (mini timeline)                  │
│  May ● — Convention Setup, 3 days, ⭐⭐⭐⭐⭐          │
│  Apr ● — Estate Maintenance, 1 day, ⭐⭐⭐⭐          │
│                                                      │
│  [SHARE PASSPORT]  [ASSIGN TO REQUEST]              │
│                                                      │
└──────────────────────────────────────────────────────┘
```

### Shareable Passport
The passport should be shareable as:
1. A URL: `trust.trustgrid.ng/passport/[workerID]`
2. A QR code that resolves to the public passport URL
3. A PNG card export (for WhatsApp sharing)

---

## 14. UI Modernization Recommendations

### Dashboard
- Add greeting with contextual intelligence (time-based, action-triggered)
- Metric cards: move to stat cards with progress indicators vs. prior month
- Add "Community Health Score" — aggregate trust metric for the institution
- Trust leaderboard with trust rings on avatars

### Workforce Registry
- Add trust rings to all avatars
- Trust score as colour-coded pill (grade letter + number)
- "Verified" shield overlay on avatar (bottom-right) 
- Add availability pulse animation

### Worker Profile → Trust Passport
- Redesign as the Trust Passport (see Section 13)
- Full-bleed gradient header
- Circular trust gauge with animated fill
- Endorsement faces in stacked overlap
- Deployment timeline

### Applications Review
- Card-based with trust pre-score indicator
- "Potential Trust Score" estimate based on submitted info
- Application completeness progress bar

### Service Requests
- Visual match score on each matched worker
- "Best Match" badge on top-ranked worker
- Animated assignment confirmation ("Workers have been notified")

### Analytics
- Trust distribution as a beautiful histogram
- Trust over time as an area chart
- Incident heatmap by category

---

## 15. Implementation Priority

| Priority | Item | Impact |
|----------|------|--------|
| P0 | Network G logo mark (SVG) | Brand recognition |
| P0 | Trust Passport screen | Demo centrepiece |
| P0 | New colour tokens (Indigo + Teal) | Entire product feel |
| P1 | Trust rings on avatars | Immediate visual upgrade |
| P1 | Grade-based colour system | Trust readability |
| P1 | Plus Jakarta Sans headings | Premium feel |
| P2 | Endorsement face stacks | Social proof visibility |
| P2 | Credential badges | Professional credibility |
| P2 | Trust timeline component | History storytelling |
| P3 | Shareable passport URL | Product virality |
| P3 | Network G animation (CSS) | Delight |
| P3 | QR code generation | Distribution |
