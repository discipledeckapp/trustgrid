import { Params } from 'nestjs-pino'

export const pinoLoggerConfig: Params = {
  pinoHttp: {
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    transport:
      process.env.NODE_ENV !== 'production'
        ? { target: 'pino-pretty', options: { colorize: true, singleLine: true } }
        : undefined,
    redact: {
      paths: ['req.headers.authorization', 'req.body.password', 'req.body.idNumber'],
      censor: '[REDACTED]',
    },
    customProps: () => ({ service: 'trustgrid-api' }),
    serializers: {
      req(req) {
        return {
          method: req.method,
          url: req.url,
          institutionId: req.headers['x-institution-id'],
        }
      },
      res(res) {
        return { statusCode: res.statusCode }
      },
    },
  },
}
