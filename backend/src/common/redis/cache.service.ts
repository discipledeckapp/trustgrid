import { Injectable, Inject, Logger } from '@nestjs/common'
import { Redis } from 'ioredis'
import { REDIS_CLIENT } from './redis.module'

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name)

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis | null) {}

  async get<T>(key: string): Promise<T | null> {
    if (!this.redis) return null
    try {
      const value = await this.redis.get(key)
      return value ? (JSON.parse(value) as T) : null
    } catch (err) {
      this.logger.warn({ key, err }, 'cache_get_failed')
      return null
    }
  }

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    if (!this.redis) return
    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds)
    } catch (err) {
      this.logger.warn({ key, err }, 'cache_set_failed')
    }
  }

  async del(key: string): Promise<void> {
    if (!this.redis) return
    try {
      await this.redis.del(key)
    } catch (err) {
      this.logger.warn({ key, err }, 'cache_del_failed')
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.redis) return
    try {
      const keys = await this.redis.keys(pattern)
      if (keys.length > 0) await this.redis.del(...keys)
    } catch (err) {
      this.logger.warn({ pattern, err }, 'cache_del_pattern_failed')
    }
  }

  trustScoreKey(workerId: string, institutionId: string): string {
    return `trust:score:${institutionId}:${workerId}`
  }

  dashboardKey(institutionId: string): string {
    return `dashboard:${institutionId}`
  }
}
