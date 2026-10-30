import { loadApiConfig } from '@ai-gurukul/config';
import { createLogger } from '@ai-gurukul/logging';
import {
  DatabaseService,
  seedCanonicalWisdom,
  seedCanonicalKnowledgeGraph,
  seedCanonicalDocuments,
  seedCanonicalQuizzes,
  seedCanonicalManuscripts,
} from '@ai-gurukul/database';
import Redis from 'ioredis';
import { createApp } from './app.js';
import { Server } from 'node:http';

process.on('unhandledRejection', (reason, promise) => {
  console.error('⚠️ [API Process] Unhandled Promise Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('🚨 [API Process] Uncaught Exception:', err);
});

async function bootstrap(): Promise<void> {
  const config = loadApiConfig();
  const logger = createLogger({ name: 'ai-gurukul-api', level: config.LOG_LEVEL });

  logger.info({ environment: config.NODE_ENV }, 'Starting AI Gurukul API Service...');

  // Initialize MongoDB connection
  const dbService = DatabaseService.getInstance({
    uri: config.MONGODB_URI,
    logger,
  });

  try {
    await dbService.connect();
    // Run idempotent seeds asynchronously in background without blocking server port binding
    (async () => {
      try {
        await seedCanonicalWisdom().catch(() => {});
        await seedCanonicalKnowledgeGraph().catch(() => {});
        await seedCanonicalDocuments().catch(() => {});
        await seedCanonicalQuizzes().catch(() => {});
        await seedCanonicalManuscripts().catch(() => {});
        logger.info('Canonical seeds initialized in background');
      } catch (err) {
        logger.warn({ err }, 'Background canonical seeds completed with warnings');
      }
    })();
  } catch (error) {
    logger.warn({ error }, 'MongoDB initial connection failed; continuing in degraded mode');
  }

  // Initialize Redis client only if explicitly configured via environment variable
  let redisClient: Redis | undefined;
  const rawRedisUrl = process.env.REDIS_URL;
  const isRedisConfigured =
    Boolean(rawRedisUrl) && rawRedisUrl !== 'redis://localhost:6379';

  if (isRedisConfigured && rawRedisUrl) {
    try {
      const candidate = new Redis(rawRedisUrl, {
        maxRetriesPerRequest: 1,
        connectTimeout: 2500,
        retryStrategy: () => null,
        lazyConnect: true,
      });
      candidate.on('error', () => {});
      await candidate.connect();
      redisClient = candidate;
      logger.info('Connected to Redis successfully');
    } catch (error) {
      logger.warn({ error }, 'Redis connection failed; running in degraded mode with memory store');
      redisClient = undefined;
    }
  } else {
    logger.info('No external Redis configured; using in-memory store for rate limiting');
  }

  // Create Express application
  const app = createApp({
    config,
    logger,
    dbService,
    redisClient,
  });

  // Explicitly bind to 0.0.0.0 for containerized / Render port scanning
  const host = '0.0.0.0';
  const server: Server = app.listen(config.PORT, host, () => {
    logger.info(`✨ AI Gurukul API running on port ${config.PORT} [${config.NODE_ENV}] (bound to ${host})`);
    logger.info(`👉 Health check: http://${host}:${config.PORT}/health/live`);
  });

  // Graceful shutdown handling
  let isShuttingDown = false;
  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}. Initiating graceful shutdown...`);

    // Force exit timeout
    const forceExitTimer = setTimeout(() => {
      logger.error('Graceful shutdown timed out. Forcing process exit.');
      process.exit(1);
    }, 10000);
    forceExitTimer.unref();

    try {
      // 1. Close HTTP server
      await new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      });
      logger.info('HTTP server closed successfully');

      // 2. Disconnect Redis
      if (redisClient) {
        await redisClient.quit().catch(() => {});
        logger.info('Redis client disconnected');
      }

      // 3. Disconnect MongoDB
      await dbService.disconnect();
      logger.info('Database disconnected');

      logger.info('Graceful shutdown complete. Exiting.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during graceful shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Fatal initialization error:', err);
  process.exit(1);
});
