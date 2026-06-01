import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validateEnv } from './config/env.validation'
import { ThrottlerModule } from '@nestjs/throttler'
import { LoggerModule } from 'nestjs-pino'
import { PrismaModule } from './prisma/prisma.module'
import { RedisModule } from './common/redis/redis.module'
import { HealthModule } from './common/health/health.module'
import { EncryptionModule } from './common/encryption/encryption.module'
import { EmailModule } from './common/email/email.module'
import { QueuesModule } from './modules/queues/queues.module'
import { AuthModule } from './modules/auth/auth.module'
import { InstitutionsModule } from './modules/institutions/institutions.module'
import { WorkforceModule } from './modules/workforce/workforce.module'
import { IdentityModule } from './modules/identity/identity.module'
import { TrustScoreModule } from './modules/trust-score/trust-score.module'
import { EndorsementsModule } from './modules/endorsements/endorsements.module'
import { ServiceRequestsModule } from './modules/service-requests/service-requests.module'
import { AssignmentsModule } from './modules/assignments/assignments.module'
import { IncidentsModule } from './modules/incidents/incidents.module'
import { PerformanceModule } from './modules/performance/performance.module'
import { VendorsModule } from './modules/vendors/vendors.module'
import { VolunteersModule } from './modules/volunteers/volunteers.module'
import { AnalyticsModule } from './modules/analytics/analytics.module'
import { BlacklistModule } from './modules/blacklist/blacklist.module'
import { CatalogModule } from './modules/catalog/catalog.module'
import { BillingModule } from './modules/billing/billing.module'
import { ConfigModule as AppConfigModule } from './modules/config/config.module'
import { OnboardingModule } from './modules/onboarding/onboarding.module'
import { CommunityModule } from './modules/community/community.module'
import { AuthorityModule } from './modules/authority/authority.module'
import { TrustPassportModule } from './modules/trust-passport/trust-passport.module'
import { OpportunitiesModule } from './modules/opportunities/opportunities.module'
import { pinoLoggerConfig } from './common/logger/logger.config'

@Module({
  imports: [
    // Config — must be first; validates env vars at startup and crashes fast if misconfigured
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),

    // Structured logging
    LoggerModule.forRoot(pinoLoggerConfig),

    // Rate limiting
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 1000,  limit: 10  },  // 10 req/sec
      { name: 'medium', ttl: 10000, limit: 50  },  // 50 req/10sec
      { name: 'long',   ttl: 60000, limit: 200 },  // 200 req/min
    ]),

    // Infrastructure
    PrismaModule,
    RedisModule,
    HealthModule,
    EncryptionModule,
    EmailModule,
    QueuesModule,

    // Domain modules
    AuthModule,
    InstitutionsModule,
    OnboardingModule,
    WorkforceModule,
    IdentityModule,
    TrustScoreModule,
    EndorsementsModule,
    ServiceRequestsModule,
    AssignmentsModule,
    IncidentsModule,
    PerformanceModule,
    VendorsModule,
    BlacklistModule,
    CatalogModule,
    BillingModule,
    VolunteersModule,
    AnalyticsModule,
    AppConfigModule,

    // Community Trust Infrastructure (Vision Refactor)
    CommunityModule,
    AuthorityModule,
    TrustPassportModule,
    OpportunitiesModule,
  ],
})
export class AppModule {}
