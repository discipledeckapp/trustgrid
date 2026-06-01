import * as Sentry from '@sentry/nestjs'
import { nodeProfilingIntegration } from '@sentry/profiling-node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  integrations: [nodeProfilingIntegration()],
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  profilesSampleRate: 0.1,
  enabled: !!process.env.SENTRY_DSN,
  beforeSend(event) {
    // Strip PII from error events
    if (event.request?.data) {
      const data = event.request.data as Record<string, unknown>
      if (data.password) data.password = '[REDACTED]'
      if (data.idNumber) data.idNumber = '[REDACTED]'
    }
    return event
  },
})
