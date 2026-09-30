import { loadApiConfig } from '@ai-gurukul/config';
import { createLogger } from '@ai-gurukul/logging';
import { DatabaseService } from '@ai-gurukul/database';
import Redis from 'ioredis';
import { createApp } from './app.js';
import { Server } from 'node:http';

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
  } catch (error) {
    logger.warn({ error }, 'MongoDB initial connection failed; continuing in degraded mode');
  }

  // Initialize Redis client
  const redisClient = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
  });

  try {
    await redisClient.connect();
    logger.info('Connected to Redis successfully');
  } catch (error) {
    logger.warn({ error }, 'Redis initial connection failed; continuing in degraded mode');
  }

  // Create Express application
  const app = createApp({
    config,
    logger,
    dbService,
    redisClient,
  });

  const server: Server = app.listen(config.PORT, () => {
    logger.info(`✨ AI Gurukul API running on port ${config.PORT} [${config.NODE_ENV}]`);
    logger.info(`👉 Health check: http://localhost:${config.PORT}/health/live`);
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
      await redisClient.quit().catch(() => {});
      logger.info('Redis client disconnected');

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
