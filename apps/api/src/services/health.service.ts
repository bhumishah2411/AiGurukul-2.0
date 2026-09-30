import { DatabaseService } from '@ai-gurukul/database';
import Redis from 'ioredis';
import { HealthStatus } from '@ai-gurukul/types';

export class HealthService {
  private dbService?: DatabaseService;
  private redisClient?: Redis;
  private startTime: number;

  constructor(dbService?: DatabaseService, redisClient?: Redis) {
    this.dbService = dbService;
    this.redisClient = redisClient;
    this.startTime = Date.now();
  }

  public getLiveness(): HealthStatus {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };
  }

  public async getReadiness(): Promise<{ isReady: boolean; details: HealthStatus }> {
    const services: HealthStatus['services'] = {};
    let isReady = true;

    // Check MongoDB
    if (this.dbService) {
      const dbPing = await this.dbService.ping();
      services.database = {
        status: dbPing.healthy ? 'up' : 'down',
        latencyMs: dbPing.latencyMs,
      };
      if (!dbPing.healthy) isReady = false;
    }

    // Check Redis
    if (this.redisClient) {
      const start = Date.now();
      try {
        const pong = await this.redisClient.ping();
        const latencyMs = Date.now() - start;
        services.redis = {
          status: pong === 'PONG' ? 'up' : 'down',
          latencyMs,
        };
        if (pong !== 'PONG') isReady = false;
      } catch {
        services.redis = { status: 'down', latencyMs: Date.now() - start };
        isReady = false;
      }
    }

    return {
      isReady,
      details: {
        status: isReady ? 'ok' : 'degraded',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        uptime: Math.floor((Date.now() - this.startTime) / 1000),
        services,
      },
    };
  }
}
