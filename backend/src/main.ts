// Sentry must be imported before everything else
import './instrument'

import { NestFactory } from '@nestjs/core'
import { ValidationPipe, VersioningType } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { Logger } from 'nestjs-pino'
import helmet from 'helmet'
import { AppModule } from './app.module'
import { SentryInterceptor } from './common/interceptors/sentry.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true })

  // Use Pino as the app logger
  app.useLogger(app.get(Logger))

  // Security
  app.use(helmet())
  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? [
      'http://localhost:3001',
      'https://trustgrid.ng',
      'https://app.trustgrid.ng',
      'https://admin.trustgrid.ng',
    ],
    credentials: true,
  })

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  )

  // Global Sentry interceptor — captures unhandled errors
  app.useGlobalInterceptors(new SentryInterceptor())

  // API versioning — defaultVersion means all controllers get /v1/ without @Version decorators
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' })
  app.setGlobalPrefix('api')

  // Swagger — disabled in production
  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('TrustGrid API')
      .setDescription('Community Workforce & Service Governance Platform')
      .setVersion('1.0')
      .addBearerAuth()
      .addApiKey(
        { type: 'apiKey', name: 'X-Institution-ID', in: 'header' },
        'institution-id',
      )
      .build()
    SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config))
  }

  const port = process.env.PORT ?? 3000
  await app.listen(port)
}

bootstrap()
