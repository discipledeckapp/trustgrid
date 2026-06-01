import { Controller, Get } from '@nestjs/common'
import { HealthCheck, HealthCheckService, HealthIndicatorResult } from '@nestjs/terminus'
import { ApiTags, ApiOperation } from '@nestjs/swagger'
import { PrismaService } from '../../prisma/prisma.service'

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'API health check — verifies database connectivity' })
  check() {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.prisma.$queryRaw`SELECT 1`
          return { database: { status: 'up' } }
        } catch {
          return { database: { status: 'down' } }
        }
      },
    ])
  }

  @Get('ping')
  @ApiOperation({ summary: 'Liveness probe — returns 200 if process is alive' })
  ping() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: Math.round(process.uptime()),
      environment: process.env.NODE_ENV ?? 'development',
    }
  }
}
