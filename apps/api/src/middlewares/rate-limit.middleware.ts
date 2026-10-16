import { Request, Response, NextFunction } from 'express';
import Redis from 'ioredis';
import { Logger } from '@ai-gurukul/logging';

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
  redisClient?: Redis;
  logger?: Logger;
  message?: string;
}

interface InMemoryRecord {
  timestamps: number[];
}

export function createRateLimiter(options: RateLimiterOptions) {
  const {
    windowMs,
    maxRequests,
    keyPrefix = 'rl',
    redisClient,
    logger,
    message = 'Too many requests from this IP, please try again later.',
  } = options;

  // In-memory fallback if Redis is unavailable
  const inMemoryStore = new Map<string, InMemoryRecord>();

  // Periodic memory cleanup every 60 seconds
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of inMemoryStore.entries()) {
      record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
      if (record.timestamps.length === 0) {
        inMemoryStore.delete(key);
      }
    }
  }, 60000);
  cleanupInterval.unref(); // Do not block Node event loop

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown-client';
    const clientKey = `${keyPrefix}:${ip}`;
    const now = Date.now();

    // 1. Redis-backed Sliding Window
    if (redisClient && redisClient.status === 'ready') {
      try {
        const windowStart = now - windowMs;
        const multi = redisClient.multi();

        // Remove old entries outside current window
        multi.zremrangebyscore(clientKey, 0, windowStart);
        // Add current request timestamp as member and score
        multi.zadd(clientKey, now, `${now}:${Math.random().toString(36).slice(2, 7)}`);
        // Count entries in current window
        multi.zcard(clientKey);
        // Set TTL on the key to ensure automatic cleanup
        multi.pexpire(clientKey, windowMs);

        const results = await multi.exec();
        const requestCount = results && results[2] ? (results[2][1] as number) : 1;

        res.setHeader('X-RateLimit-Limit', maxRequests);
        res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - requestCount));
        res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

        if (requestCount > maxRequests) {
          const retryAfterSec = Math.ceil(windowMs / 1000);
          res.setHeader('Retry-After', retryAfterSec);
          res.status(429).json({
            success: false,
            error: {
              code: 'TOO_MANY_REQUESTS',
              message,
              retryAfterSeconds: retryAfterSec,
            },
            timestamp: new Date().toISOString(),
          });
          return;
        }

        return next();
      } catch (err) {
        if (logger) {
          logger.warn({ err }, 'Redis rate limiter failure, falling back to in-memory store');
        }
        // Fallback to memory below
      }
    }

    // 2. In-Memory Sliding Window Fallback
    let record = inMemoryStore.get(clientKey);
    if (!record) {
      record = { timestamps: [] };
      inMemoryStore.set(clientKey, record);
    }

    record.timestamps = record.timestamps.filter((t) => now - t < windowMs);
    record.timestamps.push(now);

    const count = record.timestamps.length;
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));

    if (count > maxRequests) {
      const retryAfterSec = Math.ceil(windowMs / 1000);
      res.setHeader('Retry-After', retryAfterSec);
      res.status(429).json({
        success: false,
        error: {
          code: 'TOO_MANY_REQUESTS',
          message,
          retryAfterSeconds: retryAfterSec,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}
