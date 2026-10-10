import { describe, it, expect, vi } from 'vitest';
import { QUEUE_NAMES } from './queues/queue.constants.js';
import { BaseWorkerService } from './services/base.worker.js';
import { DocumentIngestionWorker } from './services/document-ingestion.worker.js';
import { createLogger } from '@ai-gurukul/logging';
import Redis from 'ioredis';
import { Job } from 'bullmq';
import { IngestionJobPayload } from '@ai-gurukul/types';

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

// Mock Mongoose models
vi.mock('@ai-gurukul/database', () => {
  return {
    DocumentModel: {
      findById: vi.fn(),
    },
    DocumentChunkModel: {
      deleteMany: vi.fn().mockResolvedValue({ deletedCount: 0 }),
      insertMany: vi.fn().mockResolvedValue([]),
    },
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

  it('instantiates DocumentIngestionWorker successfully', async () => {
    const mockStorage = {
      providerName: 'local',
      upload: vi.fn(),
      downloadStream: vi.fn(),
      downloadBuffer: vi.fn().mockResolvedValue(Buffer.from('Test wisdom content')),
      getSignedUrl: vi.fn(),
      delete: vi.fn(),
      exists: vi.fn().mockResolvedValue(true),
    };

    const mockEmbedding = {
      providerName: 'local',
      dimensions: 384,
      generateEmbedding: vi
        .fn()
        .mockResolvedValue({ embedding: new Array(384).fill(0.1), dimensions: 384 }),
      generateEmbeddings: vi
        .fn()
        .mockResolvedValue([{ embedding: new Array(384).fill(0.1), dimensions: 384 }]),
    };

    const mockVectorStore = {
      providerName: 'local',
      upsert: vi.fn().mockResolvedValue(undefined),
      query: vi.fn().mockResolvedValue([]),
      delete: vi.fn().mockResolvedValue(undefined),
      deleteByFilter: vi.fn().mockResolvedValue(undefined),
    };

    const ingestionWorker = new DocumentIngestionWorker(
      redisMock,
      logger,
      mockStorage,
      mockEmbedding,
      mockVectorStore
    );

    expect(ingestionWorker.queueName).toBe(QUEUE_NAMES.DOCUMENT_INGESTION);
    await expect(ingestionWorker.close()).resolves.toBeUndefined();
  });
});
