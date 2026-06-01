import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection string'),

  // JWT
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_ACCESS_EXPIRY:  z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // App
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3000),
  CORS_ORIGINS: z.string().optional(),

  // Redis (optional — cache degrades gracefully without it)
  REDIS_URL: z.string().optional(),

  // Sentry (optional — errors still logged without it)
  SENTRY_DSN: z.string().optional(),

  // Identity verification
  // MOCK = dev/test (no API calls)  |  LIVE = Prembly + Rekognition  |  MANUAL = always skip to human review
  IDENTITY_ADAPTER: z.enum(['MOCK', 'LIVE', 'MANUAL']).default('MOCK'),

  // Prembly IdentityPass (required when IDENTITY_ADAPTER=LIVE)
  PREMBLY_API_KEY: z.string().optional(),
  PREMBLY_APP_ID:  z.string().optional(),

  // Storage (optional in MVP)
  AWS_ACCESS_KEY_ID:     z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),
  AWS_REGION:            z.string().optional(),
  AWS_S3_BUCKET:         z.string().optional(),
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config)

  if (!result.success) {
    const errors = result.error.errors
      .map((e) => `  ${e.path.join('.')}: ${e.message}`)
      .join('\n')

    throw new Error(
      `\n\n❌ Invalid environment variables:\n${errors}\n\nCheck your .env file against .env.example\n`,
    )
  }

  return result.data
}
