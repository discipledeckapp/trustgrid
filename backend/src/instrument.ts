import * as Sentry from '@sentry/nestjs'

const integrations = []

try {
  // Profiling is optional: unsupported Node ABIs should not prevent API startup.
  const { nodeProfilingIntegration } = require('@sentry/profiling-node')
  integrations.push(nodeProfilingIntegration())
} catch {
  // Error reporting still works without the native CPU profiler.
}

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV ?? 'development',
  integrations,
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.2 : 1.0,
  profilesSampleRate: integrations.length > 0 ? 0.1 : 0,
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
