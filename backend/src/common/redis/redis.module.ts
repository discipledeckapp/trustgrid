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
        if (!url) return null   // graceful fallback — caching just won't work
        return new Redis(url, {
          maxRetriesPerRequest: 3,
          enableReadyCheck: false,
          tls: url.startsWith('rediss://') ? {} : undefined,
        })
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
