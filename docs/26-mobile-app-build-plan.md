# TrustGrid Mobile App Build Plan

**Version:** 1.0  
**Date:** 2 June 2026  
**Status:** Proposed implementation plan  
**Target:** One production Flutter app for Android and iOS with role-aware workspaces, full functional parity with the TrustGrid web applications, and Sign in with Apple support on iOS

---

## 1. Executive Decision

Build **one TrustGrid mobile app** for all user types.

Ship the app for both **Android** and **iOS** from the same Flutter codebase. The Android release must support **Sign in with Google**, and the iOS release must support **Sign in with Apple**, in addition to phone-number and email login.

The app must adapt after login based on:

1. The selected institution or community
2. The institution's brand configuration
3. The authenticated user's roles and permissions
4. The active workspace selected by the user
5. Device size and capability

A user may be a resident, volunteer, worker, organisation administrator, or institution operator at the same time. Multiple consumer apps would fragment identity, complicate support, and create duplicate release pipelines.

The single app will contain distinct role-aware workspaces:

| Workspace | Primary users | Purpose |
|---|---|---|
| My Trust | Members, residents, workers, volunteers | Passport, credentials, opportunities, assignments, profile |
| Community Operations | Institution operators and admins | Workforce, volunteers, organisations, requests, incidents, gate operations |
| Organisation | Organisation admins | Company profile, branches, workers, documents, assignments |
| Platform Admin | Platform admins only | Institutions, passports, workers, organisations, catalog, applications, settings |

Large enterprise customers may later receive a separately published branded binary. That binary should use the same codebase, feature flags, API, and design-token system. It is packaging, not a separate product.

---

## 2. Definition of Full Feature Parity

Full parity does **not** mean copying desktop pages onto a small screen.

It means:

- Every action available on the tenant web dashboard has a usable mobile flow.
- Every platform-admin action available on the super-admin console has a permission-gated mobile flow.
- Android and iOS releases provide the same TrustGrid feature set unless a capability is inherently platform-specific.
- The Android login screen supports Sign in with Google, and the iOS login screen supports Sign in with Apple. Phone-number and email login remain available on both platforms.
- Mobile and web display the same institution branding, terminology, semantic statuses, and trust model.
- A user can begin a workflow on web and finish it on mobile without data loss or conflicting state.
- Mobile-specific capabilities such as camera scanning, biometric unlock, push notifications, photo capture, and offline gate verification improve the experience where appropriate.

Desktop remains the more efficient surface for bulk imports, long reports, configuration-heavy work, and large datasets. Mobile parity means these capabilities remain available, not that mobile must become the preferred tool for every task.

---

## 3. Current State Assessment

The existing Flutter application under `frontend/` is a useful scaffold, not a complete mobile product.

### Already Present

- Flutter application shell
- Riverpod state management
- `go_router` routing
- Dio API client with JWT attachment and token refresh
- Secure token storage
- Community selection by slug
- Community brand fetch groundwork
- Deep-link route placeholders for `/join/:slug`
- Dynamic community primary and accent colours
- Login with phone number or email
- Worker registry screens
- Worker profile and endorsement flow
- Service-request list, creation, matching, and assignment
- Incident list and reporting
- Institution dashboard and analytics
- Basic worker home and assignments screens

### Material Gaps

- The worker home and assignment screens contain demo data instead of production API state.
- The app has no centralized authenticated-user session model or complete permission engine.
- Routing is split into a basic operator shell and worker shell; it does not support users with multiple roles.
- Mobile does not yet cover passports, QR verification, gate check-in, opportunities, onboarding, volunteers, organisations, catalog, billing, blacklist, residents, profile settings, hierarchy, authority, or platform admin.
- The community brand cache key exists, but the downloaded brand JSON is not persisted for instant branded startup.
- The brand provider calls `/institutions/brand`, while the backend controller currently exposes `/institution/brand`. Resolve this route mismatch before relying on white-label startup.
- API defaults are inconsistent: the general API client defaults to local `http://localhost:3000/api/v1`, while the brand provider defaults to the Render deployment URL. Use one environment configuration source.
- Login token storage requires `institutionId`, but a platform-admin account may not belong to an institution. Make tenant context optional and resolve it by workspace.
- Deep-link package setup is incomplete: the package is imported but native URL handling is not implemented.
- The app lacks localization files, offline storage, push notifications, analytics instrumentation, error reporting, and production release automation.
- The app has no native Android or iOS project folders yet. Generate and configure both platform targets before release engineering begins.
- The backend supports password login and Google ID-token login, but it does not yet expose an Apple login endpoint or store Apple identity-provider linkage.
- The mobile theme does not match the canonical web token system.

---

## 4. Design-System Parity

Design parity is a release requirement, not a final polish pass.

### Canonical Web Palette

The dashboard and brand specification define the default TrustGrid identity:

| Token | Value | Meaning |
|---|---|---|
| Brand Indigo | `#4F46E5` | Authority, credibility, institutional trust |
| Brand Teal | `#0D9488` | Community, relationships, openness |
| Cyan Gradient End | `#06B6D4` | Energy and connectedness |
| Canvas | `#F8FAFC` | App background |
| Surface | `#FFFFFF` | Cards, sheets, dialogs |
| Border | `#E2E8F0` | Quiet separation |
| Verified | `#059669` | Verified trust state |
| Pending | `#D97706` | Needs action or review |
| Incident | `#E11D48` | Serious concern |
| Unverified | `#64748B` | Neutral or incomplete state |

### Existing Mobile Drift to Correct

The current Flutter theme uses `#1E40AF` as its primary colour. This should be replaced with the web default `#4F46E5`. Mobile must also adopt the web semantic tokens, gradient treatments, trust-grade colours, border radius scale, shadows, and passport styling.

### Shared Token Contract

Create a versioned design-token file and consume it in both web and Flutter:

```text
packages/design-tokens/
  tokens.json
  src/index.ts
  generated/trustgrid_tokens.dart
```

The token build should generate:

- TypeScript exports for Next.js apps
- Dart constants and `ThemeExtension` objects for Flutter
- Validation for institution branding overrides

### Flutter Design-System Package

Create:

```text
frontend/lib/design_system/
  tokens/
  theme/
  components/
  patterns/
```

Required reusable components:

- `TgAppShell`
- `TgTopBar`
- `TgBottomNav`
- `TgWorkspaceSwitcher`
- `TgCard`
- `TgSectionHeader`
- `TgStatusBadge`
- `TgTrustRing`
- `TgTrustGauge`
- `TgPassportCard`
- `TgCredentialCard`
- `TgOpportunityCard`
- `TgEmptyState`
- `TgErrorState`
- `TgLoadingSkeleton`
- `TgSearchField`
- `TgFilterSheet`
- `TgConfirmationSheet`
- `TgOfflineBanner`

### White-Label Theming

Keep the existing institution-brand endpoint and extend the mobile model to support:

```json
{
  "displayName": "RCCG Trust Network",
  "tagline": "Verified Members. Trusted Communities.",
  "primaryColor": "#8B0000",
  "accentColor": "#FFD700",
  "logoUrl": "https://cdn.example.org/logo.png",
  "backgroundImageUrl": "https://cdn.example.org/auth.jpg",
  "backgroundOverlayOpacity": 0.65,
  "appName": "RCCG Trust",
  "poweredByVisible": true,
  "terminology": {
    "community": "Parish",
    "operator": "Coordinator",
    "opportunity": "Service Opportunity"
  }
}
```

Branding rules:

- Load the last valid brand configuration from local storage before the first frame.
- Refresh branding in the background.
- Validate colour contrast before applying overrides.
- Preserve semantic colours for verified, pending, and incident states.
- Allow institution colours to affect primary actions, headers, accents, and branded passport areas.
- Never allow branding to make warnings or verification states ambiguous.

---

## 5. App Architecture

### Recommended Structure

```text
frontend/lib/
  app/
    app.dart
    bootstrap.dart
    router.dart
    session/
  core/
    api/
    auth/
    cache/
    config/
    errors/
    permissions/
    telemetry/
  design_system/
  features/
    admin/
    analytics/
    assignments/
    auth/
    billing/
    blacklist/
    catalog/
    community/
    gate/
    incidents/
    onboarding/
    opportunities/
    organisations/
    passport/
    profile/
    residents/
    service_requests/
    settings/
    volunteers/
    workforce/
```

Each feature should contain:

```text
data/
domain/
presentation/
```

Do not continue adding unrelated screens directly under `frontend/lib/screens/`. Move incrementally by feature while preserving working routes.

### Session and Permission Model

On login:

1. Authenticate using phone number or email.
2. Save access and refresh tokens securely.
3. Fetch `/auth/me`.
4. Fetch `/authority/me/permissions`.
5. Resolve available workspaces from roles and permissions.
6. Restore the last active workspace where permitted.
7. Route to the workspace home screen.

`institutionId` must be optional in the session. Tenant-aware workspaces should set an active institution context; platform-admin workflows must remain valid without one.

The UI must hide unavailable actions, but the API remains the security boundary.

### Multi-Role Workspace Switching

Add a workspace switcher in the profile menu and home header:

```text
My Trust
Community Operations
My Organisation
Platform Admin
```

This avoids forcing a person with multiple roles to log out and sign in again.

### State Management

Use Riverpod consistently:

- `AsyncNotifier` for server-backed feature state
- Immutable domain models generated from API schemas
- Explicit loading, refreshing, empty, error, and offline states
- Optimistic updates only for low-risk actions such as availability toggles
- Server confirmation before security-sensitive changes such as revocation, blacklist, approvals, or authority assignment

### API Contract

Generate the mobile API client from the backend OpenAPI schema where practical. At minimum, generate typed request and response models to prevent the current spread of untyped `Map<String, dynamic>` parsing.

### Authentication Matrix

| Authentication method | Android | iOS | Backend requirement |
|---|---|---|---|
| Phone number + password | Required | Required | Existing `/auth/login` |
| Email + password | Required | Required | Existing `/auth/login` |
| Forgot-password OTP | Required | Required | Existing reset endpoints |
| Sign in with Apple | Optional on Android | Required on iOS | New `/auth/apple` endpoint and Apple token verification |
| Sign in with Google | Required on Android | Optional on iOS | Existing Google backend flow; Flutter integration still required |
| Biometric unlock | Recommended | Recommended | Device-local unlock of an existing authenticated session |

### Sign in with Apple

Implement Sign in with Apple as a first-class iOS login path, not as a visual-only button.

Mobile requirements:

- Add the `sign_in_with_apple` Flutter package.
- Enable the Sign in with Apple entitlement in the iOS Runner target.
- Add a branded Apple button on the iOS login screen using Apple's required presentation style.
- Request Apple credential fields only when necessary: email and full name are typically returned only on the user's first authorization.
- Send the Apple identity token and authorization code to the backend.
- Handle Apple private-relay email addresses without treating them as suspicious or invalid.
- Preserve phone-number and email login alongside Apple login.

Backend requirements:

- Add `POST /api/v1/auth/apple`.
- Add an `AppleAuthService` that validates Apple identity-token signature, issuer, audience, expiration, nonce, and subject.
- Configure Apple Team ID, Service ID or bundle identifier, Key ID, and private key through environment variables.
- Persist the Apple `sub` identifier using a provider-link table or equivalent account-identity model.
- Match an existing account only through a deliberate account-linking policy. Do not blindly merge accounts solely because an email address matches.
- Return the same TrustGrid token payload and workspace-resolution response used by password login.
- Add revoke and unlink behavior where appropriate.

Recommended account-link model:

```text
AuthIdentity
  id
  userId
  provider          // APPLE | GOOGLE
  providerSubject   // Apple sub or Google sub
  providerEmail
  createdAt
  updatedAt

  unique(provider, providerSubject)
```

Apple configuration:

```text
APPLE_TEAM_ID
APPLE_KEY_ID
APPLE_CLIENT_ID
APPLE_PRIVATE_KEY
```

The iOS release must be tested with:

- First-time Apple authorization where email and name are returned
- Returning Apple authorization where those fields are omitted
- Apple's Hide My Email relay
- Existing TrustGrid account linking
- Revoked Apple authorization
- Invalid nonce and invalid token rejection

### Sign in with Google

Implement Sign in with Google as a required Android login path.

Mobile requirements:

- Add the official Google sign-in Flutter integration.
- Configure Android OAuth client IDs, package name, and signing-certificate fingerprints for development, staging, and production.
- Add a branded Google sign-in button on the Android login screen.
- Obtain a Google ID token on device and send it to the existing `POST /api/v1/auth/google` endpoint.
- Route the returned TrustGrid session through the same workspace-resolution flow used by password and Apple login.
- Preserve phone-number and email login alongside Google login.

Backend requirements:

- Keep server-side Google ID-token verification as the source of truth.
- Add `GOOGLE_CLIENT_ID` to validated environment configuration and production secret management.
- Replace the current private-method bypass used by `GoogleAuthService` with a supported `AuthService` token-issuing method.
- Persist Google provider linkage in the shared `AuthIdentity` model instead of relying only on an email lookup.
- Apply the same deliberate account-linking policy used for Apple login.

The Android release must be tested with:

- First-time Google authorization
- Returning Google authorization
- Existing TrustGrid account linking
- Suspended TrustGrid account rejection
- Invalid Google token rejection
- Development, staging, and production signing certificates

---

## 6. Navigation Model

Do not place every feature in one bottom navigation bar.

### Personal Workspace

Bottom navigation:

1. Home
2. Opportunities
3. Passport
4. Activity
5. Profile

### Community Operations Workspace

Bottom navigation:

1. Overview
2. People
3. Requests
4. Gate
5. More

`More` contains:

- Volunteers
- Organisations
- Applications
- Incidents
- Blacklist
- Catalog
- Residents
- Analytics
- Billing
- Settings

### Organisation Workspace

Bottom navigation:

1. Overview
2. Team
3. Assignments
4. Documents
5. Profile

### Platform Admin Workspace

Bottom navigation:

1. Overview
2. Institutions
3. Passports
4. Applications
5. More

Platform-admin workflows must be fully available on mobile, but optimized for tablet and occasional phone use. The super-admin web console remains the primary operating surface for large datasets.

---

## 7. Web-to-Mobile Parity Matrix

### Tenant Dashboard

| Web capability | Mobile destination | Mobile interaction |
|---|---|---|
| Login and forgot password | Auth | Phone or email login, reset flow, biometric unlock after first login |
| Community join links | Community onboarding | Deep link, QR scan, or community-code entry |
| Overview dashboard | Operations Overview | Cards, alerts, compact charts, action queue |
| Trust Passport | My Trust / Passport | Branded passport card, QR code, credentials, share link |
| Public passport verification | Verify | Camera scan, manual code entry, deep link |
| Gate check-in | Gate | Camera-first scanner, fallback code entry, check-in history |
| Profile | My Trust / Profile | Personal details, membership, availability, settings |
| Opportunities | Opportunities | Browse, filter, view eligibility, apply, review applications |
| Workforce registry | People / Workers | Searchable list, filters, worker detail, add worker |
| Worker passport | Worker Detail | Passport tab and QR verification |
| Volunteers | People / Volunteers | Registry, filters, availability, mobilise |
| Organisations | People / Organisations | Registry, detail, preferred and blacklist actions |
| My organisation | Organisation Workspace | Company, branches, workers, documents, assignments |
| Catalog | More / Catalog | Browse and institution-category overrides |
| Billing and plans | More / Billing | View plan, subscribe, verification payments, status |
| Applications | More / Applications | Review queue, approve, reject, request more information |
| Service requests | Requests | List, create, detail, submit, match, assign, complete |
| Incidents | More / Incidents | Report, list, detail, notes, resolve |
| Blacklist | More / Blacklist | Search, add, remove, dispute, resolve dispute |
| Analytics | More / Analytics | Mobile charts, filters, export hand-off |
| Residents | More / Residents | Registry, invite, detail |
| Settings | More / Settings | Institution details, operators, notification preferences |
| Branding | Settings / Branding | Preview and edit permitted brand fields |
| Join policy | Settings / Join Policy | Configure membership and onboarding rules |

### Platform Admin Console

| Web capability | Mobile destination | Mobile interaction |
|---|---|---|
| Platform statistics | Platform Admin Overview | KPI cards and issue queue |
| Institutions | Platform Admin / Institutions | Search, detail, status review |
| Workers | Platform Admin / Workers | Search and inspect |
| Organisations | Platform Admin / Organisations | Search and inspect |
| Passports | Platform Admin / Passports | Search, inspect, revoke with confirmation |
| Applications | Platform Admin / Applications | Review and resolve |
| Catalog | Platform Admin / Catalog | Add, edit, deactivate domains and categories |
| Settings | Platform Admin / Settings | Configuration and account settings |

### Backend-Exposed Capabilities to Surface

The backend already exposes additional capabilities that should be included in parity work:

- Community nodes and memberships
- Node verification
- Authority roles and authority assignments
- Permissions inspection
- Assignment check-in and check-out
- Credential issuing and revocation
- Expiring-credential review
- Identity photo upload, liveness session, and status review
- Organisation CAC verification
- Emergency mobilisation

---

## 8. Mobile-Specific Product Improvements

Mobile should add value instead of merely shrinking the web UI.

### Gate Mode

Build a camera-first gate mode:

- QR scan
- Manual passport-code entry
- Photo and minimum necessary credential display
- Check-in and check-out
- Recent scans
- Offline cached allowlist with expiration
- Clear offline banner
- Audit synchronization when connectivity returns

Gate mode should use large touch targets and minimal text. A future dedicated scanner binary is justified only if pilot usage shows operational need.

### Offline Support

Use a local database such as Drift or Isar for:

- Cached brand configuration
- Current user and permission snapshot
- Passport summary
- Upcoming assignments
- Opportunity summaries
- Gate allowlist and recent scans
- Pending offline check-in and check-out events

Offline policy:

- Show last synchronization time.
- Allow offline reads for cached data.
- Queue only approved low-risk mutations.
- Require connectivity for approvals, credential issuance, revocation, blacklist changes, billing, and authority changes.
- Expire cached gate credentials after a configured interval.

### Notifications

Add push notifications through Firebase Cloud Messaging and Apple Push Notification service:

- New opportunity
- Application approved or rejected
- Assignment created, changed, or cancelled
- Credential expiring
- Incident created or resolved
- Membership approved
- Gate exception
- Emergency mobilisation

Notifications deep-link to the relevant screen.

### Device Security

- Tokens in secure storage
- Optional biometric unlock
- Screenshot protection for sensitive identity screens where supported
- Rooted or jailbroken-device telemetry for high-risk operator actions
- No raw NIN or BVN in logs, analytics, or local cache
- Remote logout and token revocation

---

## 9. Delivery Phases

### Phase 0: Architecture and Design Baseline

**Duration:** 1 week

Deliverables:

- Freeze the parity matrix.
- Extract shared design tokens and generate Dart tokens.
- Replace mobile colour drift with canonical indigo and teal tokens.
- Create the Flutter design-system folder and core reusable components.
- Implement typed session, authenticated user, permissions, and workspace resolution.
- Create API environment configuration for local, staging, and production.
- Generate Flutter Android and iOS platform projects and configure signing placeholders.
- Design the account-linking model for password, Google, and Apple identities.
- Add error reporting and analytics instrumentation.

Exit criteria:

- Mobile and web show the same default palette.
- Institution branding applies before the login screen renders.
- Login routes correctly for every seeded role.
- No demo credential defaults are shipped in production builds.

### Phase 1: Personal Workspace and Trust Passport

**Duration:** 2 weeks

Deliverables:

- Personal home
- Profile
- Membership summary
- Trust Passport
- Credential list and detail
- Shareable passport link
- QR code display
- Public QR verification screen
- Opportunity list, detail, eligibility, apply, and application status
- Real assignment list and detail
- Accept, decline, check-in, and check-out
- Worker availability toggle
- Sign in with Apple button and native iOS credential flow
- Backend Apple token verification endpoint and account linking
- Sign in with Google button and native Android credential flow
- Backend Google provider-link hardening

Exit criteria:

- Worker, resident, and volunteer seeded accounts can complete their primary flows.
- A real iOS device can authenticate with Apple, including a returning-user flow.
- A real Android device can authenticate with Google, including a returning-user flow.
- No hardcoded worker-home or assignment content remains.
- A passport can be displayed, shared, scanned, and verified.

### Phase 2: Community Operations Parity

**Duration:** 3 weeks

Deliverables:

- Operations dashboard
- Workforce registry, search, filters, detail, add worker
- Worker endorsements
- Volunteers registry and mobilisation
- Organisations registry and verification summary
- Service requests, matching, assignment, and completion
- Incident reporting, notes, and resolution
- Gate scanner online mode
- Residents registry
- Applications review queue
- Analytics

Exit criteria:

- Institution admin and operator accounts can perform every operational web workflow from mobile.
- Role restrictions match backend policy.
- Gate scans create auditable check-in and check-out events.

### Phase 3: Settings, Compliance, and Organisation Workspace

**Duration:** 2 weeks

Deliverables:

- Organisation-admin workspace
- Organisation profile, documents, workers, and assignments
- Catalog browsing and permitted overrides
- Blacklist actions and dispute workflow
- Billing status and plan flows
- Institution settings
- Operators management
- Branding settings and preview
- Join-policy settings
- Credential-expiry queue
- Identity photo capture, liveness, and CAC verification surfaces

Exit criteria:

- Organisation admin account can complete its web-equivalent workflows.
- Settings changes synchronize with web immediately.
- Sensitive workflows require explicit confirmations.

### Phase 4: Platform Admin Mobile Parity

**Duration:** 2 weeks

Deliverables:

- Platform KPI overview
- Institutions
- Workers
- Organisations
- Passports and revoke flow
- Applications
- Catalog management
- Platform settings
- Tablet layout optimization

Exit criteria:

- Platform admin seeded account can access every super-admin console capability from mobile.
- Destructive actions have confirmation, reason capture where applicable, and audit logs.

### Phase 5: Offline, Notifications, Localization, and Hardening

**Duration:** 2 to 3 weeks

Deliverables:

- Offline cache and gate queue
- Conflict handling and synchronization status
- Push notifications with deep links
- Biometric unlock
- English and Nigerian Pidgin localization
- Accessibility pass
- Performance profiling on entry-level Android hardware
- Crash reporting dashboards
- Store assets, privacy disclosure, and release automation

Exit criteria:

- Gate mode survives a controlled connectivity outage.
- The app is usable on a low-memory Android device.
- Primary workflows pass accessibility review.
- Release candidates are produced automatically for Android and iOS.

### Estimated Total

**12 to 13 weeks** for a production-quality first release with full parity, assuming:

- Two Flutter engineers
- One backend engineer shared with web
- One product designer
- Part-time QA support
- Existing backend endpoints remain stable

With one engineer, expect approximately **20 to 26 weeks**. Attempting to finish faster will usually produce a demo app, not a reliable institution-facing product.

---

## 10. Engineering Workstreams

### Workstream A: Design-System Convergence

- Shared tokens
- Flutter component library
- White-label themes
- Web and mobile visual review checklist
- Screenshot regression tests for flagship screens

### Workstream B: App Foundations

- Session and permission model
- Multi-workspace navigation
- Typed API models
- Error handling
- Secure storage
- Environment configuration

### Workstream C: Feature Parity

- Personal flows
- Operations flows
- Organisation flows
- Platform-admin flows
- Settings and billing

### Workstream D: Native Capabilities

- QR scanning
- Camera capture
- Image uploads
- Deep links
- Push notifications
- Biometrics
- Offline cache

### Workstream E: Quality and Release

- Unit tests
- Widget tests
- Integration tests
- Golden screenshot tests
- Android and iOS builds
- TestFlight and Play internal testing
- Crash and performance monitoring

---

## 11. Test Strategy

### Required Automated Coverage

| Layer | Coverage |
|---|---|
| Domain models | JSON parsing, status mapping, permission mapping |
| API client | Token attachment, refresh behavior, institution header, error conversion |
| Brand system | Token generation, brand override validation, contrast fallback |
| Router | Community selection, login routing, deep links, multi-role workspace selection |
| Widgets | Passport, trust ring, badges, gate result, opportunity card, offline banner |
| Features | Login, opportunity apply, assignment acceptance, incident report, request assignment, passport verification |
| Offline | Cached reads, queued gate events, expiry, synchronization conflicts |

### Seeded Role Acceptance Matrix

Run mobile smoke tests with:

| Role | Seeded persona |
|---|---|
| Platform admin | Platform Admin |
| Institution admin | Deacon Emeka |
| Institution operator | Sister Adaeze |
| Worker | Chukwuemeka Adeyemi |
| Worker | Ngozi Okafor |
| Organisation admin | Emeka Obi |
| Resident | Funke Adeola |

Every release candidate must pass a role-specific checklist on Android and iOS.

### Visual QA

Use golden screenshot tests for:

- Community selection
- Branded login
- Personal home
- Trust Passport
- QR verification result
- Opportunities
- Operations dashboard
- Worker detail
- Gate scanner result
- Incident detail
- Organisation overview
- Platform-admin overview

Compare mobile screens with the dashboard design language: indigo and teal, trust-grade semantics, gradients, card radius, spacing rhythm, typography, and brand overrides.

---

## 12. Release Strategy

### App Variants

Use Flutter flavors:

```text
dev
staging
production
enterprise_<customer>
```

Default public store listing:

```text
TrustGrid
```

Optional enterprise listing:

```text
RCCG Trust
Redemption City Access
```

Enterprise variants should change:

- Bundle identifier
- App-store name
- App icon
- Splash screen
- Default institution slug
- Default branding

They should not fork feature code.

### CI/CD

Add:

- Static analysis
- Unit and widget tests
- Golden screenshot validation
- Android APK and App Bundle build
- iOS archive build with Sign in with Apple entitlement
- Staging deployment
- Internal tester distribution
- Store release approval gate

---

## 13. First Sprint Backlog

Start with the foundation. Do not add more one-off screens until this is complete.

1. Create `packages/design-tokens/tokens.json`.
2. Generate TypeScript and Dart token outputs.
3. Replace `TrustGridColors.primary = #1E40AF` with canonical design tokens.
4. Add semantic colour tokens and gradient helpers to Flutter.
5. Persist downloaded community-brand JSON and apply it before first render.
6. Fix the brand route mismatch: mobile currently calls `/institutions/brand`, while the backend exposes `/institution/brand`.
7. Replace separate API base-URL defaults with one flavor-aware environment configuration source.
8. Add typed `SessionState`, `AuthenticatedUser`, `Role`, `Permission`, and `Workspace`.
9. Make tenant context optional so platform-admin login works without an institution ID.
10. Fetch `/auth/me` and `/authority/me/permissions` after login and on app restore.
11. Replace worker-versus-admin branching with workspace resolution.
12. Remove hardcoded worker-home and assignment demo content.
13. Implement typed assignment providers against `/assignments/mine`.
14. Add passport feature module against `/passport/me`.
15. Add QR display and `/passport/verify/:passportCode` scan-result screen.
16. Add test fixtures for every seeded role.
17. Generate and configure Flutter Android and iOS platform targets.
18. Add an `AuthIdentity` account-link model for external identity providers.
19. Add backend `POST /auth/apple` token verification.
20. Add the native Sign in with Apple button and credential flow to the iOS login screen.
21. Harden the existing backend `POST /auth/google` flow with provider linking and supported token issuance.
22. Add the native Sign in with Google button and credential flow to the Android login screen.
23. Add a staging flavor and verify login with phone number and email on both platforms, Apple on a real iOS device, and Google on a real Android device.

---

## 14. Product Risks

| Risk | Mitigation |
|---|---|
| Full parity creates a bloated app | Use permission-based workspaces, progressive disclosure, and a focused bottom navigation per workspace. |
| White-label colours damage readability | Validate contrast and preserve semantic status colours. |
| Operators prefer web for complex work | Treat mobile as complete but adaptive; keep web optimized for bulk operations. |
| Gate connectivity is unreliable | Cache a time-bounded allowlist and queue auditable check-in events. |
| Trust score is misunderstood | Show explainable evidence, not only a grade or opaque number. |
| Sensitive identity data leaks to device cache | Cache summaries only; never store raw NIN or BVN locally. |
| Multiple enterprise binaries become expensive | Use flavors and one source tree; charge separately for branded app-store packaging. |
| Feature delivery outruns backend policy | Generate typed contracts and run seeded role acceptance tests continuously. |
| Apple returns name and email only on first authorization | Persist the first verified profile response and support returning login with Apple `sub` alone. |
| Apple private-relay email creates duplicate accounts | Use explicit provider linkage and a deliberate account-linking flow; do not merge accounts blindly by email. |
| Google accounts create accidental duplicates | Store the verified Google subject in `AuthIdentity` and require an explicit account-linking policy. |

---

## 15. Definition of Done

The mobile app is ready for production when:

- All tenant web and super-admin capabilities have a permission-gated mobile destination.
- Every seeded user role can authenticate using phone number or email.
- Android and iOS releases are built from the same Flutter codebase.
- Sign in with Apple works on the iOS release for first-time and returning users.
- Sign in with Google works on the Android release for first-time and returning users.
- Web and mobile share canonical design tokens.
- Institution branding applies consistently to login, navigation, home, and passport.
- The Trust Passport can be displayed, shared, scanned, and verified.
- Gate check-in works online and during a controlled offline test.
- No demo credentials or demo-only data ship in production builds.
- Sensitive data is excluded from logs and local cache.
- Android and iOS role-based smoke suites pass.
- Flagship screens pass visual regression review.
- Store builds are generated through CI/CD.

---

## Recommendation

Begin with Phase 0 and Phase 1. They deliver the most important product story:

> A person joins a branded community, signs in with phone or email, receives a portable Trust Passport, sees trust-gated opportunities, accepts an assignment, and presents a QR credential that an operator can verify.

That workflow tests the central TrustGrid hypothesis. The remaining parity phases should build on that foundation without compromising design quality or creating separate apps for each role.
