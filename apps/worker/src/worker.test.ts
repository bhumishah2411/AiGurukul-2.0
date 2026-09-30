import { describe, it, expect, vi } from 'vitest';
import { QUEUE_NAMES } from './queues/queue.constants.js';
import { BaseWorkerService } from './services/base.worker.js';
import { createLogger } from '@ai-gurukul/logging';
import Redis from 'ioredis';
import { Job } from 'bullmq';

// Mock BullMQ Worker
vi.mock('bullmq', () => {
  return {
    Worker: vi.fn().mockImplementation((queueName, processor, opts) => ({
      name: queueName,
      opts,
      processor,
      on: vi.fn(),
      close: vi.fn().mockResolvedValue(undefined),
    })),
  };
});

describe('Worker Application Unit Tests', () => {
  const logger = createLogger({ name: 'test-worker', level: 'silent' });
  const redisMock = {} as Redis;

  class TestWorkerService extends BaseWorkerService<{ text: string }, { success: boolean }> {
    protected async processJob(job: Job<{ text: string }>): Promise<{ success: boolean }> {
      return { success: job.data.text.length > 0 };
    }
  }

  it('defines required queue names for async architecture', () => {
    expect(QUEUE_NAMES.DOCUMENT_INGESTION).toBe('document-ingestion');
    expect(QUEUE_NAMES.EMBEDDING_GENERATION).toBe('embedding-generation');
    expect(QUEUE_NAMES.AI_ASYNC).toBe('ai-async');
  });

  it('instantiates BaseWorkerService with queue name and concurrency options', async () => {
    const worker = new TestWorkerService(QUEUE_NAMES.DOCUMENT_INGESTION, redisMock, logger, {
      concurrency: 5,
    });

    expect(worker.queueName).toBe(QUEUE_NAMES.DOCUMENT_INGESTION);
    await expect(worker.close()).resolves.toBeUndefined();
  });
});
