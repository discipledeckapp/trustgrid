# White-Label / Multi-Tenant Setup Guide

## Architecture

```
rccg.trustgrid.ng          → Community portal, RCCG-branded
lekki-estate.trustgrid.ng  → Community portal, estate-branded
portal.rccg.org            → Custom domain (Enterprise tier)
app.trustgrid.ng           → Default TrustGrid dashboard
```

One Next.js deploy on Vercel handles all of these. Middleware reads the host header,
extracts the community slug, and all pages fetch + apply the community's brand config.

The Flutter mobile app works the same way — one app in the store, user enters their
community code on first launch, app adapts to the community's colors and name.

---

## DNS Setup (Qservers registrar for trustgrid.ng)

### Records to add:

| Type  | Host                | Value                    | TTL  |
|-------|---------------------|--------------------------|------|
| A     | @                   | 76.76.21.21              | 3600 |
| A     | www                 | 76.76.21.21              | 3600 |
| A     | app                 | 76.76.21.21              | 3600 |
| A     | admin               | 76.76.21.21              | 3600 |
| A     | api                 | (Render IP or CNAME)     | 3600 |
| CNAME | *                   | cname.vercel-dns.com     | 3600 |

The wildcard CNAME (`*`) catches all community subdomains → Vercel → your dashboard app.

---

## Vercel Setup

### Free tier (hackathon): register subdomains explicitly

Go to Vercel → trustgrid-dashboard project → Settings → Domains → Add:
- `rccg.trustgrid.ng`
- `lekki-estate.trustgrid.ng`
- (add more as communities sign up)

Each one resolves to the same Next.js app. Middleware handles the routing.

### Pro tier (production): wildcard domain

Add `*.trustgrid.ng` as a single domain entry. Vercel provisions a wildcard SSL cert.
Any new community subdomain works automatically without touching Vercel.

Cost: $20/month → include in your Enterprise tier pricing.

---

## Custom Domains (Enterprise Feature)

When a community wants `portal.rccg.org`:

1. Community admin goes to Dashboard → Settings → Branding → Custom Domain
2. Enters `portal.rccg.org`
3. TrustGrid shows them: `CNAME portal → cname.vercel-dns.com`
4. They add the CNAME at their registrar
5. In Vercel (Pro), add `portal.rccg.org` as a domain on the dashboard project
6. Vercel auto-provisions SSL cert
7. TrustGrid marks `customDomainEnabled: true` on the institution

This feature requires:
- Vercel Pro (for custom domain + auto-SSL)
- Manual Vercel domain add per customer (or Vercel API automation)

---

## How the Mobile App Works Per Community

### First Launch Flow:
```
App opens
  └── No community saved?
        └── Show CommunitySelectScreen
              └── User enters "rccg"
                    └── Fetch GET /api/v1/institutions/brand?host=rccg.trustgrid.ng
                          └── Get brandConfig { primaryColor, accentColor, displayName, ... }
                                └── Save to SharedPreferences
                                      └── Rebuild app with community theme
                                            └── Navigate to Login screen
                                                  └── Shows "Sign in to RCCG Trust"
```

### Returning User:
```
App opens
  └── Community "rccg" found in storage
        └── Load brand config (refresh from API in background)
              └── App renders with RCCG colors immediately
                    └── Navigate to Login
```

### Deep Links:
```
rccg.trustgrid.ng/join    → Opens app → sets community to rccg → Login
trustgrid://join/rccg     → Same via URL scheme
```

QR codes on physical Trust Passports link to `rccg.trustgrid.ng/join` — scanning with
a phone camera opens the app or the web join flow.

---

## Billing Integration

| Feature                   | Starter | Growth | Professional | Enterprise |
|---------------------------|---------|--------|--------------|------------|
| trustgrid.ng subdomain    | ✗       | ✓      | ✓            | ✓          |
| Custom brand colors       | ✗       | ✓      | ✓            | ✓          |
| Logo in verify page       | ✗       | ✓      | ✓            | ✓          |
| Custom domain             | ✗       | ✗      | ✗            | ✓          |
| Remove "Powered by TrustGrid" | ✗   | ✗      | ✗            | ✓          |
| Mobile app name           | TrustGrid | TrustGrid | Your name | Your name |

---

## Brand Config JSON Shape

Stored as JSON on `Institution.brandConfig`:

```json
{
  "displayName": "RCCG Trust Network",
  "tagline": "Verified Members. Trusted Communities.",
  "primaryColor": "#8B0000",
  "accentColor": "#FFD700",
  "logoUrl": "https://cdn.rccg.org/trust-logo.png",
  "faviconUrl": "https://cdn.rccg.org/favicon.png",
  "appName": "RCCG Trust",
  "poweredByVisible": true
}
```

`poweredByVisible: false` only available on Enterprise. Enforced server-side.
