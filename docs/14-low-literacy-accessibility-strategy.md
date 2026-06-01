# TrustGrid — Low-Literacy Accessibility Strategy

**Version:** 1.0  

---

## The Reality

TrustGrid serves two user types with very different profiles:

**Institution Users (Operators)**
- Educated, likely comfortable with smartphones
- Use admin dashboard primarily on web
- Familiar with productivity software

**Workers (Service Providers)**
- Highly variable education levels
- Many are first-generation smartphone users
- May have low digital literacy
- Primary device: entry-level Android phone
- May prefer Pidgin English, Yoruba, Igbo, Hausa
- Heavy WhatsApp users
- Some cannot read fluently

**The accessibility strategy is primarily for workers, not operators.**

If workers cannot use TrustGrid, the worker registry cannot grow. The platform fails.

---

## Design Principles for Low-Literacy Users

### 1. Show, Don't Tell

Every status should have a visual representation before text:
- Trust score: color-coded gauge (green/yellow/red), not just a number
- Assignment status: large icon (calendar, checkmark, clock)
- Verification status: badge color (green shield = verified, grey = pending)
- Incident status: red warning triangle, not "UNDER_INVESTIGATION"

### 2. Progressive Disclosure

Show only what the user needs right now. Not all features at once.

```
Worker Home Screen:
  [Large Trust Score Gauge: 78.5 - Green]
  [My Skills: ⚡ Electrician]
  [Status: ✓ Available]
  
  [BIG BUTTON: My Assignments]
  [BIG BUTTON: My Profile]
```

Advanced features (view endorsement details, score breakdown) are one tap deeper.

### 3. Voice Assistance

All primary actions support voice input:
- "Accept assignment" → tap mic → speak "yes" → assignment accepted
- "Report a problem" → tap mic → describe problem → form pre-filled
- Screen reader compatible (Flutter's Semantics API)

### 4. Status Confirmation (Audio + Visual)

After every action:
- Sound cue (positive or negative tone)
- Large visual confirmation (green tick / red X)
- Simple text: "Done! You accepted the job."
- No jargon: not "Assignment status updated to ACCEPTED"

### 5. Minimal Text Input

Reduce typing wherever possible:
- Multiple choice instead of free text
- Pre-populated fields from registered profile
- Photo uploads instead of typed descriptions
- Voice input as alternative to typing

---

## Worker App Screen Designs

### Home Screen

```
┌─────────────────────────────────┐
│   Hi, Chukwuemeka 👋            │
│                                 │
│   ┌─────────────────────────┐   │
│   │  TRUST SCORE            │   │
│   │   ████████░░   78 / 100 │   │
│   │   🟢  B+ Good           │   │
│   └─────────────────────────┘   │
│                                 │
│   ┌──────────────────────────┐  │
│   │ 📋  NEW JOB AVAILABLE    │  │
│   │ RCCG Convention          │  │
│   │ May 15–18 • Electrician  │  │
│   │                          │  │
│   │  [SEE JOB]               │  │
│   └──────────────────────────┘  │
│                                 │
│  [MY JOBS]    [MY PROFILE]      │
│                                 │
│  [NEED HELP?]                   │
└─────────────────────────────────┘
```

### Job Details Screen

```
┌─────────────────────────────────┐
│  ← Back                         │
│                                 │
│  RCCG CONVENTION 2026           │
│                                 │
│  📅 May 15 – May 18             │
│  📍 Redemption Camp             │
│  💰 ₦8,000 / day                │
│                                 │
│  ─────────────────────          │
│  What you will do:              │
│  ⚡ Electrical setup and        │
│     maintenance                 │
│                                 │
│  Who to call:                   │
│  👤 Deacon Emeka (Supervisor)  │
│  📞 0801 234 5678               │
│  ─────────────────────          │
│                                 │
│  [   ✓  I ACCEPT THIS JOB  ]   │
│                                 │
│  [      ✗  I CANNOT DO IT  ]   │
└─────────────────────────────────┘
```

### Trust Score Screen (Simplified)

```
┌─────────────────────────────────┐
│  MY REPUTATION                  │
│                                 │
│       ████████░░                │
│          78 / 100               │
│                                 │
│  What makes up your score:      │
│                                 │
│  ✓ ID Verified         +15      │
│  ✓ 23 jobs done        +32      │
│  ⭐ 4.6 avg rating     +28      │
│  👍 5 people trust you  +10     │
│  ⚠ 1 complaint (closed) 0      │
│                                 │
│  To improve your score:         │
│  • Complete more jobs           │
│  • Ask clients for reviews      │
│                                 │
└─────────────────────────────────┘
```

---

## Language Support

### MVP Languages
- English (default)
- Nigerian Pidgin English (for worker-facing screens)

### Phase 2 Languages
- Yoruba
- Igbo
- Hausa

### Phase 3 Languages
- Ghanaian Pidgin (for Ghana deployment)
- Swahili (for Kenya deployment)
- French (for Côte d'Ivoire deployment)

**Implementation:** Flutter's `flutter_localizations` + `intl` package with ARB files per locale. UI strings externalized from day one — no hardcoded English strings in widgets.

---

## Agent-Assisted Mode

Not every worker will self-register. Many workers will be onboarded by:
- An estate community officer
- A church coordinator
- A facility management agent
- A TrustGrid field agent

**Agent Mode:**
1. Agent logs in with their account (INSTITUTION_OPERATOR role)
2. Agent switches to "Worker Onboarding Mode"
3. Agent fills the form on behalf of the worker
4. Worker confirms by looking at their own phone (simple confirmation screen)
5. Worker profile created — worker receives SMS with app download link + PIN

This enables onboarding for workers who:
- Don't have smartphones yet
- Are uncomfortable with form filling
- Are being onboarded in bulk at an event

---

## WhatsApp Integration Strategy

WhatsApp is the most used communication channel for the target worker demographic in Nigeria. TrustGrid integrates with WhatsApp as a first-class citizen.

### WhatsApp Bot Capabilities (Phase 2)

| Command | Response |
|---------|---------|
| "My score" | Returns trust score and grade with emoji |
| "My jobs" | Lists active and upcoming assignments |
| "Accept [job ID]" | Accepts a pending assignment |
| "Decline [job ID]" | Declines with reason |
| "Help" | Returns support contact and command list |
| "Register" | Sends registration link |

**WhatsApp notifications (automatic):**
- New assignment available
- Assignment accepted confirmation
- Performance review received
- Trust score changed significantly (+5 or -5)
- Emergency mobilization request

### WhatsApp Business API Integration

```
Architecture:
Worker → WhatsApp → Twilio/Meta Business API webhook → TrustGrid bot handler
TrustGrid → Twilio/Meta Business API → Worker's WhatsApp
```

The bot uses a simple keyword parser (no AI needed for MVP commands) with a fallback to human support for unrecognized messages.

---

## Offline Capability

Many workers operate in areas with intermittent connectivity.

**Flutter Offline Support:**
- Cached worker profile (local SQLite via `sqflite`)
- Pending actions queue (accept/decline stored locally, synced when online)
- Last-known assignment details available offline
- Trust score cached for up to 24 hours
- "Offline mode" banner shown when disconnected

---

## Low-End Device Optimization

Target devices:
- Tecno Spark 10 (1.5 GB RAM, Android 12)
- Infinix Note 12 (2 GB RAM)
- Samsung Galaxy A04 (2 GB RAM)

**Optimizations:**
- Image lazy loading + compression (worker photos < 200KB)
- Minimal animations (respect `reduceMotion` preference)
- APK size target < 25 MB
- Offline-first architecture reduces network dependency
- No video content in MVP worker app
- Paginated lists (no infinite scroll that loads all workers)

---

## Accessibility Checklist

| Requirement | Status |
|-------------|--------|
| Screen reader support (TalkBack/VoiceOver) | ✓ Flutter Semantics |
| Large text mode support | ✓ Responsive layout |
| Color contrast ratio ≥ 4.5:1 | ✓ Design system |
| Touch target size ≥ 48×48dp | ✓ All primary buttons |
| Voice input alternative | ✓ Flutter speech_to_text |
| Multi-language architecture | ✓ flutter_localizations |
| Low-bandwidth mode | ✓ Offline-first |
| Agent-assisted onboarding | ✓ Operator mode |

---

## Field Deployment Strategy

When TrustGrid launches in Redemption City:

**Week 1:** Train 10 community officers as TrustGrid field agents  
**Week 2:** Field agents go door-to-door in worker communities, onboard workers face-to-face  
**Week 3:** WhatsApp group messages to existing worker networks: "We are now on TrustGrid — register to get more jobs"  
**Week 4:** Incentive program — first 100 verified workers get ₦5,000 airtime credit  

This field-first approach bypasses the cold-start problem and ensures the registry has critical mass before institutions begin relying on it.
