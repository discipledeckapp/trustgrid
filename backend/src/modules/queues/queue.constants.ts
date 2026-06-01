export const QUEUES = {
  TRUST_SCORE: 'trust-score',
  NOTIFICATIONS: 'notifications',
  VERIFICATION: 'verification',
} as const

export const TRUST_SCORE_JOBS = {
  RECOMPUTE: 'recompute',
  EMIT_EVENT: 'emit-event',
} as const

export const NOTIFICATION_JOBS = {
  PUSH: 'push',
  WHATSAPP: 'whatsapp',
  EMAIL: 'email',
} as const

export const VERIFICATION_JOBS = {
  PROCESS: 'process',
} as const
