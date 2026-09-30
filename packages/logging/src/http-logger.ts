import { pinoHttp } from 'pino-http';
import { Logger } from 'pino';
import { Request, Response } from 'express';

export function createHttpLogger(logger: Logger) {
  return pinoHttp({
    logger,
    genReqId: (req: Request) => {
      const incomingId = req.headers['x-request-id'] || req.headers['x-correlation-id'];
      if (incomingId && typeof incomingId === 'string') {
        return incomingId;
      }
      return crypto.randomUUID();
    },
    customLogLevel: (req: Request, res: Response, err?: Error) => {
      if (res.statusCode >= 500 || err) return 'error';
      if (res.statusCode >= 400) return 'warn';
      return 'info';
    },
    customSuccessMessage: (req: Request, res: Response) => {
      return `${req.method} ${req.url} - ${res.statusCode}`;
    },
    customErrorMessage: (req: Request, res: Response, err: Error) => {
      return `${req.method} ${req.url} - ${res.statusCode}: ${err.message}`;
    },
  });
}
