import { describe, it, expect, vi } from 'vitest';
import { DatabaseService } from './connection.js';
import { MigrationRunner, MigrationScript, MigrationModel } from './migration.js';
import { createLogger } from '@ai-gurukul/logging';
import mongoose from 'mongoose';

describe('Database Package Unit Tests', () => {
  const logger = createLogger({ name: 'test-db', level: 'silent' });

  it('initializes DatabaseService singleton with options', () => {
    const service = DatabaseService.getInstance({
      uri: 'mongodb://localhost:27017/test_db',
      logger,
    });
    expect(service).toBeDefined();
    expect(DatabaseService.getInstance()).toBe(service);
  });

  it('returns connection readyState', () => {
    const service = DatabaseService.getInstance();
    expect(typeof service.readyState).toBe('number');
  });

  it('ping returns health status structure without throwing', async () => {
    const service = DatabaseService.getInstance();
    const result = await service.ping();
    expect(result).toHaveProperty('healthy');
    expect(result).toHaveProperty('latencyMs');
    expect(typeof result.latencyMs).toBe('number');
  });

  it('MigrationRunner computes status report accurately', async () => {
    // Mock find on MigrationModel
    const findSpy = vi.spyOn(MigrationModel, 'find').mockReturnValue({
      sort: () => ({
        lean: () => ({
          exec: async () => [{ id: '001_init.ts', batch: 1, appliedAt: new Date() }],
        }),
      }),
    } as any);

    const runner = new MigrationRunner(mongoose.connection, logger);
    const testMigrations: MigrationScript[] = [
      { id: '001_init.ts', up: async () => {}, down: async () => {} },
      { id: '002_add_indexes.ts', up: async () => {}, down: async () => {} },
    ];

    const status = await runner.getStatus(testMigrations);
    expect(status.appliedCount).toBe(1);
    expect(status.pendingCount).toBe(1);
    expect(status.pending).toContain('002_add_indexes.ts');

    findSpy.mockRestore();
  });
});
