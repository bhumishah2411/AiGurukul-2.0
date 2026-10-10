import { DocumentRepository, DocumentChunkRepository } from '../repositories/index.js';
import { ObjectStorageProvider } from '@ai-gurukul/storage';
import { EmbeddingProvider, SemanticChunker } from '@ai-gurukul/embeddings';
import { VectorStoreProvider, VectorRecord } from '@ai-gurukul/vector-store';
import {
  DocumentDTO,
  DocumentChunkDTO,
  DocumentListQueryDTO,
  DocumentListResponseDTO,
  DocumentUploadRequestDTO,
  NotFoundError,
  BadRequestError,
} from '@ai-gurukul/types';

export class DocumentService {
  private docRepo: DocumentRepository;
  private chunkRepo: DocumentChunkRepository;
  private storage: ObjectStorageProvider;
  private embeddingProvider: EmbeddingProvider;
  private vectorStore: VectorStoreProvider;
  private chunker: SemanticChunker;

  constructor(
    docRepo: DocumentRepository,
    chunkRepo: DocumentChunkRepository,
    storage: ObjectStorageProvider,
    embeddingProvider: EmbeddingProvider,
    vectorStore: VectorStoreProvider
  ) {
    this.docRepo = docRepo;
    this.chunkRepo = chunkRepo;
    this.storage = storage;
    this.embeddingProvider = embeddingProvider;
    this.vectorStore = vectorStore;
    this.chunker = new SemanticChunker();
  }

  public async uploadDocument(
    payload: DocumentUploadRequestDTO,
    uploadedBy?: string
  ): Promise<DocumentDTO> {
    const rawFileName =
      payload.fileName || `${payload.title.toLowerCase().replace(/[^a-z0-9]+/g, '_')}.txt`;
    const safeFileName = rawFileName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const storageKey = `documents/${Date.now()}_${safeFileName}`;
    const buffer = Buffer.from(payload.content, 'utf-8');

    // 1. Upload to Object Storage
    await this.storage.upload(storageKey, buffer, {
      contentType: payload.mimeType || 'text/plain',
    });

    // 2. Create Document record in MongoDB
    const doc = await this.docRepo.create({
      title: payload.title.trim(),
      fileName: safeFileName,
      fileSize: buffer.byteLength,
      mimeType: payload.mimeType || 'text/plain',
      storageKey,
      domain: payload.domain.trim().toLowerCase(),
      language: payload.language || 'en',
      author: payload.author?.trim(),
      era: payload.era?.trim(),
      status: 'pending',
      chunkCount: 0,
      tokenCount: 0,
      uploadedBy: uploadedBy || 'system',
    });

    // 3. Process indexing pipeline
    await this.processDocumentDirectly(doc.id);

    // 4. Return updated DTO
    const updated = await this.docRepo.findById(doc.id);
    return (updated || doc).toDTO();
  }

  public async listDocuments(query: DocumentListQueryDTO = {}): Promise<DocumentListResponseDTO> {
    const page = query.page || 1;
    const limit = query.limit || 20;

    const result = await this.docRepo.findWithPagination(
      {
        domain: query.domain,
        status: query.status,
        search: query.search,
      },
      { page, limit }
    );

    return {
      documents: result.items.map((d) => d.toDTO()),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  public async getDocumentById(
    id: string
  ): Promise<{ document: DocumentDTO; chunks: DocumentChunkDTO[] }> {
    const doc = await this.docRepo.findById(id);
    if (!doc) {
      throw new NotFoundError(`Document with ID '${id}' not found`);
    }

    const chunks = await this.chunkRepo.findByDocumentId(id);
    return {
      document: doc.toDTO(),
      chunks: chunks.map((c) => c.toDTO()),
    };
  }

  public async deleteDocument(id: string): Promise<{ success: boolean; id: string }> {
    const doc = await this.docRepo.findById(id);
    if (!doc) {
      throw new NotFoundError(`Document with ID '${id}' not found`);
    }

    // 1. Delete file from storage
    try {
      await this.storage.delete(doc.storageKey);
    } catch {
      // Ignore if file doesn't exist
    }

    // 2. Delete vectors from vector store
    await this.vectorStore.deleteByFilter({ documentId: id });

    // 3. Delete chunks from database
    await this.chunkRepo.deleteByDocumentId(id);

    // 4. Delete document record
    await this.docRepo.deleteById(id);

    return { success: true, id };
  }

  public async processDocumentDirectly(documentId: string): Promise<void> {
    const doc = await this.docRepo.findById(documentId);
    if (!doc) {
      throw new NotFoundError(`Document with ID '${documentId}' not found for processing`);
    }

    try {
      // 1. Status -> extracting
      await this.docRepo.updateStatus(documentId, 'extracting');
      const buffer = await this.storage.downloadBuffer(doc.storageKey);
      const text = buffer.toString('utf-8');

      if (!text.trim()) {
        throw new BadRequestError('Document content cannot be empty');
      }

      // 2. Status -> chunking
      await this.docRepo.updateStatus(documentId, 'chunking');
      const rawChunks = this.chunker.chunk(text, {
        maxChunkSize: 600,
        chunkOverlap: 100,
      });

      if (rawChunks.length === 0) {
        throw new BadRequestError('No valid chunks generated from document content');
      }

      // 3. Status -> embedding
      await this.docRepo.updateStatus(documentId, 'embedding');

      // Clean prior chunks and vectors if re-indexing
      await this.chunkRepo.deleteByDocumentId(documentId);
      await this.vectorStore.deleteByFilter({ documentId });

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
            documentId: doc.id,
            title: doc.title,
            domain: doc.domain,
            language: doc.language,
            author: doc.author,
          },
        });

        vectorRecords.push({
          id: `${doc.id}_chunk_${chunk.chunkIndex}`,
          values: emb.embedding,
          metadata: {
            documentId: doc.id,
            canonicalReference: chunk.canonicalReference,
            domain: doc.domain,
            chunkText: chunk.text,
            chunkIndex: chunk.chunkIndex,
            title: doc.title,
            author: doc.author,
          },
        });
      }

      // 4. Insert chunks and upsert vectors
      await this.chunkRepo.createMany(chunkDocs);
      await this.vectorStore.upsert(vectorRecords);

      // 5. Status -> indexed
      await this.docRepo.updateStatus(documentId, 'indexed', {
        chunkCount: rawChunks.length,
        tokenCount: totalTokens,
      });
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      await this.docRepo.updateStatus(documentId, 'failed', { errorMessage });
      throw err;
    }
  }
}
