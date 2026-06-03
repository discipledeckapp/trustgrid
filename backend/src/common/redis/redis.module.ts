import { Global, Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

export const REDIS_CLIENT = 'REDIS_CLIENT'

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const url = config.get<string>('REDIS_URL')
        // Only connect if a valid Redis URL is configured
        if (!url || !url.startsWith('redis')) {
          return null  // cache degrades gracefully — app works without Redis
        }
        try {
          return new Redis(url, {
            maxRetriesPerRequest: 3,
            enableReadyCheck: false,
            lazyConnect: true,
            tls: url.startsWith('rediss://') ? {} : undefined,
          })
        } catch {
          return null
        }
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
