import { loadWorkerConfig } from '@ai-gurukul/config';
import { createLogger } from '@ai-gurukul/logging';
import { DatabaseService } from '@ai-gurukul/database';
import Redis from 'ioredis';

async function bootstrapWorker(): Promise<void> {
  const config = loadWorkerConfig();
  const logger = createLogger({ name: 'ai-gurukul-worker', level: config.LOG_LEVEL });

  logger.info({ environment: config.NODE_ENV }, 'Starting AI Gurukul BullMQ Worker Daemon...');

  // Database connection
  const dbService = DatabaseService.getInstance({
    uri: config.MONGODB_URI,
    logger,
  });

  try {
    await dbService.connect();
  } catch (error) {
    logger.warn({ error }, 'MongoDB connection warning in worker daemon');
  }

  // Redis client for BullMQ
  const redisClient = new Redis(config.REDIS_URL, {
    maxRetriesPerRequest: null, // Required for BullMQ
    lazyConnect: true,
  });

  try {
    await redisClient.connect();
    logger.info('Worker successfully connected to Redis broker');
  } catch (error) {
    logger.warn({ error }, 'Redis connection warning in worker daemon');
  }

  logger.info('🚀 BullMQ Worker Daemon active and listening for background tasks');

  // Graceful shutdown
  let isShuttingDown = false;
  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    logger.info(`Received ${signal}. Shutting down worker daemon...`);

    const forceTimer = setTimeout(() => {
      logger.error('Worker shutdown timed out. Exiting forcefully.');
      process.exit(1);
    }, 10000);
    forceTimer.unref();

    try {
      await redisClient.quit().catch(() => {});
      await dbService.disconnect().catch(() => {});
      logger.info('Worker daemon closed all connections cleanly.');
      process.exit(0);
    } catch (err) {
      logger.error({ err }, 'Error during worker shutdown');
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

bootstrapWorker().catch((err) => {
  console.error('Fatal worker error:', err);
  process.exit(1);
});
