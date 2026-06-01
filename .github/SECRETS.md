# GitHub Secrets Required

Set these in: GitHub repo → Settings → Secrets and variables → Actions

## Render
| Secret | Where to get it |
|--------|----------------|
| `RENDER_DEPLOY_HOOK_URL` | Render dashboard → your service → Settings → Deploy Hook → copy URL |

## Vercel
| Secret | Where to get it |
|--------|----------------|
| `VERCEL_TOKEN` | vercel.com → Settings → Tokens → Create token |
| `VERCEL_ORG_ID` | `npx vercel whoami` or Vercel project settings |
| `VERCEL_WEB_PROJECT_ID` | Vercel → trustgrid-web project → Settings → Project ID |
| `VERCEL_DASHBOARD_PROJECT_ID` | Vercel → trustgrid-dashboard project → Settings → Project ID |
| `VERCEL_APP_PROJECT_ID` | Vercel → trustgrid-app project → Settings → Project ID |

## Services
| Secret | Where to get it |
|--------|----------------|
| `RESEND_API_KEY` | resend.com → API Keys → Create key (for demo request emails) |
| `SENTRY_DSN` | sentry.io → Project → Settings → Client Keys (DSN) |
