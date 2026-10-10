import { Job } from 'bullmq';
import Redis from 'ioredis';
import { Logger } from '@ai-gurukul/logging';
import { IngestionJobPayload } from '@ai-gurukul/types';
import { DocumentModel, DocumentChunkModel } from '@ai-gurukul/database';
import { ObjectStorageProvider } from '@ai-gurukul/storage';
import { EmbeddingProvider, SemanticChunker } from '@ai-gurukul/embeddings';
import { VectorStoreProvider, VectorRecord } from '@ai-gurukul/vector-store';
import { BaseWorkerService } from './base.worker.js';
import { QUEUE_NAMES } from '../queues/queue.constants.js';

export interface IngestionResult {
  documentId: string;
  chunkCount: number;
  tokenCount: number;
}

export class DocumentIngestionWorker extends BaseWorkerService<
  IngestionJobPayload,
  IngestionResult
> {
  private storage: ObjectStorageProvider;
  private embeddingProvider: EmbeddingProvider;
  private vectorStore: VectorStoreProvider;
  private chunker: SemanticChunker;

  constructor(
    redisConnection: Redis,
    logger: Logger,
    storage: ObjectStorageProvider,
    embeddingProvider: EmbeddingProvider,
    vectorStore: VectorStoreProvider
  ) {
    super(QUEUE_NAMES.DOCUMENT_INGESTION, redisConnection, logger, {
      concurrency: 2,
    });
    this.storage = storage;
    this.embeddingProvider = embeddingProvider;
    this.vectorStore = vectorStore;
    this.chunker = new SemanticChunker();
  }

  protected async processJob(
    job: Job<IngestionJobPayload, IngestionResult>,
    jobLogger: Logger
  ): Promise<IngestionResult> {
    const { documentId, storageKey } = job.data;
    jobLogger.info({ documentId, storageKey }, 'Processing document ingestion pipeline');

    // 1. Fetch document record from MongoDB
    const doc = await DocumentModel.findById(documentId);
    if (!doc) {
      throw new Error(`Document not found for ingestion: ${documentId}`);
    }

    try {
      // 2. Extract stage
      doc.status = 'extracting';
      await doc.save();
      await job.updateProgress(15);

      const buffer = await this.storage.downloadBuffer(storageKey);
      const textContent = buffer.toString('utf-8');

      if (!textContent.trim()) {
        throw new Error(`Document content is empty for storageKey: ${storageKey}`);
      }

      // 3. Chunking stage
      doc.status = 'chunking';
      await doc.save();
      await job.updateProgress(35);

      const rawChunks = this.chunker.chunk(textContent, {
        maxChunkSize: 600,
        chunkOverlap: 100,
      });

      if (rawChunks.length === 0) {
        throw new Error('No valid chunks generated from document content');
      }

      jobLogger.info({ chunkCount: rawChunks.length }, 'Generated document chunks');

      // 4. Embedding & Vector Indexing stage
      doc.status = 'embedding';
      await doc.save();
      await job.updateProgress(55);

      // Remove any prior chunks/vectors for this document for clean idempotency
      await DocumentChunkModel.deleteMany({ documentId: doc._id });
      await this.vectorStore.deleteByFilter({ documentId: doc._id.toString() });

      const texts = rawChunks.map((c) => c.text);
      const embeddings = await this.embeddingProvider.generateEmbeddings(texts);

      const chunkDocs = [];
      const vectorRecords: VectorRecord[] = [];
      let totalTokens = 0;

      for (let i = 0; i < rawChunks.length; i++) {
        const chunk = rawChunks[i];
        const emb = embeddings[i];
        totalTokens += chunk.tokenCount;

        chunkDocs.push({
          documentId: doc._id,
          chunkIndex: chunk.chunkIndex,
          text: chunk.text,
          tokenCount: chunk.tokenCount,
          canonicalReference: chunk.canonicalReference,
          metadata: {
            documentId: doc._id.toString(),
            title: doc.title,
            domain: doc.domain,
            language: doc.language,
            author: doc.author,
          },
        });

        vectorRecords.push({
          id: `${doc._id.toString()}_chunk_${chunk.chunkIndex}`,
          values: emb.embedding,
          metadata: {
            documentId: doc._id.toString(),
            canonicalReference: chunk.canonicalReference,
            domain: doc.domain,
            chunkText: chunk.text,
            chunkIndex: chunk.chunkIndex,
            title: doc.title,
            author: doc.author,
          },
        });
      }

      // 5. Bulk write to MongoDB chunks & VectorStore
      await DocumentChunkModel.insertMany(chunkDocs);
      await this.vectorStore.upsert(vectorRecords);
      await job.updateProgress(90);

      // 6. Complete status
      doc.status = 'indexed';
      doc.chunkCount = rawChunks.length;
      doc.tokenCount = totalTokens;
      doc.errorMessage = undefined;
      await doc.save();
      await job.updateProgress(100);

      jobLogger.info(
        { documentId, chunkCount: rawChunks.length, totalTokens },
        'Document ingestion successfully completed'
      );

      return {
        documentId: doc._id.toString(),
        chunkCount: rawChunks.length,
        tokenCount: totalTokens,
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      jobLogger.error({ documentId, err }, 'Failed document ingestion pipeline');

      doc.status = 'failed';
      doc.errorMessage = errorMsg;
      await doc.save().catch(() => {});

      throw err;
    }
  }
}
