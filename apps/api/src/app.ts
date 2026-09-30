import express, { Express, Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { Logger, createHttpLogger } from '@ai-gurukul/logging';
import { ApiConfig } from '@ai-gurukul/config';
import { NotFoundError } from '@ai-gurukul/types';
import { requestIdMiddleware } from './middlewares/request-id.middleware.js';
import { createErrorMiddleware } from './middlewares/error.middleware.js';
import { createApiRouter } from './routes/index.js';
import { HealthController } from './controllers/health.controller.js';
import { HealthService } from './services/health.service.js';
import { DatabaseService } from '@ai-gurukul/database';
import Redis from 'ioredis';

export interface CreateAppOptions {
  config: ApiConfig;
  logger: Logger;
  dbService?: DatabaseService;
  redisClient?: Redis;
}

export function createApp(options: CreateAppOptions): Express {
  const { config, logger, dbService, redisClient } = options;
  const app = express();

  // 1. Basic security headers
  app.use(helmet());

  // 2. Strict CORS
  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    })
  );

  // 3. Request body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // 4. Observability: Request ID & Structured HTTP logging
  app.use(requestIdMiddleware);
  app.use(createHttpLogger(logger));

  // 5. Wire controllers and services
  const healthService = new HealthService(dbService, redisClient);
  const healthController = new HealthController(healthService);

  // 6. Mount API routers
  const apiRouter = createApiRouter({ healthController });
  app.use(apiRouter);

  // 7. Catch-all 404 handler
  app.use((req: Request, _res: Response, next: NextFunction) => {
    next(new NotFoundError(`Endpoint not found: ${req.method} ${req.originalUrl}`));
  });

  // 8. Centralized error handling middleware
  app.use(createErrorMiddleware(logger));

  return app;
}
