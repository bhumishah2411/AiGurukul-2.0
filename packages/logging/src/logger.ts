import { pino, Logger, LoggerOptions } from 'pino';

export interface CreateLoggerOptions {
  name: string;
  level?: string;
  isProduction?: boolean;
}

export function createLogger(options: CreateLoggerOptions): Logger {
  const isProd = options.isProduction ?? process.env.NODE_ENV === 'production';
  const level = options.level || process.env.LOG_LEVEL || (isProd ? 'info' : 'debug');

  const pinoOptions: LoggerOptions = {
    name: options.name,
    level,
    redact: {
      paths: [
        'req.headers.authorization',
        'req.headers.cookie',
        'req.body.password',
        'req.body.refreshToken',
        'password',
        'token',
        'secret',
      ],
      remove: true,
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  };

  if (!isProd) {
    return pino({
      ...pinoOptions,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      },
    });
  }

  return pino(pinoOptions);
}

export { Logger };
